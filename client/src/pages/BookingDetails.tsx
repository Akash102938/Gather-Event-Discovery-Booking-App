import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Booking } from '../types';
import TicketCard from '../components/TicketCard';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { useBookingStore } from '../store/bookingStore';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cancelBooking } = useBookingStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  function load() {
    if (!id) return;
    setIsLoading(true);
    setBooking(null);
    setError('');
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setError('We could not load this booking. Please check your connection and try again.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [id]);

  if (isLoading) return <LoadingIndicator label="Loading booking…" />;
  if (!booking) return <EmptyState title={error ? 'Could not load booking' : 'Booking not found'} message={error || 'This booking may not exist.'} />;

  async function handleCancel() {
    if (!booking) return;
    try {
      await cancelBooking(booking.id);
      setShowConfirm(false);
      load();
    } catch {
      setError('We could not cancel this booking. Please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="focus-ring w-fit text-sm text-ink/60">
        ← Back
      </button>
      {error && <p role="alert" className="rounded-xl bg-ember/10 px-4 py-3 text-sm font-medium text-ember">{error}</p>}
      <TicketCard booking={booking} />

      {booking.status === 'upcoming' && (
        <PrimaryButton variant="danger" onClick={() => setShowConfirm(true)}>
          Cancel booking
        </PrimaryButton>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm rounded-card bg-paper p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold text-ink">Cancel this booking?</h2>
            <p className="mt-1 text-sm text-ink/60">Your seats will be released and this cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="focus-ring flex-1 rounded-card border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink">
                Keep booking
              </button>
              <button onClick={handleCancel} className="focus-ring flex-1 rounded-card bg-ember px-4 py-2.5 text-sm font-medium text-paper">
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
