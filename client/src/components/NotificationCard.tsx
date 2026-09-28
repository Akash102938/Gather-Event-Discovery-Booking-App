import { NotificationItem } from '../types';

export default function NotificationCard({
  notification,
  onRead,
}: {
  notification: NotificationItem;
  onRead: (id: number) => void;
}) {
  return (
    <button
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`focus-ring flex w-full flex-col gap-1 rounded-card border px-4 py-3.5 text-left transition-colors ${
        notification.is_read ? 'border-ink/10 bg-white' : 'border-teal/30 bg-teal/5'
      }`}
    >
      <div className="flex items-center gap-2">
        {!notification.is_read && <span className="h-2 w-2 rounded-full bg-teal" />}
        <h4 className="font-medium text-ink">{notification.title}</h4>
      </div>
      <p className="text-sm text-ink/60">{notification.message}</p>
      <span className="text-xs text-ink/40">
        {new Date(notification.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
      </span>
    </button>
  );
}
