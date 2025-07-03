import { api } from "./api";

export interface Problem {
    id: number;
    slug: string;
    title: string;
    description: string;
    difficulty: string;
    topics: any[];
    time_limit: number;
    memory_limit: number;
    author: string;
    created_at: string;
    updated_at: string;
}

export const problemService = {
    // get all the problems
    getAllProblems: (token?: string) => 
        api.get<Problem[]>('/api/problems/', token),

    // get a single problem by slug
    getProblemBySlug: (slug: string, token?: string) => 
        api.get<Problem>(`/api/problems/${slug}/`, token),

    // create a new problem
    createProblem: (problemData: Partial<Problem>, token?: string) => 
        api.post<Problem>('/api/problems/create/', problemData, token),

    // update or edit a problem
    updateProblem: (slug: string, problemData: Partial<Problem>, token?: string) => 
        api.patch<Problem>(`/api/problems/${slug}/edit/`, problemData, token),
    
};