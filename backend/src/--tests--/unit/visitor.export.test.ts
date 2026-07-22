import { exportVisitorsToCSV } from "../../services/visitor.export";

describe("Export Visitors Feature (TDD)", () => {
  it("should export visitors to CSV format", async () => {
    const mockVisitors = [
      {
        id: "1",
        fullName: "John Doe",
        purpose: "Interview",
        status: "CHECKED_IN",
        timeIn: new Date("2026-06-18T10:00:00"),
        timeOut: null,
        createdAt: new Date("2026-06-18T09:00:00"),
        updatedAt: new Date("2026-06-18T10:00:00"),
      },
    ];

    const csv = exportVisitorsToCSV(mockVisitors);

    expect(csv).toContain("John Doe");
    expect(csv).toContain("Interview");
    expect(csv).toContain("CHECKED_IN");
    expect(csv).toContain("id,fullName,purpose,status");
  });
});
