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

// Import MUI icons for premium visual indicators
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AssignmentIcon from "@mui/icons-material/Assignment";

interface VisitorTableProps {
  visitors: Visitor[];
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
}

// Status configuration for badge styling and icons
const statusConfig: Record<
  Visitor["status"],
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    icon: <AccessTimeIcon className="w-3.5 h-3.5 mr-1" />,
  },
  CHECKED_IN: {
    label: "Inside",
    className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-955/40 dark:text-emerald-300 dark:border-emerald-900 animate-pulse",
    icon: <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />,
  },
  CHECKED_OUT: {
    label: "Checked out",
    className: "bg-slate-200 text-slate-900 border border-slate-350 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
    icon: <DoneAllIcon className="w-3.5 h-3.5 mr-1" />,
  },
};

// Helper to extract initials for avatar
function getInitials(name: string) {
  if (!name) return "V";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper to generate a consistent color gradient based on name string
function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-blue-500 to-indigo-650",
    "from-emerald-500 to-teal-700",
    "from-violet-500 to-purple-700",
    "from-rose-500 to-pink-700",
    "from-amber-550 to-orange-600",
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// Helper to format timestamps beautifully
function formatTime(dateStr?: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function VisitorTable({
  visitors,
  onCheckIn,
  onCheckOut,
}: VisitorTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-950/40">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-200/50 hover:bg-slate-200/50 dark:border-slate-850 dark:bg-slate-900/40">
              <TableHead className="py-4 pl-6 font-bold text-slate-900 dark:text-slate-100">
                Visitor info
              </TableHead>
              <TableHead className="py-4 font-bold text-slate-900 dark:text-slate-100">
                Purpose
              </TableHead>
              <TableHead className="py-4 font-bold text-slate-900 dark:text-slate-100">
                Checked in
              </TableHead>
              <TableHead className="py-4 font-bold text-slate-900 dark:text-slate-100">
                Checked out
              </TableHead>
              <TableHead className="py-4 font-bold text-slate-900 dark:text-slate-100">
                Status
              </TableHead>
              <TableHead className="py-4 pr-6 font-bold text-right text-slate-900 dark:text-slate-100">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitors.map((visitor) => {
              const { label, className, icon } =
                statusConfig[visitor.status] ?? {
                  label: "Unknown",
                  className: "bg-slate-200 text-slate-900 border border-slate-300",
                  icon: null,
                };

              const avatarGradient = getAvatarGradient(visitor.fullName);
              const initials = getInitials(visitor.fullName);

              return (
                <TableRow
                  key={visitor.id}
                  className="border-slate-200/80 hover:bg-slate-100/30 dark:border-slate-850 dark:hover:bg-slate-900/10 transition-all duration-200"
                >
                  {/* Visitor Profile Cell */}
                  <TableCell className="py-4 pl-6 font-semibold text-slate-950 dark:text-white">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarGradient} text-sm font-bold text-white shadow-md shadow-indigo-200/10`}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">
                          {visitor.fullName}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                          Registered {formatDate(visitor.createdAt)} at {formatTime(visitor.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Purpose Cell */}
                  <TableCell className="py-4 text-slate-950 dark:text-white">
                    <div className="flex items-center space-x-1.5">
                      <AssignmentIcon className="w-3.5 h-3.5 text-slate-750 dark:text-slate-250" />
                      <span className="text-sm font-bold">{visitor.purpose}</span>
                    </div>
                  </TableCell>

                  {/* Checked In Time Cell */}
                  <TableCell className="py-4 text-slate-900 dark:text-slate-200 text-sm">
                    {visitor.timeIn ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {formatTime(visitor.timeIn)}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          {formatDate(visitor.timeIn)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-500 font-bold">—</span>
                    )}
                  </TableCell>

                  {/* Checked Out Time Cell */}
                  <TableCell className="py-4 text-slate-900 dark:text-slate-200 text-sm">
                    {visitor.timeOut ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {formatTime(visitor.timeOut)}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          {formatDate(visitor.timeOut)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-500 font-bold">—</span>
                    )}
                  </TableCell>

                  {/* Status Badge Cell */}
                  <TableCell className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${className}`}
                    >
                      {icon}
                      {label}
                    </span>
                  </TableCell>

                  {/* Actions Cell */}
                  <TableCell className="py-4 pr-6 text-right">
                    {visitor.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => onCheckIn(visitor.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm hover:shadow transition-all rounded-lg pl-3 pr-4"
                      >
                        <LoginIcon className="w-4 h-4 mr-1.5" />
                        Check in
                      </Button>
                    )}

                    {visitor.status === "CHECKED_IN" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onCheckOut(visitor.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm hover:shadow transition-all rounded-lg pl-3 pr-4"
                      >
                        <LogoutIcon className="w-4 h-4 mr-1.5" />
                        Check out
                      </Button>
                    )}

                    {visitor.status === "CHECKED_OUT" && (
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-250 bg-slate-200 dark:bg-slate-800 px-3.5 py-1 rounded-lg">
                        Completed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}