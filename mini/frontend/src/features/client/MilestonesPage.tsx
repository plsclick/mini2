import { useEffect, useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiMilestone } from "../../services/projectDataService";

export function MilestonesPage() {
  const { project } = useActiveProject();
  const [milestones, setMilestones] = useState<ApiMilestone[]>([]);
  useEffect(() => { if (project) void projectDataService.listMilestones(project.id).then(setMilestones); else setMilestones([]); }, [project?.id]);
  return <AppShell><main className="page"><section className="page-title compact"><div><p className="eyebrow">{project?.name ?? "NO PROJECT"} · MILESTONES</p><h1>Project milestones</h1><p>Key checkpoints stored for this project.</p></div></section><section className="card" style={{ maxWidth: 820 }}><div className="card-head"><div><p className="eyebrow">ALL MILESTONES</p><h2>{milestones.length} checkpoints defined</h2></div></div>{!milestones.length && <p className="schedule-empty">No milestones have been added to this project.</p>}{milestones.map((milestone) => <div key={milestone.id} className="milestone"><i className={milestone.status === "ACHIEVED" ? "good" : milestone.status === "MISSED" ? "warn" : ""} style={{ fontStyle: "normal" }}>{milestone.status === "ACHIEVED" ? "✓" : milestone.status === "MISSED" ? "!" : "○"}</i><div style={{ flex: 1 }}><b>{milestone.name}</b><small>{milestone.task?.name ?? "No task linked"}</small></div><div style={{ textAlign: "right" }}><small style={{ fontFamily: "DM Mono", fontSize: 9, color: "var(--dim)", display: "block" }}>PLANNED</small><span style={{ fontSize: 11 }}>{new Date(milestone.plannedDate).toLocaleDateString()}</span></div></div>)}</section></main></AppShell>;
}
