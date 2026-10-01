import { AppShell } from "../../components/navigation/AppShell";

const updates = [
  {
    date: "Today",
    actor: "Construction Manager",
    text: "Structure progress updated to 78%. Steel installation continuing on Level 04.",
    type: "progress",
  },
  {
    date: "Yesterday",
    actor: "System",
    text: "Steel delivery delay reported. Project completion moved to 22 Dec 2026.",
    type: "delay",
  },
  {
    date: "2 days ago",
    actor: "Project Manager",
    text: "Recovery plan created. Expedited delivery and additional workforce approved.",
    type: "recovery",
  },
  {
    date: "5 days ago",
    actor: "System",
    text: "Foundation stage marked complete. All 8 tasks finished on schedule.",
    type: "milestone",
  },
  {
    date: "8 days ago",
    actor: "Construction Manager",
    text: "Foundation inspection passed. Area cleared for next activities.",
    type: "progress",
  },
];

const typeColor: Record<string, string> = {
  progress: "var(--blue)",
  delay: "var(--red)",
  recovery: "var(--green)",
  milestone: "var(--amber)",
};

export function UpdatesPage() {
  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SKYLINE RESIDENCY · UPDATES</p>
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
          <div className="feed">
            {updates.map((u, i) => (
              <div key={i}>
                <span>{u.date}</span>
                <i style={{ background: typeColor[u.type] }} />
                <div>
                  <p style={{ margin: 0 }}>
                    <b style={{ color: "var(--text)", fontFamily: "DM Mono", fontSize: 9, letterSpacing: 0.5 }}>
                      {u.actor.toUpperCase()}
                    </b>
                  </p>
                  <p>{u.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
