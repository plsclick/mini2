import { useNotificationStore } from "../store/notificationStore";

export function useNotifications() {
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const unread = items.filter((n) => !n.read);
  const unreadCount = unread.length;
  const hasUnread = unreadCount > 0;

  return { items, unread, unreadCount, hasUnread, markRead, markAllRead };
}
