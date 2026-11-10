import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Request with the id of the logged-in user (set by this middleware)
export interface AuthRequest extends Request {
  userId?: string;
}

// Checks the "Authorization: Bearer <token>" header.
// If the token is valid, saves the user id in req.userId and continues.
const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    const payload = jwt.verify(token, secret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
