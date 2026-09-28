import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import EventForm, { EventFormValues } from './EventForm';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<Partial<EventFormValues> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => {
      const e = data.event;
      setInitial({
        name: e.name,
        description: e.description,
        category: e.category,
        image: e.image || '',
        date: e.date?.slice(0, 10),
        start_time: e.start_time?.slice(0, 5),
        end_time: e.end_time?.slice(0, 5),
        venue: e.venue,
        address: e.address,
        ticket_price: String(e.ticket_price),
        total_seats: String(e.total_seats),
      });
    });
  }, [id]);

  async function handleSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    setError('');
    try {
      await api.put(`/events/${id}`, {
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

  if (!initial) return <LoadingIndicator label="Loading event…" />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Edit event</h1>
      <EventForm initial={initial} onSubmit={handleSubmit} submitLabel="Save changes" isSubmitting={isSubmitting} serverError={error} />
    </div>
  );
}
