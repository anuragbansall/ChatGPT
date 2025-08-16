import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/config.js";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

async function generateAiResponse(prompt, history) {
  console.log("Generating AI response for prompt:", prompt);
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
    });

    const response = await chat.sendMessage({
      message: prompt,
    });

    console.log("AI response generated:", response.text);
    return response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}

export default generateAiResponse;
