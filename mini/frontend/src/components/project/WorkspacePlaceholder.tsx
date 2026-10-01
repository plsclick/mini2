import type { ReactNode } from "react";
import { AppShell } from "../navigation/AppShell";
import { useActiveProject } from "../../hooks/useActiveProject";
export function WorkspacePlaceholder({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  const { project } = useActiveProject();
  return (
    <AppShell>
      <main className="page">
        <section className="page-title">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{project?.name ?? "No project selected"} · live project workspace</p>
          </div>
        </section>
        {children ?? (
          <section className="card">
            <p className="eyebrow">PROJECT WORKSPACE</p>
            <h2>Information is synchronised across your team.</h2>
            <p className="sub">
              Use the left navigation to review status, schedule, risks and
              activity.
            </p>
          </section>
        )}
      </main>
    </AppShell>
  );
}
