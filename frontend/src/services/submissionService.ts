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
  // Submit a code for a problem
  submitCode: (
    problemSlug: string,
    code: string,
    language: string,
    token?: string
  ) =>
    api.post<Submission>(
      `/api/problems/${problemSlug}/submit/`,
      { code, language },
      token
    ),

  // Get the status of a submission or get submission by id
  getSubmissionStatus: (submissionId: number, token?: string) =>
    api.get<Submission>(`/api/submissions/${submissionId}/`, token),

  // Get all submissions for a problem by the current user
  getUserSubmissionsForProblem: (problemSlug: string, token?: string) =>
    api.get<Submission[]>(
      `/api/problems/${problemSlug}/my-submissions/`,
      token
    ),
};
