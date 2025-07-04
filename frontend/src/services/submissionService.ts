// frontend/src/services/submissionService.ts

// You can use an environment variable, or hardcode for local dev:
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Submission {
  id: number;
  user: string;
  problem: string;
  code: string;
  language: string;
  status: string;
  verdict: string;
  time_taken: number;
  memory_used: number;
  submitted_at: string;
  evaluated_at: string;
  problem_title?: string;
}

export const submissionService = {
  // Submit code for a problem (by username)
  submitCode: async (
    problemSlug: string,
    code: string,
    language: string,
    username: string
  ) => {
    const response = await fetch(
      `${API_URL}/api/problems/${problemSlug}/submit/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, username }),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  },

  // Get the status of a submission by ID (optionally by username)
  getSubmissionStatus: async (submissionId: number, username?: string) => {
    // If your backend requires username, add it as a query param or in the body as needed
    const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
    const response = await fetch(
      `${API_URL}/api/submissions/${submissionId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : '', // Add token if available
        },
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  },

  // Get all submissions for a problem by a given username
  getUserSubmissionsByUsername: async (problemSlug: string, username: string) => {
    const response = await fetch(
      `${API_URL}/api/problems/${problemSlug}/submissions/${username}/`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch submissions");
    }
    return data;
  },
};
