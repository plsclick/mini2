import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types/user";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);

  const isAuthenticated = user !== null;
  const role: UserRole | null = user?.role ?? null;

  const is = (r: UserRole) => role === r;

  return { user, isAuthenticated, role, is, signIn, signOut };
}
