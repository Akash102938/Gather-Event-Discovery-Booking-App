import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import BookingCard from '../components/BookingCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { BookingStatus } from '../types';

const TABS: { key: BookingStatus; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function MyBookings() {
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
  const [tab, setTab] = useState<BookingStatus>('upcoming');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter((b) => b.status === tab);

  async function confirmCancel() {
    if (cancelId == null) return;
    setError('');
    setIsCancelling(true);
    try {
      await cancelBooking(cancelId);
      setCancelId(null);
    } catch {
      setError('We could not cancel this booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-ink">My bookings</h1>
      {error && <p role="alert" className="rounded-xl bg-ember/10 px-4 py-3 text-sm font-medium text-ember">{error}</p>}

      <div className="flex gap-2 rounded-card bg-sand/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`focus-ring flex-1 rounded-card px-3 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-ink/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingIndicator label="Loading bookings…" />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState title={`No ${tab} bookings`} message="Bookings you make will show up here." />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={(id) => setCancelId(id)} />
          ))}
        </div>
      )}

      {cancelId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" onClick={() => setCancelId(null)}>
          <div className="w-full max-w-sm rounded-card bg-paper p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold text-ink">Cancel this booking?</h2>
            <p className="mt-1 text-sm text-ink/60">Your seats will be released and this cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => !isCancelling && setCancelId(null)}
                disabled={isCancelling}
                className="focus-ring flex-1 rounded-card border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink"
              >
                Keep booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="focus-ring flex-1 rounded-card bg-ember px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
              >
                {isCancelling ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
