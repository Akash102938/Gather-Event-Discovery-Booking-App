import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { useFavoriteStore } from './store/favoriteStore';

import AppLayout from './components/AppLayout';
import { RequireAuth, RequireOrganizer } from './components/RouteGuards';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import EventDetails from './pages/EventDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import Attendees from './pages/organizer/Attendees';

export default function App() {
  const { init, isAuthenticated } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchFavorites();
    }
  }, [isAuthenticated, fetchNotifications, fetchFavorites]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/event/:id/book" element={<RequireAuth><Booking /></RequireAuth>} />
        <Route path="/bookings/:id/confirmation" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />
        <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
        <Route path="/bookings/:id" element={<RequireAuth><BookingDetails /></RequireAuth>} />
        <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        <Route path="/organizer/dashboard" element={<RequireOrganizer><OrganizerDashboard /></RequireOrganizer>} />
        <Route path="/organizer/create-event" element={<RequireOrganizer><CreateEvent /></RequireOrganizer>} />
        <Route path="/organizer/edit-event/:id" element={<RequireOrganizer><EditEvent /></RequireOrganizer>} />
        <Route path="/organizer/events/:id/attendees" element={<RequireOrganizer><Attendees /></RequireOrganizer>} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
