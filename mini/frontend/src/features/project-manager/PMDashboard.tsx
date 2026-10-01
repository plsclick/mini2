import { MoreHorizontal, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CriticalPath } from "../../components/dependency/CriticalPath";
import { RiskCenter } from "../../components/risk/RiskCenter";
import { GanttChart } from "../../components/timeline/GanttChart";
import { AppShell } from "../../components/navigation/AppShell";
import { MetricCard } from "../../components/ui/MetricCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
import { useAuthStore } from "../../store/authStore";
export function PMDashboard() {
  const navigate = useNavigate();
  const [simulated, setSimulated] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [delayDays, setDelayDays] = useState(1);
  const { schedule, dashboard } = useProjectSchedule();
  const user = useAuthStore((state) => state.user);
  const statistics = dashboard?.statistics;
  const selectedTask = schedule?.tasks.find((task) => task.taskId === selectedTaskId) ?? schedule?.tasks[0];
  const healthScores: [string, number][] = [
    ["Schedule", statistics ? Math.max(0, 100 - statistics.activeDelayDays * 5) : 0],
    ["Execution", statistics?.averageTaskProgress ?? 0],
    ["Resources", statistics ? Math.min(100, statistics.resources * 10) : 0],
    ["Risk", statistics ? Math.max(0, 100 - statistics.riskWeight * 10) : 0],
  ];
  return (
    <AppShell>
      <main className="page pm-page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">{dashboard?.project.name ?? "PROJECT CONTROL"}</p>
            <h1>Good morning, {user?.name ?? "there"}.</h1>
            <p>{dashboard ? "Here’s the current project pulse." : "Loading project data..."}</p>
          </div>
          <button className="primary small" type="button" onClick={() => navigate("/pm/activity")}>
            <Plus size={16} />
            CREATE UPDATE
          </button>
        </section>
        <div className="metrics six">
          <MetricCard
            label="OVERALL PROGRESS"
            value={dashboard ? `${Math.round(dashboard.project.progress)}%` : "—"}
            detail={statistics ? `${statistics.completedTasks} of ${statistics.totalTasks} tasks complete` : "Loading"}
            tone="amber"
          />
          <MetricCard
            label="SCHEDULE VARIANCE"
            value={statistics ? `+${statistics.activeDelayDays}d` : "—"}
            detail={statistics?.activeDelays ? `${statistics.activeDelays} active delays` : "No active delays"}
            tone="danger"
          />
          <MetricCard label="CRITICAL TASKS" value={schedule ? String(schedule.statistics.criticalTaskCount).padStart(2, "0") : "—"} detail={schedule ? `of ${schedule.statistics.totalTasks} tasks` : "Schedule unavailable"} />
          <MetricCard
            label="ACTIVE DELAYS"
            value={statistics ? String(statistics.activeDelays).padStart(2, "0") : "—"}
            detail={statistics?.activeDelays ? "Needs review" : "None reported"}
            tone="danger"
          />
          <MetricCard
            label="PROJECT RISK"
            value={statistics ? statistics.activeRisks ? statistics.riskWeight >= 6 ? "HIGH" : "MED" : "LOW" : "—"}
            detail={statistics ? `${statistics.activeRisks} active risks` : "Loading"}
            tone="amber"
          />
          <MetricCard label="RESOURCES" value={statistics ? String(statistics.resources) : "—"} detail="Assigned resources" />
        </div>
        <div className="pm-grid">
          <section className="card health">
            <div className="card-head">
              <div>
                <p className="eyebrow">PROJECT HEALTH</p>
                <h2>Performance index</h2>
              </div>
              <MoreHorizontal />
            </div>
            <div className="health-body">
              <div className="health-score">
                  <strong>
                    {statistics ? Math.round(healthScores.reduce((sum, [, value]) => sum + value, 0) / healthScores.length) : "—"}<small>{statistics ? "%" : ""}</small>
                </strong>
                <span>OVERALL HEALTH</span>
              </div>
              <div className="health-bars">
                {healthScores.map(([name, value]) => (
                  <ProgressBar key={name} name={name} value={value} />
                ))}
              </div>
            </div>
          </section>
          <RiskCenter />
          <section className="card gantt">
            <div className="card-head">
              <div>
                <p className="eyebrow">PROJECT TIMELINE</p>
                <h2>Master schedule</h2>
              </div>
              <div className="tabs">
                <b>WEEK</b>
                <span>MONTH</span>
              </div>
            </div>
            <GanttChart schedule={schedule} />
          </section>
          <section className="card flow">
            <div className="card-head">
              <div>
                <p className="eyebrow">CRITICAL PATH</p>
                <h2>Dependency network</h2>
              </div>
              <button className="link" type="button" onClick={() => navigate("/pm/critical-path")}>Expand graph</button>
            </div>
            <CriticalPath schedule={schedule} />
          </section>
          <section className="card recovery">
            <p className="eyebrow">RECOVERY CENTER</p>
            <h2>
              Active impact <span>{statistics ? `${statistics.activeDelayDays} days` : "—"}</span>
            </h2>
            <p className="sub">Recovery recommendations will use the active delays and project schedule.</p>
            <div className="recovery-row"><span><Truck size={16} />Active delays</span><b>{statistics?.activeDelays ?? "—"}</b></div>
          </section>
          <section className="card simulator">
            <div>
              <p className="eyebrow">SCHEDULE SIMULATOR</p>
              <h2>What if this task is delayed?</h2>
            </div>
            <div className="sim-controls">
              <label>
                SELECT TASK
                <select value={selectedTask?.taskId ?? ""} onChange={(event) => { setSelectedTaskId(event.target.value); setSimulated(false); }}>
                  {!schedule?.tasks.length && <option value="">No tasks available</option>}
                  {schedule?.tasks.map((task) => <option key={task.taskId} value={task.taskId}>{task.name}</option>)}
                </select>
              </label>
              <label>
                DELAY
                <div className="stepper">
                  <button type="button" onClick={() => setDelayDays((value) => Math.max(1, value - 1))}>−</button>
                  <b>{delayDays} DAYS</b>
                  <button type="button" onClick={() => setDelayDays((value) => value + 1)}>+</button>
                </div>
              </label>
              <button
                className="primary small"
                onClick={() => setSimulated(true)}
              >
                RUN SIMULATION
              </button>
            </div>
            {simulated && (
              <div className="sim-result">
                <span>{selectedTask?.name ?? "No task selected"}</span>
                <span>→</span>
                <span><b className="red">+{delayDays} days</b></span>
                <span>Simulation preview only; save a delay report to update the project.</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
