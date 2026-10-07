// Mapping between (HTTP method + path) and controller. No business logic here.
import { Router } from "express";
import {
  listSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjects.controller";
import { validateBody } from "../middlewares/validate";
import { createSubjectSchema, listSubjectsSchema, updateSubjectSchema } from "../schemas/subject.schema";

import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

router.post("/search", validateBody(listSubjectsSchema), listSubjects);
router.get("/:id", getSubjectById);
router.post("/", requireRole("ADMIN"), validateBody(createSubjectSchema), createSubject);
router.put("/:id", requireRole("ADMIN"), validateBody(updateSubjectSchema), updateSubject);
router.delete("/:id", requireRole("ADMIN"), deleteSubject);

export default router;
