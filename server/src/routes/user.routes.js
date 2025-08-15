import express from "express";
import { body } from "express-validator";
import { registerUser } from "../controllers/user.controller.js";

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

export default userRouter;
