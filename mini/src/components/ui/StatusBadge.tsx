import type { ReactNode } from "react";
export function StatusBadge({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "danger" | "info" | "success";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
