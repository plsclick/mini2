import { AppShell } from "../../components/navigation/AppShell";
import { milestones } from "../../mock/milestones";

const statusIcon: Record<string, { symbol: string; cls: string }> = {
  complete: { symbol: "✓", cls: "good" },
  "in-progress": { symbol: "●", cls: "warn" },
  upcoming: { symbol: "○", cls: "" },
};

export function MilestonesPage() {
  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SKYLINE RESIDENCY · MILESTONES</p>
            <h1>Project milestones</h1>
            <p>Key project checkpoints and their current status.</p>
          </div>
        </section>

        <section className="card" style={{ maxWidth: 820 }}>
          <div className="card-head">
            <div>
              <p className="eyebrow">ALL MILESTONES</p>
              <h2>{milestones.length} checkpoints defined</h2>
            </div>
          </div>
          {milestones.map((ms) => {
            const icon = statusIcon[ms.status];
            const isDelayed = ms.projectedDate !== ms.plannedDate;
            return (
              <div key={ms.id} className="milestone">
                <i className={icon.cls} style={{ fontStyle: "normal" }}>
                  {icon.symbol}
                </i>
                <div style={{ flex: 1 }}>
                  <b>{ms.name}</b>
                  <small>{ms.dependency}</small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <small style={{ fontFamily: "DM Mono", fontSize: 9, color: "var(--dim)", display: "block" }}>
                    PLANNED
                  </small>
                  <span style={{ fontSize: 11 }}>{ms.plannedDate}</span>
                </div>
                {isDelayed && (
                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <small style={{ fontFamily: "DM Mono", fontSize: 9, color: "var(--dim)", display: "block" }}>
                      PROJECTED
                    </small>
                    <span style={{ fontSize: 11, color: "var(--red)" }}>
                      {ms.projectedDate}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}
