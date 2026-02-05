import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, User } from '@/app/types';

interface EventContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const addEvent = (event: Event) => {
    const newEvents = [...events, event];
    setEvents(newEvents);
    localStorage.setItem('events', JSON.stringify(newEvents));
  };

  const updateEvent = (id: string, updatedEvent: Partial<Event>) => {
    const newEvents = events.map(e => 
      e.id === id ? { ...e, ...updatedEvent } : e
    );
    setEvents(newEvents);
    localStorage.setItem('events', JSON.stringify(newEvents));
  };

  const deleteEvent = (id: string) => {
    const newEvents = events.filter(e => e.id !== id);
    setEvents(newEvents);
    localStorage.setItem('events', JSON.stringify(newEvents));
  };

  const getEvent = (id: string) => {
    return events.find(e => e.id === id);
  };

  const addUser = (user: User) => {
    const newUsers = [...users, user];
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const updateUser = (id: string, updatedUser: Partial<User>) => {
    const newUsers = users.map(u => 
      u.id === id ? { ...u, ...updatedUser } : u
    );
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const deleteUser = (id: string) => {
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      addEvent, 
      updateEvent, 
      deleteEvent, 
      getEvent,
      users,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within EventProvider');
  }
  return context;
}
