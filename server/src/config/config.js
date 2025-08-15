import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-default-secure-random-string";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production.");
}

export { PORT, JWT_SECRET };
