import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavoriteStore } from '../store/favoriteStore';
import EventCard from '../components/EventCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';

export default function Favorites() {
  const { favorites, isLoading, fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-ink">Favorites</h1>

      {isLoading && <LoadingIndicator label="Loading favorites…" />}

      {!isLoading && favorites.length === 0 && (
        <EmptyState
          title="No favorites yet"
          message="Tap the heart on any event to save it here for later."
          action={
            <Link to="/explore">
              <PrimaryButton>Explore events</PrimaryButton>
            </Link>
          }
        />
      )}

      {!isLoading && favorites.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {favorites.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
