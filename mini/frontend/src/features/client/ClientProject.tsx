import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";

export function ClientProject() {
  const { dashboard, schedule, isLoading } = useProjectSchedule();
  return <AppShell><main className="page"><section className="page-title compact"><div><p className="eyebrow">PROJECT OVERVIEW · READ ONLY</p><h1>{dashboard?.project.name ?? "Project overview"}</h1><p>{isLoading ? "Loading live project data..." : "Current status from the project database."}</p></div></section><section className="card" style={{ maxWidth: 820 }}><div className="card-head"><div><p className="eyebrow">PROJECT STATUS</p><h2>{dashboard ? `${Math.round(dashboard.project.progress)}% complete` : "No project data"}</h2></div>{dashboard && <StatusBadge tone={dashboard.statistics.activeRisks ? "danger" : "success"}>{dashboard.statistics.activeRisks ? "AT RISK" : "ON TRACK"}</StatusBadge>}</div><div className="detail-stack"><div className="data-row"><span>Tasks completed</span><b>{dashboard ? `${dashboard.statistics.completedTasks} / ${dashboard.statistics.totalTasks}` : "—"}</b></div><div className="data-row"><span>Calculated completion</span><b>{schedule?.calculatedCompletionDate ?? "Not scheduled"}</b></div><div className="data-row"><span>Active delays</span><b>{dashboard?.statistics.activeDelays ?? "—"}</b></div><div className="data-row"><span>Active risks</span><b>{dashboard?.statistics.activeRisks ?? "—"}</b></div></div></section></main></AppShell>;
}
