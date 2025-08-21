import { Server } from "socket.io";
import {
  generateAiResponse,
  generateEmbeddings,
} from "../services/ai.service.js";
import {
  createMessage,
  getConversationHistory,
} from "../services/message.service.js";
import { verifyConversationOwnership } from "../services/conversation.service.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import { getUserById } from "../services/user.service.js";
import { createMemory, queryMemory } from "../services/vector.service.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Validate that the user actually exists in the database
      const user = await getUserById(decoded.id);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Store the full user object (not just the decoded token)
      socket.user = user;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new Error("Authentication error: Token expired"));
      } else if (err.name === "JsonWebTokenError") {
        return next(new Error("Authentication error: Invalid token"));
      }
      return next(new Error("Authentication error: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.user.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.user.id}`);
    });

    socket.on("message", async (data) => {
      // If the client sent a JSON string (common from raw WebSocket or Postman), parse it.
      let payload = data;
      if (typeof data === "string") {
        try {
          payload = JSON.parse(data);
        } catch (err) {
          console.error("socket: received invalid JSON string payload", data);
          socket.emit("error", "Invalid JSON payload");
          return;
        }
      }
      // normalize payload to support multiple client shapes
      payload = payload || {};

      const conversationId = payload.conversationId;
      const prompt = payload.prompt;

      if (!conversationId) {
        console.error(
          "socket: missing conversationId in message payload",
          payload
        );
        socket.emit("error", "Missing conversationId");
        return;
      }

      if (!prompt) {
        console.error(
          "socket: missing prompt/content in message payload",
          payload
        );
        socket.emit("error", "Missing prompt/content");
        return;
      }

      // Verify that the user owns the conversation
      try {
        await verifyConversationOwnership(conversationId, socket.user._id);
      } catch (err) {
        console.error(
          "Conversation ownership verification failed:",
          err.message
        );
        socket.emit("error", "Access denied: " + err.message);
        return;
      }

      // Save user message with sender === 'user'
      let userMessage;
      let userVectors;

      try {
        // Start creating the message and generating embeddings in parallel
        [userMessage, userVectors] = await Promise.all([
          createMessage({
            conversation: conversationId,
            sender: "user",
            content: prompt,
          }),
          generateEmbeddings(prompt),
        ]);

        await createMemory({
          vectors: userVectors,
          metadata: {
            conversationId,
            userId: socket.user._id,
            text: userMessage.content,
          },
          messageId: userMessage._id,
        });
      } catch (err) {
        console.error("Failed to save user message:", err.message || err);
        socket.emit("error", "Failed to save message");
        return;
      }

      // notify the client that message was saved
      socket.emit("message_saved", userMessage);

      try {
        const memoryMatches = await queryMemory({
          queryVector: userVectors,
          metadata: {
            userId: socket.user._id,
          },
          limit: 5,
        });

        const longTermMemory = memoryMatches;

        // Fetch conversation history from the database or service
        const shortTermMemory = await getConversationHistory(conversationId);

        // Emit streaming start event
        socket.emit("stream_start", { conversationId });

        const response = await generateAiResponse(
          prompt,
          shortTermMemory,
          longTermMemory,
          (chunk) => {
            // Stream each chunk to the client immediately
            socket.emit("stream_chunk", {
              chunk,
              conversationId,
              timestamp: new Date().toISOString(),
            });
          }
        );

        // Emit streaming end event
        socket.emit("stream_end", { conversationId });

        // Save AI response
        // Start creating the AI message and generating embeddings in parallel
        const [aiMessage, aiVectors] = await Promise.all([
          createMessage({
            conversation: conversationId,
            sender: "model",
            content: response,
          }),
          generateEmbeddings(response),
        ]);

        await createMemory({
          vectors: aiVectors,
          metadata: {
            userId: socket.user._id,
            conversationId,
            text: aiMessage.content,
          },
          messageId: aiMessage._id,
        });

        // send the final response and the saved message object
        socket.emit("response", {
          text: response,
          message: aiMessage,
          conversationId,
        });
      } catch (error) {
        console.error("Error generating AI response:", error);

        let errorMessage = "Failed to generate AI response";
        if (error?.response?.status === 429) {
          errorMessage =
            "AI service rate limit exceeded. Please try again later.";
        } else if (error?.response?.status === 400) {
          errorMessage = "Invalid request to AI service.";
        } else if (error?.response?.status >= 500) {
          errorMessage =
            "AI service is currently unavailable. Please try again later.";
        } else if (error?.message) {
          errorMessage = error.message;
        }

        socket.emit("error", errorMessage);
      }
    });
  });

  return io;
};
