import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types/user";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const authenticate = useAuthStore((s) => s.authenticate);
  const signOut = useAuthStore((s) => s.signOut);

  const isAuthenticated = user !== null;
  const role: UserRole | null = user?.role ?? null;

  const is = (r: UserRole) => role === r;

  return { user, isAuthenticated, role, is, authenticate, signOut };
}
