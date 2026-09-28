import { Link } from 'react-router-dom';
import { Booking } from '../types';
import EventImage from './EventImage';

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'bg-teal/10 text-teal',
  completed: 'bg-sand text-ink/70',
  cancelled: 'bg-ember/10 text-ember',
};

export default function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-ink/10 bg-white p-4 sm:flex-row sm:items-center">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-card bg-sand">
        <EventImage src={booking.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-ink">{booking.event_name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[booking.status]}`}>
            {booking.status}
          </span>
        </div>
        <p className="text-sm text-ink/60">
          {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {booking.venue}
        </p>
        <p className="text-sm text-ink/60">
          {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} · ₹{Number(booking.total_amount).toFixed(2)}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/bookings/${booking.id}`}
          className="focus-ring rounded-card border border-ink/15 px-3.5 py-2 text-sm font-medium text-ink hover:border-teal/40"
        >
          Details
        </Link>
        {booking.status === 'upcoming' && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="focus-ring rounded-card border border-ember/30 px-3.5 py-2 text-sm font-medium text-ember hover:bg-ember/5"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
