import { validationResult } from "express-validator";
import { createUser } from "../services/user.service.js";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const user = await createUser({ email, password, name });

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // send cookie only over HTTPS in production
      sameSite: "strict", // helps prevent CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User registration failed", error: error.message });
  }
};
