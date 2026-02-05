export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  organizer: string;
  location: string;
  notes: string;
  scriptFile?: File | null;
  scriptFileName?: string;
  services: Service[];
  staff: Staff[];
  budget: Budget;
  status: 'planning' | 'ongoing' | 'completed';
  createdAt: string;
  eventDate?: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'mc' | 'stage' | 'decoration' | 'sound' | 'lighting' | 'catering' | 'other';
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  salary: number;
}

export interface Budget {
  estimatedServices: number;
  actualServices: number;
  estimatedStaff: number;
  actualStaff: number;
  estimatedTotal: number;
  actualTotal: number;
}

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    createdAt: new Date().toISOString()
  }
];
