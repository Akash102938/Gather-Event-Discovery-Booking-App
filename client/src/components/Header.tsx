import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export default function Header() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-teal/10 text-teal' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 font-display text-xl font-semibold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-base text-paper">g</span>
          Gather
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/explore" className={navClass}>Explore</NavLink>
          {user && (
            <>
              <NavLink to="/favorites" className={navClass}>Favorites</NavLink>
              <NavLink to="/bookings" className={navClass}>My bookings</NavLink>
            </>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-ink/60 lg:inline">Hi, {user.name.split(' ')[0]}</span>
              <Link to="/notifications" aria-label="Notifications" className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-lg text-ink/70 transition-colors hover:text-teal">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-semibold text-paper">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" aria-label="Your profile" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-teal text-sm font-semibold text-paper transition-transform hover:scale-105">
                {user.name.charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 sm:inline-flex">Log in</Link>
              <Link to="/register" className="focus-ring rounded-full bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal/90">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
