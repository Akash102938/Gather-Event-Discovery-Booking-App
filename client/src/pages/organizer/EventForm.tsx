import { useState } from 'react';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { CATEGORIES } from '../../types';

export interface EventFormValues {
  name: string;
  description: string;
  category: string;
  image: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  address: string;
  ticket_price: string;
  total_seats: string;
}

const EMPTY: EventFormValues = {
  name: '',
  description: '',
  category: CATEGORIES[0],
  image: '',
  date: '',
  start_time: '',
  end_time: '',
  venue: '',
  address: '',
  ticket_price: '0',
  total_seats: '',
};

export default function EventForm({
  initial,
  onSubmit,
  submitLabel,
  isSubmitting,
  serverError,
}: {
  initial?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string;
}) {
  const [form, setForm] = useState<EventFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof EventFormValues>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Event name is required.';
    if (form.description.trim().length < 10) e.description = 'Add at least 10 characters.';
    if (!form.date) e.date = 'Date is required.';
    else if (new Date(`${form.date}T00:00:00`) < new Date(new Date().toDateString())) e.date = 'Date cannot be in the past.';
    if (!form.start_time) e.start_time = 'Start time is required.';
    if (!form.end_time) e.end_time = 'End time is required.';
    if (form.start_time && form.end_time && form.start_time >= form.end_time) e.end_time = 'End time must be after start.';
    if (!form.venue) e.venue = 'Venue is required.';
    if (!form.address) e.address = 'Address is required.';
    if (!Number.isFinite(Number(form.ticket_price)) || Number(form.ticket_price) < 0) e.ticket_price = 'Enter a valid non-negative price.';
    if (!Number.isInteger(Number(form.total_seats)) || Number(form.total_seats) < 1) e.total_seats = 'Enter a whole number of at least 1 seat.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField label="Event name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
      <InputField as="textarea" label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => set('category', cat)}
              className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-medium ${
                form.category === cat ? 'border-teal bg-teal text-paper' : 'border-ink/15 text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <InputField label="Image URL" value={form.image} onChange={(e) => set('image', e.target.value)} hint="Optional banner image link" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputField label="Date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
        <InputField label="Start time" type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} error={errors.start_time} />
        <InputField label="End time" type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} error={errors.end_time} />
      </div>

      <InputField label="Venue" value={form.venue} onChange={(e) => set('venue', e.target.value)} error={errors.venue} />
      <InputField label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} />

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Ticket price (₹)" type="number" min={0} value={form.ticket_price} onChange={(e) => set('ticket_price', e.target.value)} error={errors.ticket_price} />
        <InputField label="Total seats" type="number" min={1} value={form.total_seats} onChange={(e) => set('total_seats', e.target.value)} error={errors.total_seats} />
      </div>

      {serverError && <p className="text-sm font-medium text-ember">{serverError}</p>}

      <PrimaryButton type="submit" isLoading={isSubmitting} fullWidth>
        {submitLabel}
      </PrimaryButton>
    </form>
  );
}
