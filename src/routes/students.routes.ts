// Mapping between (HTTP method + path) and controller. No business logic here.
import { Router } from "express";
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/students.controller";
import { validateBody } from "../middlewares/validate";
import { createStudentSchema, listStudentsSchema, updateStudentSchema } from "../schemas/student.schema";

import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

router.post("/search", validateBody(listStudentsSchema), listStudents);
router.get("/:id", getStudentById);
router.post("/", requireRole("ADMIN"), validateBody(createStudentSchema), createStudent);
router.put("/:id", requireRole("ADMIN"), validateBody(updateStudentSchema), updateStudent);
router.delete("/:id", requireRole("ADMIN"), deleteStudent);

export default router;
