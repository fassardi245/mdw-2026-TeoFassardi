// Aggregates every v1 resource router. New entities get mounted here, not in server.ts.
import { Router } from "express";
import studentsRouter from "./students.routes";
import subjectsRouter from "./subjects.routes";
import authRouter from "./auth.routes";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use("/students", studentsRouter);
router.use("/subjects", subjectsRouter);
router.use("/auth", authRouter);
router.get("/admin", authMiddleware, requireRole("ADMIN"), (_req, res) => {
  res.json({ success: true, data: { message: "Bienvenido al panel de administracion" } });
});

export default router;
