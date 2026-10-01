export type NotificationSeverity = "info" | "success" | "warning" | "critical";
export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  time: string;
  read: boolean;
}
