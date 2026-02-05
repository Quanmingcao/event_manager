import { apiClient } from './client';
import type { TaskTemplate, CreateTaskTemplateInput } from '@/types';

export const taskTemplatesAPI = {
    getAll: async () => {
        const response = await apiClient.get<TaskTemplate[]>('/api/TaskTemplates');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<TaskTemplate>(`/api/TaskTemplates/${id}`);
        return response.data;
    },

    create: async (data: CreateTaskTemplateInput) => {
        const response = await apiClient.post<TaskTemplate>('/api/TaskTemplates', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateTaskTemplateInput>) => {
        const response = await apiClient.put<TaskTemplate>(`/api/TaskTemplates/${id}`, { id, ...data });
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/TaskTemplates/${id}`);
    },
};
