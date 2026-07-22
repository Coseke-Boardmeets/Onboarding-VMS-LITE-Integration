import { Visitor } from "../generated/prisma";

export function exportVisitorsToCSV(visitors: Visitor[]): string {
    if (!visitors || visitors.length === 0) {
        return "id,fullName,purpose,status,timeIn,timeOut,createdAt\n";
    }

    const headers = [
        "id",
        "fullName",
        "purpose",
        "status",
        "timeIn",
        "timeOut",
        "createdAt",
        "updatedAt"
    ];
    const rows = visitors.map((v) => [
        v.id,
        `"${v.fullName}"`,
        `"${v.purpose}"`,
        v.status,
        v.timeIn ? v.timeIn.toISOString() : "",
        v.timeOut ? v.timeOut.toISOString() : "",
        v.createdAt.toISOString(),
    ]);

    const headerRow = headers.join(",");
    const dataRows = rows.map((row) => row.join(",")).join("\n");

    return `${headerRow}\n${dataRows}`;
}
