import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/explore', label: 'Explore', icon: '⌕' },
  { to: '/favorites', label: 'Favorites', icon: '♡' },
  { to: '/bookings', label: 'Bookings', icon: '▤' },
  { to: '/profile', label: 'Profile', icon: '◔' },
];

export default function BottomNav() {
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(28,35,33,0.06)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-xl justify-between px-2 py-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-card px-2 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-teal' : 'text-ink/45'
              }`
            }
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
