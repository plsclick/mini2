import { Check, RotateCcw, Truck, Users, Zap } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { recoveryOptions } from "../../mock/recovery";

const icons = [Truck, Users, Zap];

export function RecoveryCenterPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const recoveredDays = recoveryOptions
    .filter((o) => selected.includes(o.id))
    .reduce((sum, o) => sum + o.recoveryDays, 0);

  const totalDelay = 4;
  const remaining = Math.max(0, totalDelay - recoveredDays);

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">RECOVERY PLANNING · SKYLINE RESIDENCY</p>
            <h1>Schedule recovery</h1>
            <p>
              Combine recovery strategies to restore the project timeline.
            </p>
          </div>
          <button
            className="primary small"
            disabled={!selected.length}
          >
            <RotateCcw size={14} />
            APPLY PLAN
          </button>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
          <section className="card">
            <p className="eyebrow">CURRENT STATUS</p>
            <h2 className="red" style={{ fontSize: 28, letterSpacing: -1, margin: "6px 0 4px" }}>
              +{totalDelay} DAYS DELAY
            </h2>
            <p className="sub">Steel delivery affected the critical path.</p>
          </section>
          <section className="card">
            <p className="eyebrow">RECOVERY PLAN SUMMARY</p>
            <h2
              style={{
                fontSize: 28,
                letterSpacing: -1,
                margin: "6px 0 4px",
                color: recoveredDays > 0 ? "var(--green)" : "var(--text)",
              }}
            >
              {recoveredDays > 0 ? `+${recoveredDays} DAYS` : "0 DAYS"}{" "}
              <small style={{ fontSize: 13, color: "var(--muted)" }}>
                recovered
              </small>
            </h2>
            <p className="sub">
              {remaining === 0
                ? "Full recovery achieved."
                : `${remaining} day${remaining > 1 ? "s" : ""} still unrecovered.`}
            </p>
          </section>
        </div>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">RECOVERY OPTIONS</p>
              <h2>Select strategies to combine</h2>
            </div>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>
              {selected.length} selected
            </span>
          </div>
          <div className="detail-stack">
            {recoveryOptions.map((opt, i) => {
              const Icon = icons[i % icons.length];
              const active = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className="data-row"
                  style={{
                    gridTemplateColumns: "32px 1.5fr 0.6fr 0.6fr 0.6fr auto",
                    cursor: "pointer",
                    background: active ? "#1c2515" : "transparent",
                    borderRadius: 4,
                    border: active ? "1px solid #3d5a1f" : "1px solid transparent",
                    padding: "13px 10px",
                    width: "100%",
                    textAlign: "left",
                    color: "inherit",
                    display: "grid",
                    alignItems: "center",
                    gap: 18,
                    marginBottom: 2,
                  }}
                >
                  <Icon size={16} color={active ? "var(--green)" : "var(--dim)"} />
                  <div>
                    <b style={{ fontSize: 12 }}>{opt.name}</b>
                    <small style={{ display: "block", color: "var(--muted)", fontSize: 10, marginTop: 3 }}>
                      {opt.resourceRequirement} · Risk: {opt.risk}
                    </small>
                  </div>
                  <span>
                    <small style={{ fontSize: 9, fontFamily: "DM Mono", color: "var(--dim)", display: "block" }}>RECOVERY</small>
                    <b style={{ color: "var(--green)" }}>+{opt.recoveryDays}d</b>
                  </span>
                  <span>
                    <small style={{ fontSize: 9, fontFamily: "DM Mono", color: "var(--dim)", display: "block" }}>TASKS</small>
                    <b>{opt.affectedTasks}</b>
                  </span>
                  <StatusBadge tone={opt.status === "recommended" ? "success" : "info"}>
                    {opt.status.toUpperCase()}
                  </StatusBadge>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: `2px solid ${active ? "var(--green)" : "var(--line)"}`,
                      borderRadius: 3,
                      background: active ? "var(--green)" : "transparent",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {active && <Check size={11} color="#0c2415" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
