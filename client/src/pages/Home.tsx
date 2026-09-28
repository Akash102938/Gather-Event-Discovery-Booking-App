import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import EventCard from '../components/EventCard';
import CategoryCard from '../components/CategoryCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { events, isLoading, error, fetchEvents, setFilters, clearFilters } = useEventStore();

  useEffect(() => {
    clearFilters();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const featured = events.filter((e) => new Date(e.date) >= today).slice(0, 3);
  const upcoming = events.filter((e) => e.available_seats > 0 && new Date(e.date) >= today);
  const heroEvent = featured[0];

  function goToCategory(category: string) {
    setFilters({ category });
    navigate('/explore');
  }

  return (
    <div className="flex flex-col gap-10 lg:gap-14">
      <section className="grid gap-7 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-12">
        <div className="py-2 lg:py-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/15 bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-teal shadow-sm">
            <span className="h-2 w-2 rounded-full bg-gold" />
            YOUR CITY, YOUR NEXT STORY
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {user ? <>Good things happen, <span className="text-teal">{user.name.split(' ')[0]}.</span></> : <>Make room for <span className="text-teal">something</span> unforgettable.</>}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/60 sm:text-lg">
            Find your people, discover what’s on, and make plans worth looking forward to.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/explore" className="focus-ring inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal/15 transition hover:-translate-y-0.5 hover:bg-teal/90">
              Explore events <span aria-hidden="true">↗</span>
            </Link>
            <span className="text-sm text-ink/45">Music, ideas & everything in between</span>
          </div>
          <p className="mt-8 text-sm text-ink/55"><strong className="font-semibold text-ink">A little more local.</strong> A lot more to look forward to.</p>
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-[28px] bg-teal shadow-[0_24px_70px_rgba(47,93,98,0.22)] sm:min-h-[360px]">
          {heroEvent?.image && (
            <img src={heroEvent.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101f20]/90 via-[#101f20]/10 to-[#101f20]/10" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur sm:left-7 sm:top-7">
            <span className="h-2 w-2 rounded-full bg-ember" />
            FEATURED EVENT
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            {heroEvent ? (
              <>
                <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{heroEvent.category}</span>
                <h2 className="max-w-lg font-display text-2xl font-semibold leading-tight sm:text-3xl">{heroEvent.name}</h2>
                <p className="mt-2 text-sm text-white/75">
                  {new Date(heroEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} <span className="px-1">·</span> {heroEvent.venue}
                </p>
                <Link to={`/event/${heroEvent.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:gap-3">
                  Get to know the event <span aria-hidden="true">→</span>
                </Link>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">A little more life, a lot more local.</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">The next great story starts when you find something worth showing up for.</p>
              </>
            )}
          </div>
          <span aria-hidden="true" className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/20" />
          <span aria-hidden="true" className="absolute -right-1 -top-5 h-32 w-32 rounded-full border border-white/20" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Find your kind of fun</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Explore by category</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-wrap">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat} category={cat} onClick={() => goToCategory(cat)} />
          ))}
        </div>
      </section>

      {isLoading && <LoadingIndicator label="Loading events…" />}
      {error && <p className="text-sm font-medium text-ember">{error}</p>}

      {!isLoading && !error && featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Handpicked for you</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Worth making plans for</h2>
            </div>
            <Link to="/explore" className="hidden text-sm font-semibold text-teal hover:text-teal/75 sm:inline-flex">See all events <span className="ml-1">→</span></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && !error && upcoming.length === 0 && (
        <EmptyState title="No events yet" message="Check back soon — new events are added regularly." />
      )}

      {!isLoading && !error && upcoming.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Coming up soon</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Make your next move</h2>
            </div>
            <Link to="/explore" className="hidden text-sm font-semibold text-teal hover:text-teal/75 sm:inline-flex">Browse everything <span className="ml-1">→</span></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
