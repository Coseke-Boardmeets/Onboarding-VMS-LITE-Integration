import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VisitorTable from "@/components/VisitorTable";
import apiClient from "@/lib/apiClient";
import { Visitor } from "@/types/visitor";

vi.mock("@/lib/apiClient");

describe("Export CSV Button", () => {
    const mockVisitors: Visitor[] = [
        {
            id: "1",
            fullName: "John Doe",
            purpose: "Interview",
            status: "PENDING",
            timeIn: null,
            timeOut: null,
            createdAt: new Date().toISOString(),
        },
    ];

    it("should render export button", () => {
        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={vi.fn()}
                onCheckOut={vi.fn()}
            />
        );

        expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("should call export API when button clicked", async () => {
        vi.mocked(apiClient.exportVisitorsCSV).mockResolvedValue(undefined);

        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={vi.fn()}
                onCheckOut={vi.fn()}
            />
        );

        const exportButton = screen.getByText("Export CSV");
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(apiClient.exportVisitorsCSV).toHaveBeenCalled();
        });
    });

    it("should disable button when no visitors", () => {
        render(
            <VisitorTable
                visitors={[]}
                onCheckIn={vi.fn()}
                onCheckOut={vi.fn()}
            />
        );

        const exportButton = screen.getByText("Export CSV");
        expect(exportButton).toBeDisabled();
    });

    it("should show error message on export failure", async () => {
        vi.mocked(apiClient.exportVisitorsCSV).mockRejectedValue(
            new Error("Export failed")
        );

        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={vi.fn()}
                onCheckOut={vi.fn()}
            />
        );

        const exportButton = screen.getByText("Export CSV");
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(screen.getByText(/Export failed:/)).toBeInTheDocument();
        });
    });
});