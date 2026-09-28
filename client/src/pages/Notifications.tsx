import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import NotificationCard from '../components/NotificationCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const { notifications, isLoading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="focus-ring text-sm font-medium text-teal">
            Mark all read
          </button>
        )}
      </div>

      {isLoading && <LoadingIndicator label="Loading notifications…" />}

      {!isLoading && notifications.length === 0 && (
        <EmptyState title="No notifications" message="Booking updates and event reminders will appear here." />
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
