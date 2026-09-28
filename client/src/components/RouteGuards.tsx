import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireOrganizer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'organizer') return <Navigate to="/" replace />;
  return <>{children}</>;
}
