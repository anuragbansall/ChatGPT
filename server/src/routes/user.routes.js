import express from "express";
import { body } from "express-validator";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protectUser } from "../middlewares/user.middleware.js";

const userRouter = express.Router();

userRouter.post(
  "/register",
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
  registerUser
);

userRouter.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  loginUser
);

userRouter.post("/logout", protectUser, logoutUser);

userRouter.get("/profile", protectUser, getUserProfile);

export default userRouter;
