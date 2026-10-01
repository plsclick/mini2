import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types/user";
export function ProtectedRoute({
  role,
  children,
}: {
  role?: UserRole;
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== user.role)
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <>{children}</>;
}
