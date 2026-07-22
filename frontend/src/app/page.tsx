// src/app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Visitor } from "@/types/visitor";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VisitorTable from "@/components/VisitorTable";
import { useAuth } from "@/components/AuthContext";

// Import MUI icons for premium styling
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface StatsPayload {
  summary: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
  purposeStats: { purpose: string; count: number }[];
  timelineStats: { date: string; count: number }[];
}

// Helper to format timestamps beautifully for analytics timeline
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MainAppPage() {
  const { user, loading: authLoading } = useAuth();

  // Authentication check bypassed: Reception Dashboard is public.

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(
    null,
  );

  // Active Viewport state
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "STATISTICS">(
    "DASHBOARD",
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Light / Dark Theme State with lazy initializer
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark)
      ? "dark"
      : "light";
  });

  // Interactive Stats Hover States
  const [hoveredTimelineIndex, setHoveredTimelineIndex] = useState<
    number | null
  >(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Sync theme with document element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  };

  // Fetch visitors list
  const fetchVisitors = useCallback(async () => {
    if (!user) return;
    try {
      const data = (await apiClient.get("/visitors")) as Visitor[];
      setVisitors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load visitors.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch statistical aggregations
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = (await apiClient.get("/visitors/stats")) as StatsPayload;
      setStats(data);
    } catch (err) {
      console.error("Failed to load statistics", err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    apiClient
      .get("/visitors")
      .then((data) => {
        if (isMounted) {
          setVisitors(data as Visitor[]);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted)
          setError(
            err instanceof Error ? err.message : "Failed to load visitors.",
          );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    apiClient
      .get("/visitors/stats")
      .then((data) => {
        if (isMounted) setStats(data as StatsPayload);
      })
      .catch((err) => console.error("Failed to load statistics", err))
      .finally(() => {
        if (isMounted) setStatsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Refresh helper
  const handleRefreshAll = () => {
    setLoading(true);
    fetchVisitors();
    fetchStats();
  };

  // Handle check-in
  async function handleCheckIn(id: string) {
    setActionError(null);
    setSuccessNotification(null);
    try {
      await apiClient.put(`/visitors/${id}/checkin`);
      setSuccessNotification("Visitor checked in successfully!");
      await fetchVisitors();
      await fetchStats();
      setTimeout(() => setSuccessNotification(null), 4000);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Check-in failed. Try again.",
      );
    }
  }

  // Handle check-out
  async function handleCheckOut(id: string) {
    setActionError(null);
    setSuccessNotification(null);
    try {
      await apiClient.put(`/visitors/${id}/checkout`);
      setSuccessNotification("Visitor checked out successfully!");
      await fetchVisitors();
      await fetchStats();
      setTimeout(() => setSuccessNotification(null), 4000);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Check-out failed. Try again.",
      );
    }
  }

  // Calculate statistics (client-side fallback for KPI counters)
  const totalCount = visitors.length;
  const activeCount = visitors.filter((v) => v.status === "CHECKED_IN").length;
  const pendingCount = visitors.filter((v) => v.status === "PENDING").length;
  const completedCount = visitors.filter(
    (v) => v.status === "CHECKED_OUT",
  ).length;

  // Filter & search logic for visitor list
  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      visitor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate coordinates for SVG Traffic Area Graph
  // Uses a 15-day timeline
  const generateChartPaths = () => {
    if (!stats || !stats.timelineStats || stats.timelineStats.length === 0) {
      return { linePath: "", areaPath: "", coordinates: [] };
    }

    const width = 500;
    const height = 180;
    const padding = 20;

    const data = stats.timelineStats;
    const maxVal = Math.max(...data.map((d) => d.count), 4);

    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (d.count / maxVal) * (height - 2 * padding);
      return { x, y, date: d.date, count: d.count };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    return { linePath, areaPath, coordinates: points };
  };

  const handleTimelineMouseMove = (
    e: React.MouseEvent<SVGSVGElement>,
    coords: Array<{ x: number; y: number; date: string; count: number }>,
  ) => {
    if (coords.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * 500;

    let closestIndex = 0;
    let minDiff = Math.abs(coords[0].x - svgX);

    for (let i = 1; i < coords.length; i++) {
      const diff = Math.abs(coords[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    setHoveredTimelineIndex(closestIndex);
  };

  const getPieSlicePath = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const purposeColors = [
    { bg: "bg-blue-600", fill: "#2563eb" },
    { bg: "bg-rose-500", fill: "#f43f5e" },
    { bg: "bg-emerald-500", fill: "#10b981" },
    { bg: "bg-amber-500", fill: "#f59e0b" },
    { bg: "bg-purple-500", fill: "#a855f7" },
    { bg: "bg-teal-500", fill: "#14b8a6" },
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading control center...
          </span>
        </div>
      </div>
    );
  }

  const { linePath, areaPath, coordinates } = generateChartPaths();

  return (
    <div className="flex min-h-screen bg-slate-100/50 dark:bg-slate-950 transition-colors duration-250">
      {/* LEFT SIDEBAR PANEL */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white/95 dark:border-slate-800/60 dark:bg-slate-900/95 p-6 shrink-0 transition-all duration-200">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Image
              src="/coseke_logo.png"
              alt="Coseke Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-955 dark:text-slate-100">
              Coseke VMS
            </h1>
            <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold tracking-wider">
              LITE INTEGRATION PORTAL
            </p>
          </div>
        </div>

        {/* Navigation Switchers */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("DASHBOARD")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === "DASHBOARD"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-700 dark:shadow-blue-700/20"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40"
              }`}
          >
            <DashboardIcon className="h-5 w-5" />
            <span>Reception Desk</span>
          </button>
          <button
            onClick={() => setActiveTab("STATISTICS")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === "STATISTICS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-700 dark:shadow-blue-700/20"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40"
              }`}
          >
            <BarChartIcon className="h-5 w-5" />
            <span>Analytics & Stats</span>
          </button>
        </nav>

        {/* Sidebar Footer Control Details */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-6 space-y-4">
          {/* User Details & Logout */}
          <div className="flex flex-col space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-205 dark:border-slate-800/50">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {user?.fullName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-semibold">
                {user?.email}
              </span>
            </div>
          </div>

          {/* System Pulse */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>Local Node: Active</span>
          </div>

          {/* Theme Selector inside sidebar bottom */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
              Theme
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {theme === "light" ? (
                <DarkModeIcon className="h-4 w-4 text-slate-900" />
              ) : (
                <LightModeIcon className="h-4 w-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE FRAME */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP COMPACT HEADER */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/90 transition-colors">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            {/* Left Mobile Navigation Tabs (visible only on mobile) */}
            <div className="flex items-center space-x-1 md:hidden bg-slate-200 dark:bg-slate-850 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("DASHBOARD")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeTab === "DASHBOARD"
                    ? "bg-white text-slate-950 dark:bg-slate-800 dark:text-white"
                    : "text-slate-655"
                  }`}
              >
                Desk
              </button>
              <button
                onClick={() => setActiveTab("STATISTICS")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeTab === "STATISTICS"
                    ? "bg-white text-slate-955 dark:bg-slate-800 dark:text-white"
                    : "text-slate-655"
                  }`}
              >
                Stats
              </button>
            </div>

            {/* Title / Tab indication */}
            <div className="hidden md:block">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-400">
                {activeTab === "DASHBOARD"
                  ? "Reception Control Center"
                  : "Analytics Operations"}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggler (mobile only) */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="md:hidden border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-750 dark:text-slate-200 dark:hover:bg-slate-800 px-3 rounded-lg"
              >
                {theme === "light" ? (
                  <DarkModeIcon className="h-4 w-4" />
                ) : (
                  <LightModeIcon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                className="border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-750 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                <RefreshIcon className="h-4 w-4 mr-1.5 text-blue-700 dark:text-blue-400" />
                Refresh
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md shadow-blue-700/20 rounded-lg"
              >
                <Link href="/register">
                  <PersonAddIcon className="h-4 w-4 mr-1.5" />
                  Register Visitor
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* MAIN VIEWPORT WINDOW */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Header Title Section */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-955 dark:text-white">
                {activeTab === "DASHBOARD"
                  ? "On-Site Visitor Logs"
                  : "Visitor Activity Statistics"}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mt-1 text-sm font-medium">
                {activeTab === "DASHBOARD"
                  ? "Manage, search, check-in, and check-out visitors at reception."
                  : "Period analytics, visit flow timelines, and purpose distributions."}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {actionError && (
              <div
                role="alert"
                className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900 dark:bg-rose-955/20 dark:border-rose-900/30 dark:text-rose-450"
              >
                <ErrorOutlinedIcon className="h-5 w-5 text-rose-605 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
            {successNotification && (
              <div
                role="alert"
                className="flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 text-sm text-emerald-900 dark:bg-emerald-955/20 dark:border-emerald-900/30 dark:text-emerald-450 animate-fadeIn"
              >
                <CheckCircleOutlinedIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{successNotification}</span>
              </div>
            )}

            {/* ===================== VIEWPORT 1: DASHBOARD ===================== */}
            {activeTab === "DASHBOARD" && (
              <>
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total KPI */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800/40 dark:bg-slate-900 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Total Visits
                      </span>
                      <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <PeopleIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {loading ? "..." : totalCount}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        Overall registered guests
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
                  </div>

                  {/* Inside KPI */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800/40 dark:bg-slate-900 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Currently Inside
                      </span>
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircleIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {loading ? "..." : activeCount}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        Checked-in status
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  </div>

                  {/* Pending KPI */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800/40 dark:bg-slate-900 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Pending Arrival
                      </span>
                      <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-955/40 dark:text-amber-400">
                        <AccessTimeIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {loading ? "..." : pendingCount}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        Awaiting arrival
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  </div>

                  {/* Checked Out KPI */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800/40 dark:bg-slate-900 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Checked Out
                      </span>
                      <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-955/40 dark:text-rose-400">
                        <DoneAllIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {loading ? "..." : completedCount}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        Completed visits
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-700"></div>
                  </div>
                </div>

                {/* Search, Filters, and Table section */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative max-w-md w-full">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
                      <Input
                        placeholder="Search by name or purpose..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border-slate-300 focus:ring-2 focus:ring-blue-600 rounded-xl bg-white/90 dark:border-slate-800 dark:bg-slate-950/90 text-slate-950 dark:text-white"
                      />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center space-x-1 overflow-x-auto p-1.5 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300/30">
                      {["ALL", "PENDING", "CHECKED_IN", "CHECKED_OUT"].map(
                        (filter) => {
                          const isActive = statusFilter === filter;
                          const label =
                            filter === "ALL"
                              ? "All"
                              : filter === "PENDING"
                                ? "Pending"
                                : filter === "CHECKED_IN"
                                  ? "Inside"
                                  : "Checked Out";

                          return (
                            <button
                              key={filter}
                              onClick={() => setStatusFilter(filter)}
                              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${isActive
                                  ? "bg-blue-700 text-white shadow dark:bg-slate-800 dark:text-white"
                                  : "text-slate-700 hover:text-slate-955 dark:text-slate-300 dark:hover:text-white"
                                }`}
                            >
                              {label}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Visitor Table container */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 border border-slate-200 dark:border-slate-850 rounded-2xl">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700"></div>
                      <span className="text-sm font-semibold text-slate-755 dark:text-slate-300 mt-3">
                        Loading visitor logs...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-16 bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 rounded-2xl text-rose-700 text-sm font-bold">
                      <ErrorOutlinedIcon className="h-10 w-10 text-rose-500 mb-2 mx-auto" />
                      <p>{error}</p>
                    </div>
                  ) : filteredVisitors.length === 0 ? (
                    <div className="text-center py-20 bg-white/70 border border-slate-200 rounded-2xl shadow dark:border-slate-805 dark:bg-slate-950/40 text-slate-800">
                      <PeopleIcon className="h-12 w-12 text-slate-700 dark:text-slate-400 mb-3 mx-auto" />
                      <h4 className="text-base font-extrabold text-slate-955 dark:text-slate-100 mb-1">
                        No visitors found
                      </h4>
                      <p className="text-sm font-semibold max-w-xs mx-auto mb-4 text-slate-705 dark:text-slate-350">
                        {searchQuery || statusFilter !== "ALL"
                          ? "Try adjusting your query or tab filters."
                          : "No visitors have checked in yet."}
                      </p>
                    </div>
                  ) : (
                    <VisitorTable
                      visitors={filteredVisitors}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                    />
                  )}
                </div>
              </>
            )}

            {/* ===================== VIEWPORT 2: STATISTICS ===================== */}
            {activeTab === "STATISTICS" && (
              <>
                {/* Stats Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Today Stats */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 dark:from-blue-950/20 dark:to-blue-950/10 dark:border-blue-900 p-5 rounded-2xl shadow-sm">
                    <span className="text-2xs font-extrabold uppercase text-blue-700 dark:text-blue-305 tracking-wider">
                      Visits Today
                    </span>
                    <h4 className="text-3xl font-extrabold text-blue-955 dark:text-white mt-1">
                      {statsLoading ? "..." : (stats?.summary.today ?? 0)}
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-400 font-semibold mt-1">
                      Guests welcomed since 12:00 AM
                    </p>
                  </div>

                  {/* Week Stats */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 dark:from-emerald-950/20 dark:to-emerald-950/10 dark:border-emerald-900 p-5 rounded-2xl shadow-sm">
                    <span className="text-2xs font-extrabold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">
                      This Week
                    </span>
                    <h4 className="text-3xl font-extrabold text-emerald-950 dark:text-white mt-1">
                      {statsLoading ? "..." : (stats?.summary.thisWeek ?? 0)}
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                      Guests welcomed in last 7 days
                    </p>
                  </div>

                  {/* Month Stats */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-205 dark:from-red-950/20 dark:to-red-950/10 dark:border-red-900 p-5 rounded-2xl shadow-sm">
                    <span className="text-2xs font-extrabold uppercase text-red-700 dark:text-red-300 tracking-wider">
                      This Month
                    </span>
                    <h4 className="text-3xl font-extrabold text-red-955 dark:text-white mt-1">
                      {statsLoading ? "..." : (stats?.summary.thisMonth ?? 0)}
                    </h4>
                    <p className="text-xs text-red-800 dark:text-red-400 font-semibold mt-1">
                      Guests welcomed in last 30 days
                    </p>
                  </div>
                </div>

                {/* Graphs Sub-Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Traffic Graph Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800/60 p-6 rounded-2xl shadow-md space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUpIcon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                          Visitor Flow (Last 15 Days)
                        </h3>
                      </div>
                      <span className="text-2xs font-extrabold text-slate-600 dark:text-slate-350 bg-slate-200 dark:bg-slate-850 px-2.5 py-1 rounded-full">
                        Daily Traffic
                      </span>
                    </div>

                    {statsLoading ? (
                      <div className="h-[220px] flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">
                        Computing timeline...
                      </div>
                    ) : !stats || stats.timelineStats.length === 0 ? (
                      <div className="h-[220px] flex items-center justify-center text-slate-655 font-semibold">
                        No activity data available.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Interactive SVG Chart */}
                        <div className="relative w-full h-[180px] bg-slate-50 dark:bg-slate-950/40 rounded-xl p-2 border border-slate-200/50 dark:border-slate-800/40 select-none">
                          <svg
                            className="w-full h-full overflow-visible cursor-crosshair"
                            viewBox="0 0 500 180"
                            preserveAspectRatio="none"
                            onMouseMove={(e) =>
                              handleTimelineMouseMove(e, coordinates)
                            }
                            onMouseLeave={() => setHoveredTimelineIndex(null)}
                          >
                            <defs>
                              <linearGradient
                                id="areaGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="rgb(29, 78, 216)"
                                  stopOpacity="0.4"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="rgb(29, 78, 216)"
                                  stopOpacity="0.0"
                                />
                              </linearGradient>
                            </defs>

                            {/* Area Path */}
                            {areaPath && (
                              <path d={areaPath} fill="url(#areaGradient)" />
                            )}

                            {/* Grid/Guideline for zero */}
                            <line
                              x1="20"
                              y1="160"
                              x2="480"
                              y2="160"
                              stroke="rgba(148, 163, 184, 0.3)"
                              strokeWidth="1"
                            />
                            <line
                              x1="20"
                              y1="20"
                              x2="480"
                              y2="20"
                              stroke="rgba(148, 163, 184, 0.15)"
                              strokeWidth="1"
                            />

                            {/* Guideline for hovered point */}
                            {hoveredTimelineIndex !== null &&
                              coordinates[hoveredTimelineIndex] && (
                                <line
                                  x1={coordinates[hoveredTimelineIndex].x}
                                  y1={20}
                                  x2={coordinates[hoveredTimelineIndex].x}
                                  y2={160}
                                  className="stroke-slate-300 dark:stroke-slate-700 stroke-1"
                                  strokeDasharray="3,3"
                                />
                              )}

                            {/* Line Path */}
                            {linePath && (
                              <path
                                d={linePath}
                                fill="none"
                                stroke="rgb(29, 78, 216)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Data Dots */}
                            {coordinates.map((pt, index) => {
                              const isHovered = hoveredTimelineIndex === index;
                              return (
                                <g key={index}>
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isHovered ? "6" : "4"}
                                    className="fill-blue-600 dark:fill-blue-500 stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-150"
                                  />
                                  {isHovered && (
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r="11"
                                      className="fill-blue-500/25 animate-ping pointer-events-none"
                                    />
                                  )}
                                </g>
                              );
                            })}
                          </svg>

                          {/* Floating Rich HTML Tooltip */}
                          {hoveredTimelineIndex !== null &&
                            coordinates[hoveredTimelineIndex] && (
                              <div
                                className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xl pointer-events-none transition-all duration-75 text-xs font-bold z-10 flex flex-col min-w-[95px]"
                                style={{
                                  left: `${(coordinates[hoveredTimelineIndex].x / 500) * 100}%`,
                                  top: `${(coordinates[hoveredTimelineIndex].y / 180) * 100}%`,
                                  transform:
                                    "translate(-50%, -100%) translateY(-12px)",
                                }}
                              >
                                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800"></div>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                                  {formatDate(
                                    coordinates[hoveredTimelineIndex].date,
                                  )}
                                </span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 whitespace-nowrap">
                                  {coordinates[hoveredTimelineIndex].count}{" "}
                                  {coordinates[hoveredTimelineIndex].count === 1
                                    ? "visit"
                                    : "visits"}
                                </span>
                              </div>
                            )}
                        </div>
                        {/* Dates indicator grid */}
                        <div className="flex justify-between px-2 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                          <span>
                            {formatDate(stats.timelineStats[0]?.date)}
                          </span>
                          <span>
                            {formatDate(
                              stats.timelineStats[
                                Math.floor(stats.timelineStats.length / 2)
                              ]?.date,
                            )}
                          </span>
                          <span>
                            {formatDate(
                              stats.timelineStats[
                                stats.timelineStats.length - 1
                              ]?.date,
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purpose Frequency Breakdown Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800/60 p-6 rounded-2xl shadow-md space-y-6">
                    <div className="flex items-center space-x-2">
                      <AssignmentIcon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Visit Purpose Breakdown
                      </h3>
                    </div>

                    {statsLoading ? (
                      <div className="h-[220px] flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">
                        Computing frequencies...
                      </div>
                    ) : !stats || stats.purposeStats.length === 0 ? (
                      <div className="h-[220px] flex items-center justify-center text-slate-500 font-semibold">
                        No activity data available.
                      </div>
                    ) : (
                      (() => {
                        const totalPurposeCount = stats.purposeStats.reduce(
                          (sum, item) => sum + item.count,
                          0,
                        );
                        let currentAngle = 0;

                        const pieSlices = stats.purposeStats.map(
                          (item, idx) => {
                            const percentage =
                              totalPurposeCount > 0
                                ? item.count / totalPurposeCount
                                : 0;
                            const angleSpan = percentage * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angleSpan;
                            currentAngle = endAngle;

                            const colorObj =
                              purposeColors[idx % purposeColors.length];

                            // Exploding effect calculations
                            const isHovered = hoveredPieIndex === idx;
                            let transform = "";
                            if (isHovered && angleSpan < 360) {
                              const midAngleRad =
                                (((startAngle + endAngle) / 2 - 90) * Math.PI) /
                                180;
                              const offset = 8; // move 8px outward
                              const dx = Math.cos(midAngleRad) * offset;
                              const dy = Math.sin(midAngleRad) * offset;
                              transform = `translate(${dx}px, ${dy}px)`;
                            }

                            return {
                              purpose: item.purpose,
                              count: item.count,
                              percent: Math.round(percentage * 100),
                              startAngle,
                              endAngle,
                              fill: colorObj.fill,
                              bgClass: colorObj.bg,
                              transform,
                              isSingle: angleSpan >= 360,
                            };
                          },
                        );

                        return (
                          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Donut Chart SVG Container */}
                            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center select-none">
                              <svg
                                className="w-full h-full overflow-visible"
                                viewBox="0 0 200 200"
                              >
                                {pieSlices.map((slice, idx) => {
                                  if (slice.isSingle) {
                                    return (
                                      <circle
                                        key={idx}
                                        cx="100"
                                        cy="100"
                                        r="75"
                                        fill={slice.fill}
                                        className="cursor-pointer transition-all duration-200 hover:opacity-90"
                                        onMouseEnter={() =>
                                          setHoveredPieIndex(idx)
                                        }
                                        onMouseLeave={() =>
                                          setHoveredPieIndex(null)
                                        }
                                      />
                                    );
                                  }

                                  const d = getPieSlicePath(
                                    100,
                                    100,
                                    75,
                                    slice.startAngle,
                                    slice.endAngle,
                                  );
                                  const isHovered = hoveredPieIndex === idx;

                                  return (
                                    <path
                                      key={idx}
                                      d={d}
                                      fill={slice.fill}
                                      style={{
                                        transform: slice.transform,
                                        transition:
                                          "transform 0.2s ease-out, opacity 0.2s",
                                        opacity:
                                          hoveredPieIndex !== null && !isHovered
                                            ? 0.75
                                            : 1,
                                      }}
                                      className="cursor-pointer stroke-white dark:stroke-slate-900 stroke-2"
                                      onMouseEnter={() =>
                                        setHoveredPieIndex(idx)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredPieIndex(null)
                                      }
                                    />
                                  );
                                })}

                                {/* Center Hole for Donut chart */}
                                <circle
                                  cx="100"
                                  cy="100"
                                  r="45"
                                  className="fill-white dark:fill-slate-900 transition-colors duration-250"
                                />

                                {/* Dynamic Text inside the donut hole */}
                                <text
                                  x="100"
                                  y="92"
                                  textAnchor="middle"
                                  className="fill-slate-500 dark:fill-slate-400 text-[9px] font-extrabold uppercase tracking-wider"
                                >
                                  {hoveredPieIndex !== null
                                    ? pieSlices[hoveredPieIndex].purpose
                                    : "Total Visits"}
                                </text>
                                <text
                                  x="100"
                                  y="114"
                                  textAnchor="middle"
                                  className="fill-slate-900 dark:fill-white text-base font-black"
                                >
                                  {hoveredPieIndex !== null
                                    ? `${pieSlices[hoveredPieIndex].count} (${pieSlices[hoveredPieIndex].percent}%)`
                                    : totalPurposeCount}
                                </text>
                              </svg>
                            </div>

                            {/* Frequencies Breakdown List */}
                            <div className="w-full space-y-4 max-h-[220px] overflow-y-auto pr-1">
                              {pieSlices.map((slice, idx) => {
                                const isHovered = hoveredPieIndex === idx;
                                return (
                                  <div
                                    key={slice.purpose}
                                    className={`space-y-1.5 transition-all duration-205 p-2 rounded-xl border border-transparent cursor-pointer ${isHovered
                                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                                        : ""
                                      }`}
                                    onMouseEnter={() => setHoveredPieIndex(idx)}
                                    onMouseLeave={() =>
                                      setHoveredPieIndex(null)
                                    }
                                  >
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                                      <span className="tracking-tight flex items-center space-x-2">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                          style={{
                                            backgroundColor: slice.fill,
                                          }}
                                        ></span>
                                        <span>{slice.purpose}</span>
                                      </span>
                                      <span className="font-extrabold">
                                        {slice.count} ({slice.percent}%)
                                      </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${slice.bgClass} rounded-full transition-all duration-500`}
                                        style={{ width: `${slice.percent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}