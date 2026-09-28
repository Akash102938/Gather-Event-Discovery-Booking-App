import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-full pb-24 md:pb-10">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
