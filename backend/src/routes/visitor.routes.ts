import { Router, Request, Response } from "express";
import { exportVisitorsToCSV } from "../services/visitor.export";
import * as visitorService from "../services/visitor.service";
import {
  getAllVisitors,
  createVisitor,
  checkInVisitor,
  checkOutVisitor,
  getVisitorStats,
} from "../controllers/visitor.controller";
import { validateCreateVisitor } from "../middleware/validation.middleware";
import { requireAuth } from "../middleware/auth.middleware";

export const visitorRouter = Router();

visitorRouter.get("/", requireAuth, getAllVisitors);
visitorRouter.get("/stats", requireAuth, getVisitorStats);
visitorRouter.get("/export/csv", requireAuth, async (_req: Request, res: Response) => {
  try {
    const visitors = await visitorService.findAll();
    const csv = exportVisitorsToCSV(visitors);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=visitors.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Failed to export visitors" });
  }
});
visitorRouter.post("/", validateCreateVisitor, createVisitor);
visitorRouter.put("/:id/checkin", requireAuth, checkInVisitor);
visitorRouter.put("/:id/checkout", requireAuth, checkOutVisitor);

