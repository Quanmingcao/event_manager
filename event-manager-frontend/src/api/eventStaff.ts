import { apiClient } from './client';

export interface EventStaff {
    id: string;
    eventId: string;
    fullName: string;
    phone?: string;
    department?: string;
    staffType?: string;
    assignedTask?: string;
    note?: string;
    createdAt: string;
}

export interface CreateEventStaffInput {
    eventId: string;
    fullName: string;
    phone?: string;
    department?: string;
    staffType?: string;
    assignedTask?: string;
    note?: string;
}

export const eventStaffAPI = {
    getAll: async (): Promise<EventStaff[]> => {
        const response = await apiClient.get('/api/EventStaff');
        return response.data;
    },

    getById: async (id: string): Promise<EventStaff> => {
        const response = await apiClient.get(`/api/EventStaff/${id}`);
        return response.data;
    },

    getByEvent: async (eventId: string): Promise<EventStaff[]> => {
        const response = await apiClient.get(`/api/EventStaff/event/${eventId}`);
        return response.data;
    },

    create: async (data: CreateEventStaffInput): Promise<EventStaff> => {
        const response = await apiClient.post('/api/EventStaff', data);
        return response.data;
    },

    createBulk: async (data: CreateEventStaffInput[]): Promise<EventStaff[]> => {
        const response = await apiClient.post('/api/EventStaff/bulk', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateEventStaffInput>): Promise<void> => {
        await apiClient.put(`/api/EventStaff/${id}`, { id, ...data });
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/EventStaff/${id}`);
    },

    deleteByEvent: async (eventId: string): Promise<void> => {
        await apiClient.delete(`/api/EventStaff/event/${eventId}`);
    },
};
