/** Canonical Socket.IO event names used across the application. */
export const SocketEvents = {
  // Connection lifecycle
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Room management
  JOIN_PROJECT: "join:project",
  LEAVE_PROJECT: "leave:project",

  // Project
  PROJECT_UPDATED: "project:updated",
  SCHEDULE_UPDATED: "schedule:updated",

  // Tasks
  TASK_UPDATED: "task:updated",
  TASK_COMPLETED: "task:completed",

  // Delays
  DELAY_REPORTED: "delay:reported",
  DELAY_UPDATED: "delay:updated",
  DELAY_RESOLVED: "delay:resolved",

  // Risks
  RISK_UPDATED: "risk:updated",

  // Requirements
  REQUIREMENT_CREATED: "requirement:created",

  // Site updates
  SITE_UPDATE_CREATED: "site-update:created",

  // Notifications
  NOTIFICATION_NEW: "notification:new",

  // Activity
  ACTIVITY_NEW: "activity:new",
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
