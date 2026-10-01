export type UserRole = "client" | "pm" | "cm";
export interface User {
  id: string;
  name: string;
  role: UserRole;
  initials: string;
}
