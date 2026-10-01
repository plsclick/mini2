import type { UserRole } from "../types/user";
export const rolePermissions: Record<UserRole, string[]> = {
  client: ["overview:read", "project:read", "timeline:read", "documents:read"],
  pm: [
    "project:manage",
    "tasks:manage",
    "dependencies:manage",
    "resources:manage",
    "risks:manage",
    "recovery:manage",
    "reports:read",
  ],
  cm: [
    "tasks:read",
    "progress:update",
    "delay:report",
    "requirements:report",
    "site-updates:create",
  ],
};
export const can = (role: UserRole, permission: string) =>
  rolePermissions[role].includes(permission);
