import { useState } from "react";
import { Play } from "lucide-react";
import { AppShell } from "../../components/navigation/AppShell";
import { useTaskStore } from "../../store/taskStore";

export function SimulationPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState(tasks[0]?.id ?? "");
  const [delayDays, setDelayDays] = useState(5);
  const [ran, setRan] = useState(false);

  const ORIGINAL_COMPLETION = "18 Dec 2026";
  const simulatedDate = ran
    ? `${18 + delayDays > 31 ? `${(18 + delayDays) - 31} Jan 2027` : `${18 + delayDays} Dec 2026`}`
    : null;

  const selectedTaskName =
    tasks.find((t) => t.id === selectedTask)?.name ?? "—";

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SCHEDULE SIMULATOR · SKYLINE RESIDENCY</p>
            <h1>What-if simulation</h1>
            <p>
              Model the impact of a task delay before it happens on site.
            </p>
          </div>
        </section>

        <div className="pm-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <section className="card">
            <p className="eyebrow">SIMULATION PARAMETERS</p>
            <h2>Configure scenario</h2>
            <div className="sim-controls" style={{ flexDirection: "column", alignItems: "stretch", gap: 14, marginTop: 18 }}>
              <label>
                SELECT TASK
                <select
                  value={selectedTask}
                  onChange={(e) => { setSelectedTask(e.target.value); setRan(false); }}
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                DELAY DURATION
                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => { setDelayDays(Math.max(1, delayDays - 1)); setRan(false); }}
                  >
                    −
                  </button>
                  <b>{delayDays} DAYS</b>
                  <button
                    type="button"
                    onClick={() => { setDelayDays(delayDays + 1); setRan(false); }}
                  >
                    +
                  </button>
                </div>
              </label>
              <button
                className="primary small"
                style={{ width: "100%", marginTop: 8 }}
                onClick={() => setRan(true)}
              >
                <Play size={14} />
                RUN SIMULATION
              </button>
            </div>
          </section>

          <section className="card">
            <p className="eyebrow">SIMULATION RESULT</p>
            <h2>Impact analysis</h2>
            {!ran ? (
              <p className="sub" style={{ marginTop: 18 }}>
                Configure parameters and run the simulation to see project impact.
              </p>
            ) : (
              <div style={{ marginTop: 18 }}>
                <div className="sim-result" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12, border: 0, padding: 0, margin: 0 }}>
                  <div style={{ display: "flex", gap: 20 }}>
                    <span>
                      <small style={{ fontSize: 9, fontFamily: "DM Mono", color: "var(--dim)", display: "block", marginBottom: 4 }}>ORIGINAL COMPLETION</small>
                      <b style={{ fontSize: 16 }}>{ORIGINAL_COMPLETION}</b>
                    </span>
                    <span style={{ alignSelf: "flex-end", color: "var(--dim)", fontSize: 18 }}>→</span>
                    <span>
                      <small style={{ fontSize: 9, fontFamily: "DM Mono", color: "var(--dim)", display: "block", marginBottom: 4 }}>SIMULATED COMPLETION</small>
                      <b className="red" style={{ fontSize: 16 }}>{simulatedDate}</b>
                    </span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, width: "100%" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--muted)" }}>
                      If <b style={{ color: "var(--text)" }}>{selectedTaskName}</b> is delayed by{" "}
                      <b style={{ color: "var(--amber)" }}>{delayDays} days</b>:
                    </p>
                    <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", color: "var(--muted)", fontSize: 11, lineHeight: 1.8 }}>
                      <li>Project completion pushed by <b className="red">+{delayDays} days</b></li>
                      <li><b>{Math.min(8, delayDays * 2)} tasks</b> affected downstream</li>
                      <li>Critical path: <b className="red">CHANGED</b></li>
                      <li>Recovery options available: <b style={{ color: "var(--green)" }}>3</b></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>

          {ran && (
            <section className="card" style={{ gridColumn: "span 2" }}>
              <p className="eyebrow">RECOVERY STRATEGIES</p>
              <h2>Recover the simulated delay</h2>
              <div className="detail-stack" style={{ marginTop: 14 }}>
                {[
                  { name: "Expedite material delivery", recovery: 2, resource: "Priority freight", risk: "Cost increase" },
                  { name: "Additional workforce deployment", recovery: 1, resource: "6 extra workers", risk: "Coordination overhead" },
                  { name: "Parallel preparation work", recovery: 2, resource: "Electrical crew", risk: "Access constraint" },
                ].map((opt) => (
                  <div key={opt.name} className="data-row" style={{ gridTemplateColumns: "1.5fr 0.5fr 0.7fr auto" }}>
                    <div>
                      <b>{opt.name}</b>
                      <small>{opt.resource} · Risk: {opt.risk}</small>
                    </div>
                    <b style={{ color: "var(--green)", fontSize: 13 }}>+{opt.recovery}d</b>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>Recoverable</span>
                    <button className="outline" style={{ fontSize: 10 }}>APPLY</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </AppShell>
  );
}
