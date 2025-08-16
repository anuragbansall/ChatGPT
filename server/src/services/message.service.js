import Message from "../models/message.model.js";

// Accept multiple possible payload shapes and validate before saving.
export const createMessage = async (payload) => {
  const conversation =
    payload.conversation || payload.conversationId || payload.conversation_id;
  const content = payload.content || payload.prompt || payload.text;
  const sender = payload.sender || "user";

  if (!conversation) {
    throw new Error("createMessage: missing conversation id");
  }

  if (!content) {
    throw new Error("createMessage: missing content");
  }

  try {
    const message = new Message({ conversation, sender, content });
    await message.save();
    return message;
  } catch (error) {
    throw error;
  }
};

export const getConversationHistory = async (conversationId) => {
  try {
    const messages = await Message.find({ conversation: conversationId }).sort({
      createdAt: 1,
    });

    return messages;
  } catch (error) {
    throw error;
  }
};
