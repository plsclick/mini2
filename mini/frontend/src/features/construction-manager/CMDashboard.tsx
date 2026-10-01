import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Box,
  Camera,
  HardHat,
  Plus,
  Truck,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/navigation/AppShell";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { MetricCard } from "../../components/ui/MetricCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ActionModal } from "./ActionModal";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
const actions = [
  ["UPDATE PROGRESS", Activity],
  ["REPORT DELAY", AlertTriangle],
  ["MATERIAL", Truck],
  ["WORKFORCE", HardHat],
  ["EQUIPMENT", Wrench],
  ["SITE UPDATE", Camera],
] as const;
export function CMDashboard() {
  const [action, setAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const { schedule, dashboard } = useProjectSchedule();
  const activeTasks = (schedule?.tasks ?? []).filter((task) => task.status === "IN_PROGRESS" || task.status === "BLOCKED");
  return (
    <AppShell>
      <main className="page cm-page">
        <section className="page-title">
          <div>
            <p className="eyebrow">SITE OPERATIONS · {dashboard?.project.name ?? "NO PROJECT"}</p>
            <h1>Today’s operations</h1>
            <p>Keep site work moving and report exceptions early.</p>
          </div>
          <button
            className="primary small"
            onClick={() => navigate("/cm/updates")}
          >
            <Plus size={16} />
            SITE UPDATE
          </button>
        </section>
        <div className="metrics four">
          <MetricCard
            label="ACTIVE TASKS"
            value={String(activeTasks.length).padStart(2, "0")}
            detail="In progress or blocked"
            tone="amber"
          />
          <MetricCard label="COMPLETED TASKS" value={String(dashboard?.statistics.completedTasks ?? 0).padStart(2, "0")} detail={`of ${dashboard?.statistics.totalTasks ?? 0} total`} />
          <MetricCard
            label="DELAYED"
            value={String(dashboard?.statistics.activeDelays ?? 0).padStart(2, "0")}
            detail="Active delays"
            tone="danger"
          />
          <MetricCard
            label="OPEN ISSUES"
            value={String(dashboard?.statistics.activeRisks ?? 0).padStart(2, "0")}
            detail="Active risks"
          />
        </div>
        <section className="quick">
          <p className="eyebrow">QUICK ACTIONS</p>
          {actions.map(([name, Icon]) => (
            <button key={name} onClick={() => name === "SITE UPDATE" ? navigate("/cm/updates") : setAction(name)}>
              <Icon />
              <span>{name}</span>
            </button>
          ))}
        </section>
        <div className="cm-grid">
          <section className="card active-work">
            <div className="card-head">
              <div>
                <p className="eyebrow">ACTIVE WORK</p>
                <h2>On site now</h2>
              </div>
              <button className="link" type="button" onClick={() => navigate("/cm/tasks")}>View all tasks</button>
            </div>
            {activeTasks.map((task) => (
              <div className="task-card" key={task.taskId}>
                <div>
                  <StatusBadge
                    tone={task.status === "BLOCKED" ? "danger" : "info"}
                  >
                    {task.status === "BLOCKED" ? "BLOCKED" : "IN PROGRESS"}
                  </StatusBadge>
                  <h3>{task.name.toUpperCase()}</h3>
                  <p>{(task.stageName ?? "UNASSIGNED").toUpperCase()} · Expected {task.earliestFinish}</p>
                </div>
                <div className="task-progress">
                  <b>{task.status === "COMPLETED" ? 100 : 0}%</b>
                  <div>
                    <i style={{ width: `${task.status === "COMPLETED" ? 100 : 0}%` }} />
                  </div>
                </div>
                <button
                  className="outline"
                  onClick={() => setAction("UPDATE PROGRESS")}
                >
                  UPDATE <ArrowRight size={14} />
                </button>
              </div>
            ))}
            {!activeTasks.length && <p className="schedule-empty">No active site tasks yet.</p>}
          </section>
          <section className="card site-feed">
            <div className="card-head">
              <div>
                <p className="eyebrow">SITE UPDATES</p>
                <h2>Today’s activity</h2>
              </div>
              <button className="link" type="button" onClick={() => navigate("/cm/activity")}>All activity</button>
            </div>
            <ActivityFeed />
          </section>
          <section className="card needs">
            <p className="eyebrow">NEXT REQUIREMENT</p>
            <h2>Steel rods</h2>
            <p>
              500 kg · Required by <b>18 Nov</b>
            </p>
            <div>
              <StatusBadge tone="danger">HIGH PRIORITY</StatusBadge>
              <button
                className="primary small"
                onClick={() => setAction("MATERIAL REQUIREMENT")}
              >
                <Box size={14} />
                SUBMIT REQUIREMENT
              </button>
            </div>
          </section>
        </div>
        {action && (
          <ActionModal title={action} onClose={() => setAction(null)} />
        )}
      </main>
    </AppShell>
  );
}
