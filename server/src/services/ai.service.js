import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/config.js";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

async function generateAiResponse(prompt, history = [], onChunk = null) {
  console.log("Generating AI response for prompt:", prompt);

  try {
    const formattedHistory = (history || []).map((message) => ({
      role: message.sender, // sender is already 'user' or 'model'
      parts: [{ text: message.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: formattedHistory,
    });

    const stream = await chat.sendMessageStream({
      message: prompt,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      fullResponse += chunkText;

      console.log("AI Service - Chunk received:", chunkText);

      // If a callback is provided, call it with each chunk
      if (onChunk && typeof onChunk === "function") {
        console.log("AI Service - Calling onChunk callback with:", chunkText);
        onChunk(chunkText);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}

export default generateAiResponse;
