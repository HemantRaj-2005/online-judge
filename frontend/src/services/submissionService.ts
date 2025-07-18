// frontend/src/services/submissionService.ts

import { api } from "./api";

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
    const token = localStorage.getItem("authToken");
    return api.post(
      `/api/problems/${problemSlug}/submit/`,
      { code, language, username },
      token || undefined
    );
  },

  // Get the status of a submission by ID (optionally by username)
  getSubmissionStatus: async (submissionId: number) => {
    const token = localStorage.getItem("authToken");
    return api.get(`/api/submissions/${submissionId}/`, token || undefined);
  },

  // Get all submissions for a problem by a given username
  getUserSubmissionsByUsername: async (
    problemSlug: string,
    username?: string
  ) => {
    const token = localStorage.getItem("authToken");
    return api.get(
      `/api/problems/${problemSlug}/submissions/${username}/`,
      token || undefined
    );
  },

  getUserSubmissions: async (username: string) => {
    const token = localStorage.getItem("authToken");
    return api.get(`/api/users/${username}/submissions/`, token || undefined);
  },

  getSubmissionById: async (submissionId: number) => {
    return api.get(`/api/submissions/${submissionId}`);
  },
};
