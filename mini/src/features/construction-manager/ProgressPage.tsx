import { Check } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { useTaskStore } from "../../store/taskStore";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function ProgressPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateProgress = useTaskStore((s) => s.updateProgress);
  const [editing, setEditing] = useState<string | null>(null);
  const [newPct, setNewPct] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const startEdit = (id: string, current: number) => {
    setEditing(id);
    setNewPct(current);
    setSubmitted(null);
  };

  const submit = (id: string) => {
    updateProgress(id, newPct);
    setEditing(null);
    setSubmitted(id);
  };

  const assignedTasks = tasks.filter(
    (t) => t.status === "in-progress" || t.status === "at-risk",
  );

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SITE OPERATIONS · SKYLINE RESIDENCY</p>
            <h1>Update progress</h1>
            <p>Report current completion for tasks assigned to you.</p>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">ASSIGNED TASKS</p>
              <h2>{assignedTasks.length} active tasks</h2>
            </div>
          </div>
          {assignedTasks.map((task) => (
            <div
              key={task.id}
              style={{
                borderTop: "1px solid var(--line)",
                padding: "16px 0",
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr auto",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <StatusBadge tone={task.status === "at-risk" ? "danger" : "info"}>
                    {task.status.replace("-", " ").toUpperCase()}
                  </StatusBadge>
                  {task.isCritical && (
                    <span style={{ fontSize: 9, fontFamily: "DM Mono", color: "var(--red)" }}>
                      CRITICAL PATH
                    </span>
                  )}
                </div>
                <b style={{ fontSize: 13 }}>{task.name}</b>
                <p style={{ margin: "3px 0 0", fontSize: 10, color: "var(--muted)" }}>
                  {task.stage} · Expected {task.expected}
                </p>
              </div>

              <div>
                {editing === task.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={newPct}
                      onChange={(e) => setNewPct(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <b style={{ fontSize: 15, minWidth: 36 }}>{newPct}%</b>
                  </div>
                ) : (
                  <div>
                    <b style={{ fontSize: 18 }}>{task.progress}%</b>
                    <div style={{ height: 4, background: "var(--line)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: `${task.progress}%`, height: "100%", background: "var(--amber)" }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {editing === task.id ? (
                  <>
                    <button className="primary small" onClick={() => submit(task.id)}>
                      <Check size={13} />
                      SAVE
                    </button>
                    <button className="outline" style={{ fontSize: 10 }} onClick={() => setEditing(null)}>
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button
                    className={submitted === task.id ? "outline" : "primary small"}
                    onClick={() => startEdit(task.id, task.progress)}
                    style={{ fontSize: submitted === task.id ? 10 : undefined }}
                  >
                    {submitted === task.id ? "✓ UPDATED" : "UPDATE"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
