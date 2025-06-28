

const API_URL = import.meta.env.VITE_API_URL;

interface RequestOptions extends RequestInit {
    token?: string;
}

async function fetcher<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers({
        'Content-type' : 'application/json',
        ...options.headers
    })

    if(options.token){
        headers.append('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json();

    if(!response.ok){
        throw {
            message: data,
        };
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
    delete: <T>(endpoint: string, token?: string)=> 
        fetcher<T>(endpoint, { method: 'DELETE', token }),
};