import { AppShell } from "../../components/navigation/AppShell";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { useActiveProject } from "../../hooks/useActiveProject";

export function UpdatesPage() {
  const { project } = useActiveProject();
  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">{project?.name ?? "NO PROJECT"} · UPDATES</p>
            <h1>Project updates</h1>
            <p>Stay informed on what's changed on your project.</p>
          </div>
        </section>

        <section className="card" style={{ maxWidth: 800 }}>
          <div className="card-head">
            <div>
              <p className="eyebrow">ACTIVITY LOG</p>
              <h2>Recent updates</h2>
            </div>
          </div>
          <ActivityFeed client />
        </section>
      </main>
    </AppShell>
  );
}
