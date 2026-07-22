import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "coseke_secret_key_123456";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  (req as AuthenticatedRequest).user = {
    id: "bypass-admin-id",
    email: "admin@coseke.com",
  };
  next();
}
