import { create } from 'zustand';
import api, { getErrorMessage } from '../services/api';
import { Booking } from '../types';

interface CreateBookingResult {
  booking: Booking;
  breakdown: { subtotal: number; fee: number; total: number };
}

interface BookingState {
  bookings: Booking[];
  lastBooking: CreateBookingResult | null;
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (payload: { event_id: number; ticket_type: string; quantity: number }) => Promise<CreateBookingResult>;
  cancelBooking: (id: number) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  lastBooking: null,
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/bookings');
      set({ bookings: data.bookings, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  createBooking: async (payload) => {
    const { data } = await api.post('/bookings', payload);
    set({ lastBooking: data });
    return data;
  },

  cancelBooking: async (id) => {
    await api.put(`/bookings/${id}/cancel`);
    set({ bookings: get().bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) });
  },
}));
