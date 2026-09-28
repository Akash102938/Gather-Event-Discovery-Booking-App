export type Role = 'user' | 'organizer';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  created_at: string;
}

export interface EventItem {
  id: number;
  organizer_id: number;
  organizer_name?: string;
  name: string;
  description: string;
  category: string;
  image: string | null;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  address: string;
  ticket_price: string | number;
  total_seats: number;
  available_seats: number;
  booking_count?: number;
  created_at: string;
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  ticket_type: string;
  quantity: number;
  total_amount: string | number;
  status: BookingStatus;
  created_at: string;
  event_name: string;
  user_name?: string;
  date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  address?: string;
  image?: string | null;
  category?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  kind?: string;
  is_read: boolean;
  created_at: string;
}

export interface Attendee {
  name: string;
  email: string;
  mobile: string;
  quantity: number;
  booking_id: number;
  status: BookingStatus;
}

export interface EventFilters {
  search?: string;
  category?: string;
  date?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string;
}

export const CATEGORIES = [
  'Music',
  'Sports',
  'Technology',
  'Business',
  'Education',
  'Workshops',
  'Entertainment',
];
