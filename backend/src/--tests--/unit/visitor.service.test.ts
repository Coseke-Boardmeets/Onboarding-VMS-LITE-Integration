import * as visitorService from "../../services/visitor.service";
import { prisma } from "../../services/db";

const mockPrisma = prisma as any;

// Mock the db module
jest.mock("../../services/db", () => {
  return {
    prisma: {
      visitor: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

describe("Visitor Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create()", () => {
    it("should create a visitor with PENDING status", async () => {
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

      mockPrisma.visitor.create.mockResolvedValue(mockVisitor);

      const result = await visitorService.create({
        fullName: "John Doe",
        purpose: "Interview",
      });

      expect(result.status).toBe("PENDING");
      expect(result.fullName).toBe("John Doe");
    });
  });

  describe("findAll()", () => {
    it("should return all visitors ordered by creation date", async () => {
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

      mockPrisma.visitor.findMany.mockResolvedValue(mockVisitors);

      const result = await visitorService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe("John Doe");
    });
  });

  describe("checkIn()", () => {
    it("should update visitor status to CHECKED_IN", async () => {
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

      mockPrisma.visitor.update.mockResolvedValue(mockVisitor);

      const result = await visitorService.checkIn("uuid-123");

      expect(result.status).toBe("CHECKED_IN");
      expect(result.timeIn).not.toBeNull();
    });
  });

  describe("checkOut()", () => {
    it("should update visitor status to CHECKED_OUT", async () => {
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

      mockPrisma.visitor.update.mockResolvedValue(mockVisitor);

      const result = await visitorService.checkOut("uuid-123");

      expect(result.status).toBe("CHECKED_OUT");
      expect(result.timeOut).not.toBeNull();
    });
  });
});
