import { apiClient } from './client';
import type { Staff, CreateStaffInput, UpdateStaffInput } from '@/types';

export const staffAPI = {
    getAll: async () => {
        const response = await apiClient.get<Staff[]>('/api/Staff');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Staff>(`/api/Staff/${id}`);
        return response.data;
    },

    create: async (data: CreateStaffInput) => {
        const response = await apiClient.post<Staff>('/api/Staff', data);
        return response.data;
    },

    update: async (id: string, data: UpdateStaffInput) => {
        const response = await apiClient.put<Staff>(`/api/Staff/${id}`, { Id: id, ...data });
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/Staff/${id}`);
    },
};
