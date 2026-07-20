import { Router } from "express";

import {
  getAllVisitors,
  createVisitor,
  checkInVisitor,
  checkOutVisitor,
  getVisitorStats
} from "../controllers/visitor.controller";
import { validateCreateVisitor } from "../middleware/validation.middleware";
import { requireAuth } from "../middleware/auth.middleware";

export const visitorRouter = Router();
visitorRouter.get("/", requireAuth, getAllVisitors);
visitorRouter.get("/stats", requireAuth, getVisitorStats);
visitorRouter.post("/", validateCreateVisitor, createVisitor);
visitorRouter.put("/:id/checkin", requireAuth, checkInVisitor);
visitorRouter.put("/:id/checkout", requireAuth, checkOutVisitor);