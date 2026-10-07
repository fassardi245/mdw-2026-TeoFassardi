// Mapping between (HTTP method + path) and controller. No business logic here.
import { Router } from "express";
import { registerUser, login, logout } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ success: true, data: { id: req.userId, role: req.userRole } });
});

export default router;
