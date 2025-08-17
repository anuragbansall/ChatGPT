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

export const getConversationById = async (conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    return conversation;
  } catch (error) {
    throw error;
  }
};

export const verifyConversationOwnership = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.user.toString() !== userId.toString()) {
      throw new Error("Access denied: You don't own this conversation");
    }

    return conversation;
  } catch (error) {
    throw error;
  }
};
