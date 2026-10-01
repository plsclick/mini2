import type { Notification } from "../types/notification";
export const notifications: Notification[] = [
  {
    id: "1",
    title: "Critical path affected",
    message: "Structure delay has affected the current critical path.",
    severity: "critical",
    time: "10 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Material requirement approved",
    message: "Steel rod requirement has been approved for delivery.",
    severity: "success",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    title: "Project completion moved",
    message: "Projected completion is now 22 Dec 2026.",
    severity: "warning",
    time: "Yesterday",
    read: true,
  },
];
