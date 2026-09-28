import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import EventForm, { EventFormValues } from './EventForm';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/events', {
        ...values,
        ticket_price: Number(values.ticket_price),
        total_seats: Number(values.total_seats),
      });
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Create event</h1>
      <EventForm onSubmit={handleSubmit} submitLabel="Create event" isSubmitting={isSubmitting} serverError={error} />
    </div>
  );
}
