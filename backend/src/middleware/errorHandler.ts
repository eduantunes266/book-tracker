import { Request, Response, NextFunction } from "express";

// Runs when no route matched the request (e.g. GET /api/nothing-here)
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
};

// Last middleware: any error that was not handled in a controller ends up here.
// Express knows it is an error handler because it has 4 parameters.
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // express.json() could not read the body (malformed JSON)
  if ((error as { type?: string }).type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }

  // Anything else: log it on the server, but never send details to the client
  console.error("Unexpected error:", error);
  return res.status(500).json({ message: "Server error" });
};
