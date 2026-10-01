import { AppShell } from "../../components/navigation/AppShell";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";

export function ActivityPage() {
  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SITE OPERATIONS · SKYLINE RESIDENCY</p>
            <h1>Site activity</h1>
            <p>Recent events, updates, and changes on this project.</p>
          </div>
        </section>

        <section className="card" style={{ maxWidth: 800 }}>
          <div className="card-head">
            <div>
              <p className="eyebrow">ACTIVITY FEED</p>
              <h2>What's happened today</h2>
            </div>
          </div>
          <ActivityFeed />
        </section>
      </main>
    </AppShell>
  );
}
