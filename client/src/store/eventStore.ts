import { create } from 'zustand';
import api, { getErrorMessage } from '../services/api';
import { EventItem, EventFilters } from '../types';

interface EventState {
  events: EventItem[];
  currentEvent: EventItem | null;
  filters: EventFilters;
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: number | string) => Promise<void>;
  setFilters: (filters: EventFilters) => void;
  clearFilters: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const params = get().filters;
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
      );
      const { data } = await api.get('/events', { params: cleanParams });
      set({ events: data.events, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: 'Could not load events. Check your connection.' });
    }
  },

  fetchEventById: async (id) => {
    set({ isLoading: true, error: null, currentEvent: null });
    try {
      const { data } = await api.get(`/events/${id}`);
      set({ currentEvent: data.event, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearFilters: () => set({ filters: {} }),
}));
