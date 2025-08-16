import { Server } from "socket.io";
import generateAiResponse from "../services/ai.service.js";
import {
  createMessage,
  getConversationHistory,
} from "../services/message.service.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";

export const initSocket = (httpServer) => {
  const CLIENT_URLS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URLS,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.use((socket, next) => {
    // Accept token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // Attach user info to socket
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.user.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.user.id}`);
    });

    // Removed in-memory socket.history

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
      const conversationId =
        payload.conversation ||
        payload.conversationId ||
        payload.conversation_id ||
        payload.conversationID;
      const prompt = payload.prompt || payload.content || payload.text;

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

      // Save user message with sender === 'user'
      let userMessage;
      try {
        userMessage = await createMessage({
          conversation: conversationId,
          sender: "user",
          content: prompt,
        });
      } catch (err) {
        console.error("Failed to save user message:", err.message || err);
        socket.emit("error", "Failed to save message");
        return;
      }

      console.log("User message saved:", userMessage);
      // notify the client that message was saved
      socket.emit("message_saved", userMessage);

      try {
        // Fetch conversation history from the database or service
        // You need to implement getConversationHistory in your message service
        const history = await getConversationHistory(conversationId);

        const response = await generateAiResponse(prompt, history);

        // Save AI response
        const aiMessage = await createMessage({
          conversation: conversationId,
          sender: "assistant",
          content: response,
        });

        // send the AI response text and the saved message object
        socket.emit("response", { text: response, message: aiMessage });
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
