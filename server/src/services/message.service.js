import Message from "../models/message.model.js";

export const createMessage = async ({ conversation, sender, content }) => {
  try {
    const message = new Message({ conversation, sender, content });
    await message.save();
    return message;
  } catch (error) {
    throw error;
  }
};
