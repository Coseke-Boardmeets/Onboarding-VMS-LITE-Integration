// DRY Principle: All API calls in the app go through this single client.
// Never call fetch() directly inside a React component or page.
//
// Import and use like this:
//   import { apiClient } from "@/lib/apiClient";
//   const visitors = await apiClient.get("/visitors");

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiClient = {
  /**
   * Make a GET request to the given path.
   */
  get: async (path: string) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      let errMsg = `GET ${path} failed`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch { }
      throw new Error(errMsg);
    }
    return response.json();
  },

  /**
   * Make a POST request with a JSON body to the given path.
   */
  post: async (path: string, body: unknown) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let errMsg = `POST ${path} failed`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch { }
      throw new Error(errMsg);
    }
    return response.json();
  },

  /**
   * Make a PUT request to the given path (no body needed for check-in/out).
   */
  put: async (path: string) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!response.ok) {
      let errMsg = `PUT ${path} failed`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch { }
      throw new Error(errMsg);
    }
    return response.json();
  },

  /**
   * Export visitors as CSV file
   */
  exportVisitorsCSV: async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/visitors/export/csv`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to export visitors");
      }

      // Get the CSV data
      const csv = await response.text();

      // Create a blob from the CSV data
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      if (typeof window !== "undefined") {
        // Create a temporary URL for the blob
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Set download attributes
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `visitors-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },
};

export default apiClient;