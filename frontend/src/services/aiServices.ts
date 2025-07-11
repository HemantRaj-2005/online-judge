import { api } from "./api";

export const aiService = {
  analyzeSubmission: (
    problem_id: number,
    submission_id: number,
    token: string,
    problemDescription?: string
  ) =>
    api.post(
      `/api/ai/analyze-submission/${problem_id}/`,
      { submission_id, problem_description: problemDescription },
      token
    ),

  explainProblem: (problem_id: number, token?: string) =>
    api.post(`/api/ai/explain-problem/${problem_id}/`, token),

  getHint: (
    problem_id: number,
    code: string,
    language: string,
    token?: string,
    problemDescription?: string
  ) =>
    api.post(
      "/api/ai/get-hint/",
      { problem_id, code, language, problem_description: problemDescription },
      token
    ),
};
