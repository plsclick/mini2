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
import { activeTasks } from "../../mock/tasks";
import { ActionModal } from "./ActionModal";
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
  return (
    <AppShell>
      <main className="page cm-page">
        <section className="page-title">
          <div>
            <p className="eyebrow">SITE OPERATIONS · WEDNESDAY, 18 NOV</p>
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
            value="08"
            detail="3 on your watch"
            tone="amber"
          />
          <MetricCard label="COMPLETED TODAY" value="04" detail="Target: 6" />
          <MetricCard
            label="DELAYED"
            value="02"
            detail="Needs attention"
            tone="danger"
          />
          <MetricCard
            label="OPEN ISSUES"
            value="03"
            detail="2 material related"
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
              <button className="link">View all tasks</button>
            </div>
            {activeTasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div>
                  <StatusBadge
                    tone={task.status === "at-risk" ? "danger" : "info"}
                  >
                    {task.status === "at-risk" ? "AT RISK" : "IN PROGRESS"}
                  </StatusBadge>
                  <h3>{task.name.toUpperCase()}</h3>
                  <p>
                    {task.stage.toUpperCase()} · Expected {task.expected}
                  </p>
                </div>
                <div className="task-progress">
                  <b>{task.progress}%</b>
                  <div>
                    <i style={{ width: `${task.progress}%` }} />
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
          </section>
          <section className="card site-feed">
            <div className="card-head">
              <div>
                <p className="eyebrow">SITE UPDATES</p>
                <h2>Today’s activity</h2>
              </div>
              <button className="link">All activity</button>
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
