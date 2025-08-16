import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ],
    credentials: true, // allow cookies and Authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(cookieParser());
app.use("/api/users", userRouter);
app.use("/api/conversations", conversationRouter);

app.get("/api", (req, res) => {
  res.send("Server is running");
});

export default app;
