import express from "express";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRouter);

app.get("/api", (req, res) => {
  res.send("Server is running");
});

export default app;
