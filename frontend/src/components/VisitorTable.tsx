// src/components/VisitorTable.tsx

import { Visitor } from "@/types/visitor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface VisitorTableProps {
  visitors: Visitor[];
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
}

// Status configuration for badge styling
const statusConfig: Record<
  Visitor["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  CHECKED_IN: {
    label: "Checked in",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  CHECKED_OUT: {
    label: "Checked out",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
};

export default function VisitorTable({
  visitors,
  onCheckIn,
  onCheckOut,
}: VisitorTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-medium text-gray-700">
              Full name
            </TableHead>
            <TableHead className="font-medium text-gray-700">
              Purpose
            </TableHead>
            <TableHead className="font-medium text-gray-700">
              Status
            </TableHead>
            <TableHead className="font-medium text-gray-700 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor) => {
            const { label, className } =
              statusConfig[visitor.status] ?? {
                label: "Unknown",
                className: "bg-gray-100 text-gray-600 border border-gray-200",
              };

            return (
              <TableRow key={visitor.id}>
                {/* Render visitor.fullName in a <td> */}
                <TableCell className="font-medium text-gray-900">
                  {visitor.fullName}
                </TableCell>

                {/* Render visitor.purpose in a <td> */}
                <TableCell className="text-gray-600">
                  {visitor.purpose}
                </TableCell>

                {/* Render a status badge in a <td> */}
                {/* Use distinct colours: PENDING = yellow, CHECKED_IN = green, CHECKED_OUT = grey */}
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
                  >
                    {label}
                  </span>
                </TableCell>

                {/* Action Buttons */}
                <TableCell className="text-right">
                  {/* Show "Check In" button ONLY if visitor.status === "PENDING" */}
                  {visitor.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => onCheckIn(visitor.id)}
                    >
                      Check in
                    </Button>
                  )}

                  {/* Show "Check Out" button ONLY if visitor.status === "CHECKED_IN" */}
                  {visitor.status === "CHECKED_IN" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onCheckOut(visitor.id)}
                    >
                      Check out
                    </Button>
                  )}

                  {/* Show "Done" label for CHECKED_OUT visitors */}
                  {visitor.status === "CHECKED_OUT" && (
                    <span className="text-sm text-gray-400">Done</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}