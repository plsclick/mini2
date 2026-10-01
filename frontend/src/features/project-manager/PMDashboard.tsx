import { MoreHorizontal, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { CriticalPath } from "../../components/dependency/CriticalPath";
import { RiskCenter } from "../../components/risk/RiskCenter";
import { GanttChart } from "../../components/timeline/GanttChart";
import { AppShell } from "../../components/navigation/AppShell";
import { MetricCard } from "../../components/ui/MetricCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
const healthScores: [string, number][] = [
  ["Schedule", 76],
  ["Execution", 84],
  ["Resources", 89],
  ["Risk", 68],
];
export function PMDashboard() {
  const [simulated, setSimulated] = useState(false);
  const { schedule } = useProjectSchedule();
  return (
    <AppShell>
      <main className="page pm-page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SKYLINE RESIDENCY · PROJECT CONTROL</p>
            <h1>Good morning, Aditya.</h1>
            <p>Here’s the current project pulse.</p>
          </div>
          <button className="primary small">
            <Plus size={16} />
            CREATE UPDATE
          </button>
        </section>
        <div className="metrics six">
          <MetricCard
            label="OVERALL PROGRESS"
            value="72%"
            detail="↑ 4% this week"
            tone="amber"
          />
          <MetricCard
            label="SCHEDULE VARIANCE"
            value="+4d"
            detail="At risk"
            tone="danger"
          />
          <MetricCard label="CRITICAL TASKS" value={schedule ? String(schedule.statistics.criticalTaskCount).padStart(2, "0") : "—"} detail={schedule ? `of ${schedule.statistics.totalTasks} tasks` : "Schedule unavailable"} />
          <MetricCard
            label="ACTIVE DELAYS"
            value="03"
            detail="Needs review"
            tone="danger"
          />
          <MetricCard
            label="PROJECT RISK"
            value="MED"
            detail="Medium exposure"
            tone="amber"
          />
          <MetricCard label="RESOURCES" value="84%" detail="Utilization" />
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
                  82<small>%</small>
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
              <button className="link">Expand graph</button>
            </div>
            <CriticalPath schedule={schedule} />
          </section>
          <section className="card recovery">
            <p className="eyebrow">RECOVERY CENTER</p>
            <h2>
              Recover <span>+4 days</span>
            </h2>
            <p className="sub">Combine interventions to restore schedule.</p>
            {[
              ["Expedite Steel", "2 days"],
              ["Additional Workforce", "1 day"],
              ["Parallel Electrical Prep", "2 days"],
            ].map(([name, days]) => (
              <div className="recovery-row" key={name}>
                <span>
                  <Truck size={16} />
                  {name}
                </span>
                <b>+{days}</b>
                <button>ADD</button>
              </div>
            ))}
          </section>
          <section className="card simulator">
            <div>
              <p className="eyebrow">SCHEDULE SIMULATOR</p>
              <h2>What if this task is delayed?</h2>
            </div>
            <div className="sim-controls">
              <label>
                SELECT TASK
                <select>
                  <option>Structural Steel</option>
                </select>
              </label>
              <label>
                DELAY
                <div className="stepper">
                  <button>−</button>
                  <b>5 DAYS</b>
                  <button>+</button>
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
                <span>
                  Original <b>18 Dec</b>
                </span>
                <span>→</span>
                <span>
                  Simulated <b className="red">23 Dec</b>
                </span>
                <span>8 affected tasks · critical path affected</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
