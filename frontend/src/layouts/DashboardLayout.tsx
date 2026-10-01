import type { ReactNode } from "react";
import { AppShell } from "../components/navigation/AppShell";
export function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
