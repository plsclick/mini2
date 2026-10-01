import type { UserRole } from "../types/user";
import { rolePermissions } from "../routes/rolePermissions";

export function can(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAny(role: UserRole, permissions: string[]): boolean {
  return permissions.some((p) => can(role, p));
}

export function canAll(role: UserRole, permissions: string[]): boolean {
  return permissions.every((p) => can(role, p));
}
