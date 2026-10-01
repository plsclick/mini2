import { AppShell } from "../../components/navigation/AppShell";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { ProgressHistory } from "../../components/dashboard/ProgressHistory";

export function ActivityPage() {
  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">COLLABORATION · SKYLINE RESIDENCY</p>
            <h1>Project activity</h1>
            <p>Every significant project event in chronological order.</p>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <section className="card">
            <div className="card-head">
              <div>
                <p className="eyebrow">LIVE FEED</p>
                <h2>Recent events</h2>
              </div>
            </div>
            <ActivityFeed />
          </section>

          <section className="card progress-history">
            <ProgressHistory />
          </section>
        </div>
      </main>
    </AppShell>
  );
}
