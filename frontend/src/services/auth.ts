import { api } from "./api";


export const authService = {
    login: async (credentials: { username_or_email: string; password: string}) => {
        return api.post<{
            message: string;
            is_verified: boolean;
            email: string;
            access_token: string;
            refresh_token: string;
        }>('/api/users/login/', credentials);
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
        return api.get(`/api/users/email-verify/${uidb64}/${token}`);
    },

    resendVerification: async (email: string) => {
        return api.post('api/users/resend-verify', {email});
    },

    logout: async() => {
        return api.post('api/users/logout', {});
    }
};