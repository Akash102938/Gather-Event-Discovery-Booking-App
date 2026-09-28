import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Booking } from '../types';
import TicketCard from '../components/TicketCard';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setError('We could not load this booking. Please check your connection and try again.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingIndicator label="Loading confirmation…" />;
  if (!booking) return <EmptyState title={error ? 'Could not load booking' : 'Booking not found'} message={error || "We couldn't find this booking."} />;

  return (
    <div className="flex flex-col items-center gap-6 pb-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-3xl text-teal">✓</div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Booking confirmed!</h1>
        <p className="mt-1 text-sm text-ink/60">Your tickets are ready. See you at the event.</p>
      </div>

      <div className="w-full">
        <TicketCard booking={booking} />
      </div>

      <div className="flex w-full gap-3">
        <Link to="/bookings" className="flex-1">
          <PrimaryButton variant="secondary" fullWidth>
            View my bookings
          </PrimaryButton>
        </Link>
        <Link to="/" className="flex-1">
          <PrimaryButton fullWidth>Back home</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
