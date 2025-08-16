import express from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  getMessages,
} from "../controllers/conversation.controller.js";
import { protectUser } from "../middlewares/user.middleware.js";
import { body } from "express-validator";

const conversationRouter = express.Router();

conversationRouter.use(protectUser);
conversationRouter.post(
  "/",
  [body("title").notEmpty().withMessage("Title is required")],
  createConversation
);
conversationRouter.get("/", getConversations);
conversationRouter.get("/:id", getConversationById);
conversationRouter.post(
  "/:id/messages",
  [
    body("content").notEmpty().withMessage("Content is required"),
    body("sender")
      .notEmpty()
      .withMessage("Sender is required")
      .isIn(["user", "assistant"])
      .withMessage("Sender must be either 'user' or 'assistant'"),
  ],
  sendMessage
);
conversationRouter.get("/:id/messages", getMessages);

export default conversationRouter;
