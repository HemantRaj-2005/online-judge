

const API_URL = import.meta.env.VITE_API_URL;

interface RequestOptions extends RequestInit {
    token?: string;
}

async function fetcher<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers
    });

    if (options.token) {
        headers.append('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        // Handle Django REST framework error format
        let errorMessage = 'Request failed';
        
        if (data.email) {
            errorMessage = data.email[0]; // Get first email error
        } 
        else if (data.password) {
            errorMessage = data.password[0]; // Get first password error
        }
        else if (data.non_field_errors) {
            errorMessage = data.non_field_errors[0];
        }
        else if (typeof data === 'object') {
            // Fallback to first error if structure is different
            const firstError = Object.values(data)[0];
            if (Array.isArray(firstError)) {
                errorMessage = firstError[0];
            }
        }

        const error = new Error(errorMessage);
        (error as any).response = response;
        throw error;
    }

    return data;
}

export const api = {
    get: <T>(endpoint: string, token?: string)=> 
        fetcher<T>(endpoint, { method: 'GET', token}),
    post: <T>(endpoint: string, body: unknown, token?: string)=> 
        fetcher<T>(endpoint, { method: 'POST', body: JSON.stringify(body), token }),
    put: <T>(endpoint: string, body: unknown, token?: string)=> 
        fetcher<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), token }),
    patch: <T>(endpoint: string, body: unknown, token?: string) => 
        fetcher<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), token }),
    delete: <T>(endpoint: string, token?: string)=> 
        fetcher<T>(endpoint, { method: 'DELETE', token }),
};