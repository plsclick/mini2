import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useTaskStore } from "../../store/taskStore";

type Filter = "all" | "critical" | "at-risk" | "in-progress" | "complete";

export function TaskManager() {
  const tasks = useTaskStore((s) => s.tasks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = tasks.filter((t) => {
    const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "critical" && t.isCritical) ||
      t.status === filter;
    return matchesQuery && matchesFilter;
  });

  const filters: Filter[] = ["all", "critical", "in-progress", "at-risk", "complete"];

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">TASK MANAGEMENT · SKYLINE RESIDENCY</p>
            <h1>Project tasks</h1>
            <p>Create, assign and monitor all construction tasks.</p>
          </div>
          <button className="primary small">
            <Plus size={15} />
            ADD TASK
          </button>
        </section>

        <section className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label className="schedule-search" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 4, padding: "8px 10px", flex: 1, minWidth: 180 }}>
              <Search size={14} color="var(--dim)" />
              <input
                style={{ background: "transparent", border: 0, outline: 0, color: "var(--text)", width: "100%" }}
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 11px",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: filter === f ? "var(--amber)" : "var(--line)",
                    background: filter === f ? "#252117" : "transparent",
                    color: filter === f ? "var(--amber)" : "var(--muted)",
                    fontSize: 10,
                    fontFamily: "DM Mono",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">TASK LIST</p>
              <h2>{visible.length} tasks</h2>
            </div>
          </div>
          <div className="task-list">
            {visible.map((task) => (
              <div key={task.id} style={{ gridTemplateColumns: "1.4fr 0.9fr 0.7fr 0.6fr auto auto" }}>
                <div>
                  <b>{task.name}</b>
                  <span style={{ display: "block", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                    {task.stage}
                    {task.isCritical && (
                      <span style={{ marginLeft: 8, color: "var(--red)", fontFamily: "DM Mono", fontSize: 9 }}>
                        ● CRITICAL
                      </span>
                    )}
                  </span>
                </div>
                <span>
                  {task.progress}%
                  <div style={{ height: 3, background: "var(--line)", borderRadius: 2, marginTop: 5, overflow: "hidden" }}>
                    <div style={{ width: `${task.progress}%`, height: "100%", background: task.isCritical ? "var(--red)" : "var(--amber)" }} />
                  </div>
                </span>
                <span>
                  {task.slack !== undefined ? (
                    <span style={{ color: task.slack === 0 ? "var(--red)" : "var(--muted)" }}>
                      {task.slack}d float
                    </span>
                  ) : "—"}
                </span>
                <StatusBadge
                  tone={
                    task.status === "complete"
                      ? "success"
                      : task.status === "at-risk"
                        ? "danger"
                        : "info"
                  }
                >
                  {task.status.replace("-", " ").toUpperCase()}
                </StatusBadge>
                <button className="link">Inspect</button>
              </div>
            ))}
            {!visible.length && (
              <p style={{ color: "var(--muted)", fontSize: 12, padding: "16px 0" }}>
                No tasks match the current filter.
              </p>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
