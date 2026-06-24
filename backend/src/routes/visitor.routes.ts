import { Router } from "express";

import {
  getAllVisitors,
  createVisitor,
  checkInVisitor,
  checkOutVisitor
} from "../controllers/visitor.controller";
import { validateCreateVisitor } from "../middleware/validation.middleware";

export const visitorRouter = Router();
visitorRouter.get("/", getAllVisitors);
visitorRouter.post("/", validateCreateVisitor, createVisitor);
visitorRouter.put("/:id/checkin", checkInVisitor);
visitorRouter.put("/:id/checkout", checkOutVisitor);