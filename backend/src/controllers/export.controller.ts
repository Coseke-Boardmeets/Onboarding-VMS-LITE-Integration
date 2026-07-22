import { Request, Response } from "express";
import * as visitorService from "../services/visitor.service";
import { exportVisitorsToCSV } from "../services/visitor.export";

export const exportVisitorsCSV = async (req: Request, res: Response) => {
    try {
        // Get all visitors
        const visitors = await visitorService.findAll();

        // Convert to CSV
        const csv = exportVisitorsToCSV(visitors);

        // Set response headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="visitors-${new Date().toISOString()}.csv"`
        );

        // Send CSV
        res.send(csv);
    } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ error: "Failed to export visitors" });
    }
};