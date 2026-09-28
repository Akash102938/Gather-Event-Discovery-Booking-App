import { Booking } from '../types';

function QrPlaceholder({ value }: { value: string }) {
  // Deterministic pseudo-QR pattern placeholder (not a real scannable code)
  const cells = Array.from({ length: 64 }, (_, i) => (value.charCodeAt(i % value.length) + i) % 3 === 0);
  return (
    <div className="grid h-24 w-24 grid-cols-8 gap-0.5 rounded bg-white p-1.5">
      {cells.map((filled, i) => (
        <div key={i} className={filled ? 'bg-ink' : 'bg-transparent'} />
      ))}
    </div>
  );
}

export default function TicketCard({ booking }: { booking: Booking }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div className="bg-teal px-6 py-5 text-paper">
        <p className="text-xs uppercase tracking-wide text-paper/70">Digital ticket</p>
        <h2 className="font-display text-xl font-semibold">{booking.event_name}</h2>
      </div>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-ink/50">Booking ID</p>
            <p className="font-medium text-ink">#{booking.id.toString().padStart(6, '0')}</p>
          </div>
          <div>
            <p className="text-ink/50">Status</p>
            <p className="font-medium capitalize text-ink">{booking.status}</p>
          </div>
          <div>
            <p className="text-ink/50">Booked by</p>
            <p className="font-medium text-ink">{booking.user_name || 'Ticket holder'}</p>
          </div>
          <div>
            <p className="text-ink/50">Date &amp; time</p>
            <p className="font-medium text-ink">
              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {booking.start_time?.slice(0, 5)}
            </p>
          </div>
          <div>
            <p className="text-ink/50">Venue</p>
            <p className="font-medium text-ink">{booking.venue}</p>
          </div>
          <div>
            <p className="text-ink/50">Ticket type</p>
            <p className="font-medium text-ink">{booking.ticket_type}</p>
          </div>
          <div>
            <p className="text-ink/50">Quantity</p>
            <p className="font-medium text-ink">{booking.quantity}</p>
          </div>
          <div>
            <p className="text-ink/50">Total paid</p>
            <p className="font-medium text-ink">₹{Number(booking.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 border-t border-dashed border-ink/15 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <QrPlaceholder value={`BOOKING-${booking.id}-${booking.event_id}`} />
          <p className="text-xs text-ink/40">Show at entry</p>
        </div>
      </div>
    </div>
  );
}
