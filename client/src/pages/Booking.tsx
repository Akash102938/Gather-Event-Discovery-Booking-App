import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useBookingStore } from '../store/bookingStore';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { getErrorMessage } from '../services/api';

const TICKET_TYPES = ['General', 'VIP', 'Group'];
const SERVICE_FEE_RATE = 0.05;

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentEvent, isLoading, fetchEventById } = useEventStore();
  const { createBooking } = useBookingStore();

  const [ticketType, setTicketType] = useState('General');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchEventById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading || !currentEvent) return <LoadingIndicator label="Loading booking form…" />;

  const event = currentEvent;
  const price = Number(event.ticket_price);
  const subtotal = price * quantity;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + fee) * 100) / 100;
  const soldOut = event.available_seats <= 0;

  async function handleConfirm() {
    setError('');
    if (quantity < 1) return setError('Quantity must be at least 1.');
    if (quantity > event.available_seats) return setError(`Only ${event.available_seats} seats left.`);
    if (soldOut) return setError('This event is sold out.');

    setSubmitting(true);
    try {
      const result = await createBooking({ event_id: event.id, ticket_type: ticketType, quantity });
      navigate(`/bookings/${result.booking.id}/confirmation`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Book tickets</h1>
        <p className="text-sm text-ink/60">{event.name} · {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">Ticket type</label>
        <div className="grid grid-cols-3 gap-3">
          {TICKET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTicketType(type)}
              className={`focus-ring rounded-card border px-3 py-2.5 text-sm font-medium ${
                ticketType === type ? 'border-teal bg-teal text-paper' : 'border-ink/15 text-ink'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">Quantity</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-card border border-ink/15 text-lg"
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(event.available_seats || 1, q + 1))}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-card border border-ink/15 text-lg"
          >
            +
          </button>
          <span className="text-sm text-ink/50">{event.available_seats} available</span>
        </div>
      </div>

      <div className="rounded-card border border-ink/10 bg-white p-4">
        <h2 className="mb-3 font-display font-semibold text-ink">Price breakdown</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-ink/70">
            <span>Ticket price × {quantity}</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-ink/70">
            <span>Convenience fee (5%)</span>
            <span>₹{fee.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-ember">{error}</p>}

      <PrimaryButton fullWidth onClick={handleConfirm} isLoading={submitting} disabled={soldOut}>
        Confirm booking
      </PrimaryButton>
    </div>
  );
}
