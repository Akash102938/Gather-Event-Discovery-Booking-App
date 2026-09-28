import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { EventItem } from '../../types';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import EmptyState from '../../components/EmptyState';

interface DashboardStats {
  total_events: number;
  upcoming_events: number;
  total_bookings: number;
  total_attendees: number;
}

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    Promise.all([api.get('/organizer/dashboard'), api.get('/organizer/events')])
      .then(([dashRes, eventsRes]) => {
        setStats(dashRes.data);
        setEvents(eventsRes.data.events);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleDelete() {
    if (deleteId == null) return;
    await api.delete(`/events/${deleteId}`);
    setDeleteId(null);
    load();
  }

  if (isLoading) return <LoadingIndicator label="Loading dashboard…" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Organizer dashboard</h1>
        <Link to="/organizer/create-event">
          <PrimaryButton>+ New event</PrimaryButton>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total events', value: stats?.total_events ?? 0 },
          { label: 'Upcoming events', value: stats?.upcoming_events ?? 0 },
          { label: 'Total bookings', value: stats?.total_bookings ?? 0 },
          { label: 'Total attendees', value: stats?.total_attendees ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-card border border-ink/10 bg-white p-4">
            <p className="text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-ink/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Your events</h2>
        {events.length === 0 ? (
          <EmptyState
            title="No events yet"
            message="Create your first event to start accepting bookings."
            action={
              <Link to="/organizer/create-event">
                <PrimaryButton>Create event</PrimaryButton>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col gap-3 rounded-card border border-ink/10 bg-white p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-ink">{event.name}</h3>
                  <p className="text-sm text-ink/60">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {event.available_seats}/{event.total_seats} seats left · {event.booking_count ?? 0} bookings
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/organizer/events/${event.id}/attendees`)}
                    className="focus-ring rounded-card border border-ink/15 px-3.5 py-2 text-sm font-medium text-ink hover:border-teal/40"
                  >
                    Attendees
                  </button>
                  <button
                    onClick={() => navigate(`/organizer/edit-event/${event.id}`)}
                    className="focus-ring rounded-card border border-ink/15 px-3.5 py-2 text-sm font-medium text-ink hover:border-teal/40"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(event.id)}
                    className="focus-ring rounded-card border border-ember/30 px-3.5 py-2 text-sm font-medium text-ember hover:bg-ember/5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-card bg-paper p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold text-ink">Delete this event?</h2>
            <p className="mt-1 text-sm text-ink/60">This cannot be undone. Attendees with upcoming tickets will be notified and the event bookings will be removed.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="focus-ring flex-1 rounded-card border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink">
                Cancel
              </button>
              <button onClick={handleDelete} className="focus-ring flex-1 rounded-card bg-ember px-4 py-2.5 text-sm font-medium text-paper">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
