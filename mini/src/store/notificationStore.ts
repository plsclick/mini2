import { create } from "zustand";
import { notifications as initialNotifications } from "../mock/notifications";
import type { Notification } from "../types/notification";
interface NotificationState {
  items: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}
export const useNotificationStore = create<NotificationState>((set) => ({
  items: initialNotifications,
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),
}));
