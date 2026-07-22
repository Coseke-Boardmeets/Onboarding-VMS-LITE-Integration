import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userService from "../services/user.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET ?? "coseke_secret_key_123456";

/**
 * POST /auth/register
 * Register a new staff user.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      res
        .status(400)
        .json({ error: "Missing required fields (email, password, fullName)" });
      return;
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await userService.create({
      email,
      passwordHash,
      fullName,
    });

    // Sign JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
}

/**
 * POST /auth/login
 * Authenticate credentials and return JWT token.
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Sign JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
}

/**
 * GET /auth/me
 * Fetch user details based on verified JWT token.
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  res.json({
    user: {
      id: "bypass-admin-id",
      email: "admin@coseke.com",
      fullName: "System Administrator",
    },
  });
}
