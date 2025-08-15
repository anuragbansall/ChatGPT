import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-default-secure-random-string";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatgpt";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable must be set.");
}

export { PORT, JWT_SECRET, MONGODB_URI };
