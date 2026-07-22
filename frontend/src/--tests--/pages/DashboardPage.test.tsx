import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/page";
import * as apiClient from "@/lib/apiClient";

// Mock the API client
vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          summary: { today: 0, thisWeek: 0, thisMonth: 0, allTime: 0 },
          purposeStats: [],
          timelineStats: [],
        });
      }
      return Promise.resolve([]);
    }),
    put: vi.fn().mockResolvedValue({}),
  },
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Auth Context
vi.mock("@/components/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", email: "admin@test.com", fullName: "Admin User" },
    loading: false,
    logout: vi.fn(),
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load and display visitors on mount", async () => {
    const mockVisitors = [
      {
        id: "1",
        fullName: "John Doe",
        purpose: "Interview",
        status: "PENDING",
      },
    ];

    vi.mocked(apiClient.apiClient.get).mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          summary: { today: 0, thisWeek: 0, thisMonth: 0, allTime: 0 },
          purposeStats: [],
          timelineStats: [],
        });
      }
      return Promise.resolve(mockVisitors);
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 100);
        }),
    );

    render(<DashboardPage />);

    expect(screen.getByText(/Loading visitor/i)).toBeInTheDocument();
  });

  it("should display error message on API failure", async () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          summary: { today: 0, thisWeek: 0, thisMonth: 0, allTime: 0 },
          purposeStats: [],
          timelineStats: [],
        });
      }
      return Promise.reject(new Error("API Error"));
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });

  it("should display empty state when no visitors", async () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          summary: { today: 0, thisWeek: 0, thisMonth: 0, allTime: 0 },
          purposeStats: [],
          timelineStats: [],
        });
      }
      return Promise.resolve([]);
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No visitors found")).toBeInTheDocument();
    });
  });
});
