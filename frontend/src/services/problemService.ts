export interface Topic {
    id: number;
    name: string;
}

export interface TestCase {
    id: number;
    problem: number;
    name: string;
    input_text: string;
    output_text: string;
    is_sample: boolean;
    is_hidden: boolean;
    explanation?: string;
}

export interface Problem {
    id: number;
    slug: string;
    title: string;
    description: string;
    difficulty: string;
    topics: (string | Topic)[];
    time_limit: number;
    memory_limit: number;
    author: string;
    created_at: string;
    updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders(token?: string) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token && token.trim() !== "") {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
        let errorMessage = data?.detail || 'Request failed';
        if (typeof data === 'object') {
            const firstError = Object.values(data)[0];
            if (Array.isArray(firstError)) {
                errorMessage = firstError[0];
            }
        }
        throw new Error(errorMessage);
    }
    return data;
}

export const problemService = {
    // Get all problems
    async getAllProblems(token?: string): Promise<Problem[]> {
        const response = await fetch(`${API_URL}/api/problems/`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        return handleResponse<Problem[]>(response);
    },

    // Get a single problem by slug
    async getProblemBySlug(slug: string, token?: string): Promise<Problem> {
        const response = await fetch(`${API_URL}/api/problems/${slug}/description/`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        return handleResponse<Problem>(response);
    },

    // Create a new problem
    async createProblem(problemData: Partial<Problem>, token?: string): Promise<Problem> {
        const response = await fetch(`${API_URL}/api/problems/create/`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(problemData),
        });
        return handleResponse<Problem>(response);
    },

    // Update or edit a problem
    async updateProblem(slug: string, problemData: Partial<Problem>, token?: string): Promise<Problem> {
        const response = await fetch(`${API_URL}/api/problems/${slug}/edit/`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(problemData),
        });
        return handleResponse<Problem>(response);
    },

    // Generate AI testcases
    async generateTestCases(title: string, description: string, token?: string): Promise<{
        sample: {input: string, output: string, explanation: string}[],
        edge: {input: string, output: string, explanation: string}[],
        corner: {input: string, output: string, explanation: string}[],
        stress: {input: string, output: string, explanation: string}[],
        random: {input: string, output: string, explanation: string}[]
    }> {
        const response = await fetch(`${API_URL}/api/problems/generate-testcases/`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ title, description }),
        });
        return handleResponse(response);
    },

    // Manage problem test cases
    async getTestCases(slug: string, token: string): Promise<TestCase[]> {
        const response = await fetch(`${API_URL}/api/problems/${slug}/testcases/`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        return handleResponse<TestCase[]>(response);
    },

    async createTestCase(slug: string, data: Partial<TestCase>, token: string): Promise<TestCase> {
        const response = await fetch(`${API_URL}/api/problems/${slug}/testcases/`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });
        return handleResponse<TestCase>(response);
    },

    async updateTestCase(id: number, data: Partial<TestCase>, token: string): Promise<TestCase> {
        const response = await fetch(`${API_URL}/api/testcases/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });
        return handleResponse<TestCase>(response);
    },

    async deleteTestCase(id: number, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/api/testcases/${id}/`, {
            method: 'DELETE',
            headers: getHeaders(token),
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.detail || 'Failed to delete test case');
        }
    },
};