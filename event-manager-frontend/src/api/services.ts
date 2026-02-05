import { apiClient } from './client';
import type { Service, CreateServiceInput } from '@/types';

export const servicesAPI = {
    getAll: async () => {
        const response = await apiClient.get<Service[]>('/api/Services');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Service>(`/api/Services/${id}`);
        return response.data;
    },

    create: async (data: CreateServiceInput) => {
        const response = await apiClient.post<Service>('/api/Services', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateServiceInput>) => {
        const response = await apiClient.put<Service>(`/api/Services/${id}`, { id, ...data });
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/Services/${id}`);
    },
};
