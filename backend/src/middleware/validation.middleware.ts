import { Request, Response, NextFunction } from "express";

/**
 * Middleware: Validates the request body for POST /visitors.
 *
 * Single Responsibility: This function ONLY validates.
 * It should NOT create records or interact with the database.
 *
 * If validation passes, call next() to proceed to the controller.
 * If validation fails, respond with HTTP 400 and a descriptive error message.
 */
export function validateCreateVisitor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { fullName, purpose } = req.body;
  if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
    return res
      .status(400)
      .json({ error: "fullName is required and must be a non-empty string" });
  }

  if (fullName.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "fullName must be at least 2 characters long" });
  }

  if (!purpose || typeof purpose !== "string" || purpose.trim() === "") {
    return res
      .status(400)
      .json({ error: "purpose is required and must be a non-empty string" });
  }
  next();
}
