import { store } from "@/redux/store";
import { api } from "./api";
import { setUser } from "@/redux/user/authSlice";


export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        try {
            const response = await api.post<{
                message: string;
                is_verified: boolean;
                is_author: boolean;
                email: string;
                access_token: string;
                refresh_token: string;
                username: string;
            }>('/api/users/login/', credentials);
            return response;
        } catch (error: any) {
            // The error.message now contains the proper string
            throw new Error(error.message);
        }
    },
    register: async (userData:{
        username: string;
        email: string;
        password: string;
        institute?: string;
        bio?: string;
    }) => {
        return api.post('/api/users/register/', userData);
    },

    verifyEmail: async (uidb64: string, token: string) => {
        return api.get(`/api/users/email-verify/${uidb64}/${token}/`);
    },

    resendVerification: async (email: string) => {
        return api.post('/api/users/resend-verify/', {email});
    },

    logout: async() => {
        return api.post('api/users/logout', {});
    }
};

export const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) throw new Error('No refresh token available');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refresh_token }),
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    const data = await response.json();
    localStorage.setItem('authToken', data.access);

    // Update Redux state with new access token
    const currentUser = store.getState().auth.user;
    if (currentUser) {
        store.dispatch(setUser({
            ...currentUser,
            accessToken: data.access,
        }));
    }

    return data.access;
};