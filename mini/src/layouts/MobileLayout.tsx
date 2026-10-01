import type { ReactNode } from "react";
/** Mobile uses the same shell with bottom navigation and touch-first action drawers. */
export function MobileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
