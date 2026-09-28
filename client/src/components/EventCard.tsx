import { Link } from 'react-router-dom';
import { EventItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';
import EventImage from './EventImage';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventCard({ event }: { event: EventItem }) {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const favorite = isFavorite(event.id);
  const soldOut = event.available_seats <= 0;

  return (
    <Link
      to={`/event/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_2px_10px_rgba(28,35,33,0.035)] transition duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_16px_36px_rgba(28,35,33,0.10)]"
    >
      <div className="relative h-48 w-full overflow-hidden bg-sand sm:h-52">
        {event.image ? (
          <EventImage
            src={event.image}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand to-teal/20 text-teal/60">Gather event</div>
        )}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(event.id);
            }}
            className="focus-ring absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl text-ember shadow-md transition-transform hover:scale-105"
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favorite ? '♥' : '♡'}
          </button>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-paper backdrop-blur">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="w-fit rounded-full bg-teal/8 px-3 py-1 text-xs font-semibold text-teal">{event.category}</span>
          <span className="text-xs text-ink/45">{formatDate(event.date)}</span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{event.name}</h3>
        <p className="truncate text-sm text-ink/55">{event.venue} · {event.address}</p>
        <div className="mt-auto flex items-center justify-between border-t border-ink/8 pt-3">
          <span className="font-medium text-ink">
            <span className="mr-1 text-xs font-normal text-ink/45">From</span>
            {Number(event.ticket_price) === 0 ? 'Free' : `₹${Number(event.ticket_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          </span>
          <span className="text-xs font-medium text-ink/50">{event.available_seats} seats left</span>
        </div>
      </div>
    </Link>
  );
}
