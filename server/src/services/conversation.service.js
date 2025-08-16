import Conversation from "../models/conversation.model.js";

export const createConversation = async ({ title, user }) => {
  try {
    const conversation = new Conversation({ title, user });
    await conversation.save();
    return conversation;
  } catch (error) {
    throw error;
  }
};
