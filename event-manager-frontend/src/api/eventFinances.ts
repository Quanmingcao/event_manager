import { apiClient } from './client';
import type { EventFinance, CreateEventFinanceInput, FinanceSummary } from '@/types';

export const eventFinancesAPI = {
    getAll: async () => {
        const response = await apiClient.get<EventFinance[]>('/api/EventFinances');
        return response.data;
    },

    getByEvent: async (eventId: string) => {
        const response = await apiClient.get<EventFinance[]>(`/api/EventFinances/event/${eventId}`);
        return response.data;
    },

    getSummary: async (eventId: string) => {
        const response = await apiClient.get<FinanceSummary>(`/api/EventFinances/summary/${eventId}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<EventFinance>(`/api/EventFinances/${id}`);
        return response.data;
    },

    create: async (data: CreateEventFinanceInput) => {
        const response = await apiClient.post<EventFinance>('/api/EventFinances', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateEventFinanceInput>) => {
        const response = await apiClient.put<EventFinance>(`/api/EventFinances/${id}`, { id, ...data });
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/EventFinances/${id}`);
    },
};
