import { create } from 'zustand';
import api from '../services/api';
import { EventItem } from '../types';

interface FavoriteState {
  favorites: EventItem[];
  isLoading: boolean;
  fetchFavorites: () => Promise<void>;
  isFavorite: (eventId: number) => boolean;
  toggleFavorite: (eventId: number) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/favorites');
      set({ favorites: data.favorites, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  isFavorite: (eventId) => get().favorites.some((f) => f.id === eventId),

  toggleFavorite: async (eventId) => {
    const already = get().isFavorite(eventId);
    if (already) {
      set({ favorites: get().favorites.filter((f) => f.id !== eventId) });
      await api.delete(`/favorites/${eventId}`);
    } else {
      await api.post('/favorites', { event_id: eventId });
      await get().fetchFavorites();
    }
  },
}));
