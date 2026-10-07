import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/auth.types";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userId || !req.userRole) {
      res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
      return;
    }
    if (!roles.includes(req.userRole)) {
      res.status(403).json({ success: false, error: { message: "No tenes permisos para acceder" } });
      return;
    }
    next();
  };
}
