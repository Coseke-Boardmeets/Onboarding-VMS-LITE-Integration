import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VisitorTable from "../../components/VisitorTable";
import { Visitor } from "@/types/visitor";

describe("VisitorTable Component", () => {
    const mockVisitors: Visitor[] = [
        {
            id: "1",
            fullName: "John Doe",
            purpose: "Interview",
            status: "PENDING",
        },
        {
            id: "2",
            fullName: "Jane Smith",
            purpose: "Meeting",
            status: "CHECKED_IN",
        },
    ];

    const mockOnCheckIn = vi.fn();
    const mockOnCheckOut = vi.fn();

    it("should render visitor table with data", () => {
        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={mockOnCheckIn}
                onCheckOut={mockOnCheckOut}
            />
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should display correct status badges", () => {
        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={mockOnCheckIn}
                onCheckOut={mockOnCheckOut}
            />
        );

        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Checked in")).toBeInTheDocument();
    });

    it("should call onCheckIn when Check In button clicked", () => {
        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={mockOnCheckIn}
                onCheckOut={mockOnCheckOut}
            />
        );

        const checkInButtons = screen.getAllByText("Check in");
        fireEvent.click(checkInButtons[0]);

        expect(mockOnCheckIn).toHaveBeenCalledWith("1");
    });

    it("should call onCheckOut when Check Out button clicked", () => {
        render(
            <VisitorTable
                visitors={mockVisitors}
                onCheckIn={mockOnCheckIn}
                onCheckOut={mockOnCheckOut}
            />
        );

        const checkOutButtons = screen.getAllByText("Check out");
        fireEvent.click(checkOutButtons[0]);

        expect(mockOnCheckOut).toHaveBeenCalledWith("2");
    });

    it("should show Completed for checked out visitors", () => {
        const checkedOutVisitor: Visitor = {
            id: "3",
            fullName: "Bob Johnson",
            purpose: "Delivery",
            status: "CHECKED_OUT",
        };

        render(
            <VisitorTable
                visitors={[checkedOutVisitor]}
                onCheckIn={mockOnCheckIn}
                onCheckOut={mockOnCheckOut}
            />
        );

        expect(screen.getByText("Completed")).toBeInTheDocument();
    });
});