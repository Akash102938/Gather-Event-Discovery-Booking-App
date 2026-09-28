import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';
import LoadingIndicator from '../components/LoadingIndicator';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';
import EventImage from '../components/EventImage';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentEvent, isLoading, error, fetchEventById } = useEventStore();
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite, fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    if (id) fetchEventById(id);
    if (isAuthenticated) fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) return <LoadingIndicator label="Loading event…" />;
  if (error || !currentEvent) {
    const notFound = error === 'Event not found.';
    return (
      <EmptyState
        title={notFound ? 'Event not found' : 'Could not load event'}
        message={error || 'This event may have been removed or the link is incorrect.'}
      />
    );
  }

  const event = currentEvent;
  const soldOut = event.available_seats <= 0;
  const favorite = isFavorite(event.id);

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="h-56 w-full overflow-hidden rounded-card bg-sand">
        <EventImage src={event.image} alt={event.name} className="h-full w-full object-cover" />
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-medium text-teal">{event.category}</span>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{event.name}</h1>
            <p className="text-sm text-ink/60">Hosted by {event.organizer_name}</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => toggleFavorite(event.id)}
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-lg"
              aria-label="Toggle favorite"
            >
              {favorite ? '♥' : '♡'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-card border border-ink/10 bg-white p-4 text-sm">
        <div>
          <p className="text-ink/50">Date</p>
          <p className="font-medium text-ink">
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div>
          <p className="text-ink/50">Time</p>
          <p className="font-medium text-ink">{event.start_time.slice(0, 5)} – {event.end_time.slice(0, 5)}</p>
        </div>
        <div>
          <p className="text-ink/50">Venue</p>
          <p className="font-medium text-ink">{event.venue}</p>
        </div>
        <div>
          <p className="text-ink/50">Address</p>
          <p className="font-medium text-ink">{event.address}</p>
        </div>
        <div>
          <p className="text-ink/50">Price</p>
          <p className="font-medium text-ink">{Number(event.ticket_price) === 0 ? 'Free' : `₹${Number(event.ticket_price).toFixed(2)}`}</p>
        </div>
        <div>
          <p className="text-ink/50">Availability</p>
          <p className="font-medium text-ink">{soldOut ? 'Sold out' : `${event.available_seats} of ${event.total_seats} seats left`}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-1.5 font-display text-lg font-semibold text-ink">About this event</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{event.description}</p>
      </div>

      <div className="sticky bottom-20 mt-2 flex gap-3 rounded-card bg-paper py-2">
        <PrimaryButton
          fullWidth
          disabled={soldOut}
          onClick={() => {
            if (!isAuthenticated) return navigate('/login');
            navigate(`/event/${event.id}/book`);
          }}
        >
          {soldOut ? 'Sold out' : 'Book now'}
        </PrimaryButton>
      </div>

      {!isAuthenticated && (
        <p className="text-center text-xs text-ink/50">
          <Link to="/login" className="font-medium text-teal">Log in</Link> to book tickets or save favorites.
        </p>
      )}
    </div>
  );
}
