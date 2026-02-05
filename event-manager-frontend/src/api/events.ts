import { apiClient } from './client';
import { supabase } from '@/lib/supabase';
import type { Event, CreateEventInput, UpdateEventInput } from '@/types';

export const eventsAPI = {
    getAll: async () => {
        const response = await apiClient.get<Event[]>('/api/Events');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Event>(`/api/Events/${id}`);
        return response.data;
    },

    create: async (data: CreateEventInput) => {
        const response = await apiClient.post<Event>('/api/Events', data);
        return response.data;
    },

    update: async (id: string, data: UpdateEventInput) => {
        const response = await apiClient.put<Event>(`/api/Events/${id}`, { Id: id, ...data });
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/api/Events/${id}`);
    },

    uploadFile: async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('event_assets')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('event_assets')
            .getPublicUrl(filePath);

        return publicUrl;
    },
};
