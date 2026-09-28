import { create } from 'zustand';
import api from '../services/api';
import { NotificationItem } from '../types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/notifications');
      set({
        notifications: data.notifications,
        unreadCount: data.notifications.filter((n: NotificationItem) => !n.is_read).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    await api.put(`/notifications/${id}/read`);
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },

  markAllAsRead: async () => {
    await api.put('/notifications/read-all');
    set({
      notifications: get().notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    });
  },
}));
