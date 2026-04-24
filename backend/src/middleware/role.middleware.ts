import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    return res.sendStatus(403);
  }
  next();
};