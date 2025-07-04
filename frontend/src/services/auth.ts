import { api } from "./api";


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
        return api.post('/api/users/logout/', {});
    }
};