import { Request, Response } from "express";
import * as visitorService from "../services/visitor.service"

/**
 * GET /visitors
 * Should return all visitors as a JSON array.
 */
export async function getAllVisitors(_req: Request, res: Response) {
    try {
    const visitors = await visitorService.findAll();
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
}
/**
 * POST /visitors
 * Should create a new visitor. Body: { fullName, purpose }
 */
export async function createVisitor(req: Request, res: Response) {
    try {
    const { fullName, purpose } = req.body;
    const visitor = await visitorService.create({ fullName, purpose });
    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({ error: "Failed to create visitor" });
  }
}

/**
 * PUT /visitors/:id/checkin
 * Should mark the visitor as CHECKED_IN.
 */
export async function checkInVisitor(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const visitor = await visitorService.checkIn(id);
    res.json(visitor);
  } catch (error: any) {
    if (error.code === "P2025") {
      // Prisma: record to update not found
      return res.status(404).json({ error: "Visitor not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to check in visitor" });
  }
}

/**
 * PUT /visitors/:id/checkout
 * Should mark the visitor as CHECKED_OUT.
 */
export async function checkOutVisitor(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const visitor = await visitorService.checkOut(id);
    res.json(visitor);
  } catch (error: any) {
    if (error.code === "P2025") {
      // Prisma: record to update not found
      return res.status(404).json({ error: "Visitor not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to check out visitor" });
  }
}

/**
 * GET /visitors/stats
 * Return statistics aggregations.
 */
export async function getVisitorStats(_req: Request, res: Response) {
  try {
    const stats = await visitorService.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch visitor statistics" });
  }
}
