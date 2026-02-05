import { apiClient } from './client';

export interface Profile {
    id: string;
    email: string;
    fullName: string | null;
    role: 'super_admin' | 'admin' | 'staff';
    createdAt: string;
}

export const profilesAPI = {
    getAll: async () => {
        const response = await apiClient.get<Profile[]>('/api/profiles');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Profile>(`/api/profiles/${id}`);
        return response.data;
    },

    getMe: async (id: string) => {
        try {
            const response = await apiClient.get<Profile>(`/api/profiles/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    create: async (profile: Partial<Profile>) => {
        const response = await apiClient.post<Profile>('/api/profiles', profile);
        return response.data;
    },

    update: async (id: string, profile: Partial<Profile>) => {
        await apiClient.put(`/api/profiles/${id}`, profile);
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/profiles/${id}`);
    }
};
