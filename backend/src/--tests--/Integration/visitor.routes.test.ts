import request from "supertest";
import express from "express";
import { visitorRouter } from "../../routes/visitor.routes";
import * as visitorService from "../../services/visitor.service";

// Mock the service
jest.mock("../../services/visitor.service");

// Mock the auth middleware
jest.mock("../../middleware/auth.middleware", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: "user-123", email: "test@example.com" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/visitors", visitorRouter);

describe("Visitor API Routes", () => {
  describe("POST /visitors", () => {
    it("should create a visitor with valid data", async () => {
      const mockVisitor = {
        id: "uuid-123",
        fullName: "John Doe",
        purpose: "Interview",
        status: "PENDING",
        timeIn: null,
        timeOut: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (visitorService.create as jest.Mock).mockResolvedValue(mockVisitor);

      const response = await request(app)
        .post("/visitors")
        .send({
          fullName: "John Doe",
          purpose: "Interview",
        });

      expect(response.status).toBe(201);
      expect(response.body.fullName).toBe("John Doe");
      expect(response.body.status).toBe("PENDING");
    });

    it("should reject visitor without fullName", async () => {
      const response = await request(app)
        .post("/visitors")
        .send({
          purpose: "Interview",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("fullName is required");
    });

    it("should reject visitor with short fullName", async () => {
      const response = await request(app)
        .post("/visitors")
        .send({
          fullName: "J",
          purpose: "Interview",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("at least 2 characters");
    });
  });

  describe("GET /visitors", () => {
    it("should return all visitors", async () => {
      const mockVisitors = [
        {
          id: "uuid-123",
          fullName: "John Doe",
          purpose: "Interview",
          status: "PENDING",
          timeIn: null,
          timeOut: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (visitorService.findAll as jest.Mock).mockResolvedValue(mockVisitors);

      const response = await request(app).get("/visitors");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].fullName).toBe("John Doe");
    });
  });

  describe("PUT /visitors/:id/checkin", () => {
    it("should check in a visitor", async () => {
      const mockVisitor = {
        id: "uuid-123",
        fullName: "John Doe",
        purpose: "Interview",
        status: "CHECKED_IN",
        timeIn: new Date(),
        timeOut: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (visitorService.checkIn as jest.Mock).mockResolvedValue(mockVisitor);

      const response = await request(app).put("/visitors/uuid-123/checkin");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("CHECKED_IN");
    });

    it("should return 404 for non-existent visitor", async () => {
      const error: any = new Error("Visitor not found");
      error.code = "P2025";
      (visitorService.checkIn as jest.Mock).mockRejectedValue(error);

      const response = await request(app).put("/visitors/invalid-id/checkin");

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /visitors/:id/checkout", () => {
    it("should check out a visitor", async () => {
      const mockVisitor = {
        id: "uuid-123",
        fullName: "John Doe",
        purpose: "Interview",
        status: "CHECKED_OUT",
        timeIn: new Date(),
        timeOut: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (visitorService.checkOut as jest.Mock).mockResolvedValue(mockVisitor);

      const response = await request(app).put("/visitors/uuid-123/checkout");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("CHECKED_OUT");
    });
  });
});