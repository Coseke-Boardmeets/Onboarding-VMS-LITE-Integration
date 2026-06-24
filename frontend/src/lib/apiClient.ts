// DRY Principle: All API calls in the app go through this single client.
// Never call fetch() directly inside a React component or page.
//
// Import and use like this:
//   import { apiClient } from "@/lib/apiClient";
//   const visitors = await apiClient.get("/visitors");

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  /**
   * Make a GET request to the given path.
   * TODO: Implement using fetch(). Return the parsed JSON response.
   */
  get: async (path: string) => {
    // TODO
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Make a POST request with a JSON body to the given path.
   * TODO: Implement using fetch() with method "POST" and correct headers.
   */
  post: async (path: string, body: unknown) => {
    // TODO
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`POST ${path} failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Make a PUT request to the given path (no body needed for check-in/out).
   * TODO: Implement using fetch() with method "PUT".
   */
  put: async (path: string) => {
    // TODO
        const response = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`PUT ${path} failed: ${response.statusText}`);
    }
    return response.json();
  },
};
