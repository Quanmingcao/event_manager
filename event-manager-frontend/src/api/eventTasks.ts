import { apiClient } from './client';
import type { EventTask, CreateEventTaskInput } from '@/types';

export const eventTasksAPI = {
    getAll: async () => {
        const response = await apiClient.get<EventTask[]>('/api/EventTasks');
        return response.data;
    },

    getByEvent: async (eventId: string) => {
        const response = await apiClient.get<EventTask[]>(`/api/EventTasks/event/${eventId}`);
        return response.data;
    },

    getByStaff: async (staffId: string) => {
        const response = await apiClient.get<EventTask[]>(`/api/EventTasks/staff/${staffId}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<EventTask>(`/api/EventTasks/${id}`);
        return response.data;
    },

    create: async (data: CreateEventTaskInput) => {
        const response = await apiClient.post<EventTask>('/api/EventTasks', data);
        return response.data;
    },

    createBulk: async (data: CreateEventTaskInput[]) => {
        const response = await apiClient.post<EventTask[]>('/api/EventTasks/bulk', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateEventTaskInput>) => {
        const response = await apiClient.put<EventTask>(`/api/EventTasks/${id}`, { Id: id, id, ...data });
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        await apiClient.patch(`/api/EventTasks/${id}/status`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/EventTasks/${id}`);
    },
};
