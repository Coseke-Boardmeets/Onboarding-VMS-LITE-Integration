// src/app/dashboard/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Visitor } from "@/types/visitor";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VisitorTable from "@/components/VisitorTable";

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch all visitors from GET /visitors
  const fetchVisitors = useCallback(async () => {
    try {
      const data = (await apiClient.get("/visitors")) as Visitor[];
      setVisitors(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load visitors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch visitors on component mount
  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Handle check-in: PUT /visitors/:id/checkin
  async function handleCheckIn(id: string) {
    setActionError(null);
    try {
      await apiClient.put(`/visitors/${id}/checkin`);
      await fetchVisitors();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Check-in failed. Try again."
      );
    }
  }

  // Handle check-out: PUT /visitors/:id/checkout
  async function handleCheckOut(id: string) {
    setActionError(null);
    try {
      await apiClient.put(`/visitors/${id}/checkout`);
      await fetchVisitors();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Check-out failed. Try again."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reception Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage visitor check-ins and check-outs
            </p>
          </div>
          <Button asChild>
            <Link href="/register">+ Register visitor</Link>
          </Button>
        </div>

        {/* Action Error Alert */}
        {actionError && (
          <div
            role="alert"
            className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
          >
            {actionError}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <p className="text-sm text-gray-500">Loading visitors…</p>
        )}

        {/* Fetch Error Alert */}
        {error && !loading && (
          <div
            role="alert"
            className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && visitors.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No visitors yet.{" "}
            <Link
              href="/register"
              className="text-blue-600 underline underline-offset-2"
            >
              Register the first one.
            </Link>
          </div>
        )}

        {/* Visitors Table Component */}
        {!loading && !error && visitors.length > 0 && (
          <VisitorTable
            visitors={visitors}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}
      </div>
    </main>
  );
}