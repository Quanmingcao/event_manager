// Types khớp với ASP.NET Core backend entities

export interface Event {
    id: string;
    name: string;
    organizer: string;
    startDate: string;
    location: string;
    format: 'online' | 'offline' | 'hybrid';
    status: 'Planning' | 'Running' | 'Completed' | 'Canceled';
    scriptLink?: string;
    timelineLink?: string;
    createdAt: string;
}

export interface Staff {
    id: string;
    fullName: string;
    staffType: 'Cán bộ' | 'Sinh viên' | 'Tình nguyện viên' | 'CTV';
    phone?: string;
    department?: string;
    eventTasks?: EventTask[];
}

export interface TaskTemplate {
    id: string;
    taskName: string;
    description?: string;
}

export interface EventTask {
    id: string;
    eventId: string;
    taskId: string;
    staffId: string;
    status: string;
    note?: string;
    event?: Event;
    task?: TaskTemplate;
    staff?: Staff;
}

export interface Service {
    id: string;
    serviceName: string;
    basePrice: number;
}

export interface EventFinance {
    id: string;
    eventId: string;
    serviceId?: string | null;
    serviceName?: string;
    estimatedAmount: number;
    extraAmount: number;
    estimatedNote?: string;
    extraNote?: string;
    event?: Event;
    service?: Service;
}

export interface FinanceSummary {
    eventId: string;
    estimatedTotal: number;
    extraTotal: number;
    grandTotal: number;
    itemCount: number;
    items: Array<{
        id: string;
        serviceName: string;
        estimatedAmount: number;
        extraAmount: number;
        total: number;
        estimatedNote?: string;
        extraNote?: string;
    }>;
}

// Form types
export type CreateEventInput = Omit<Event, 'id' | 'createdAt'>;
export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateStaffInput = Omit<Staff, 'id' | 'eventTasks'>;
export type UpdateStaffInput = Partial<CreateStaffInput>;

export type CreateTaskTemplateInput = Omit<TaskTemplate, 'id'>;
export type CreateEventTaskInput = Omit<EventTask, 'id' | 'event' | 'task' | 'staff'>;
export type CreateServiceInput = Omit<Service, 'id'>;
export type CreateEventFinanceInput = Omit<EventFinance, 'id' | 'event' | 'service'>;
