import { Router } from "express";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/login", loginUser);
authRouter.post("/register", registerUser);
authRouter.get("/me", requireAuth, getCurrentUser);
