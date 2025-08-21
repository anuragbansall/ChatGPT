import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-default-secure-random-string";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatgpt";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "chat-gpt";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production.");
}

if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "GEMINI_API_KEY environment variable must be set in production."
  );
}

if (!process.env.PINECONE_API_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "PINECONE_API_KEY environment variable must be set in production."
  );
}

// In production require a MONGODB_URI, but allow a default local DB during development
if (!process.env.MONGODB_URI && process.env.NODE_ENV === "production") {
  throw new Error(
    "MONGODB_URI environment variable must be set in production."
  );
}

export {
  PORT,
  JWT_SECRET,
  MONGODB_URI,
  GEMINI_API_KEY,
  PINECONE_API_KEY,
  INDEX_NAME,
};
