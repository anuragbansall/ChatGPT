import Conversation from "../models/conversation.model.js";
import { createConversation } from "../services/conversation.service.js";
import { createMessage } from "../services/message.service.js";
import Message from "../models/message.model.js";
import { validationResult } from "express-validator";

export const createConversationController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title } = req.body;
  const userId = req.user._id;

  try {
    const conversation = await createConversation({ title, user: userId });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversations = async (req, res) => {
  const userId = req.user._id;

  try {
    const conversations = await Conversation.find({ user: userId });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversationById = async (req, res) => {
  const { id } = req.params;

  try {
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { sender, content } = req.body;
  const { id } = req.params;

  try {
    const message = await createMessage({
      conversation: id,
      sender,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await Message.find({ conversation: id });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
