import { useEffect, useState } from 'react';
import { useEventStore } from '../store/eventStore';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterModal from '../components/FilterModal';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';

export default function Explore() {
  const { events, filters, isLoading, error, fetchEvents, setFilters, clearFilters } = useEventStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-ink">Explore events</h1>

      <SearchBar
        defaultValue={filters.search || ''}
        onSearch={(value) => setFilters({ search: value })}
        onOpenFilters={() => setShowFilters(true)}
      />

      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between rounded-card bg-sand/50 px-4 py-2 text-sm text-ink/70">
          <span>{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied</span>
          <button onClick={clearFilters} className="focus-ring font-medium text-teal">
            Clear all
          </button>
        </div>
      )}

      {isLoading && <LoadingIndicator label="Searching events…" />}
      {error && <p className="text-sm font-medium text-ember">{error}</p>}

      {!isLoading && !error && events.length === 0 && (
        <EmptyState
          title="No events found"
          message="Try adjusting your search or filters to see more results."
          action={
            <PrimaryButton variant="secondary" onClick={clearFilters}>
              Clear filters
            </PrimaryButton>
          }
        />
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {showFilters && (
        <FilterModal
          initial={filters}
          onClose={() => setShowFilters(false)}
          onApply={(f) => setFilters(f)}
          onClear={clearFilters}
        />
      )}
    </div>
  );
}
