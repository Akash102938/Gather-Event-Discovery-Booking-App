import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Attendee } from '../../types';
import SearchBar from '../../components/SearchBar';
import LoadingIndicator from '../../components/LoadingIndicator';
import EmptyState from '../../components/EmptyState';

export default function Attendees() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  function load(query = '') {
    setIsLoading(true);
    api
      .get(`/organizer/events/${id}/attendees`, { params: query ? { search: query } : {} })
      .then(({ data }) => setAttendees(data.attendees))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => load(), [id]);

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate(-1)} className="focus-ring w-fit text-sm text-ink/60">
        ← Back
      </button>
      <h1 className="font-display text-2xl font-semibold text-ink">Attendees</h1>

      <SearchBar
        defaultValue={search}
        onSearch={(v) => {
          setSearch(v);
          load(v);
        }}
      />

      {isLoading && <LoadingIndicator label="Loading attendees…" />}

      {!isLoading && attendees.length === 0 && (
        <EmptyState title="No attendees" message="No one has booked this event yet, or none match your search." />
      )}

      {!isLoading && attendees.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-ink/10 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase text-ink/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a.booking_id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{a.name}</td>
                  <td className="px-4 py-3 text-ink/70">{a.email}</td>
                  <td className="px-4 py-3 text-ink/70">{a.mobile}</td>
                  <td className="px-4 py-3 text-ink/70">{a.quantity}</td>
                  <td className="px-4 py-3 text-ink/70">#{a.booking_id.toString().padStart(6, '0')}</td>
                  <td className="px-4 py-3 capitalize text-ink/70">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
