import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiTask } from "../../services/projectDataService";

export function MyTasks() {
  const navigate = useNavigate();
  const { project } = useActiveProject();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  useEffect(() => { if (project) void projectDataService.listTasks(project.id).then(setTasks); else setTasks([]); }, [project?.id]);
  const active = tasks.filter((task) => task.status !== "COMPLETED" && task.status !== "CANCELLED");
  return <AppShell><main className="page"><section className="page-title compact"><div><p className="eyebrow">MY SITE TASKS · {project?.name ?? "NO PROJECT"}</p><h1>My tasks</h1><p>Tasks and progress from the project database.</p></div><button className="primary small" type="button" onClick={() => navigate("/cm/progress")} disabled={!project}>UPDATE PROGRESS</button></section><section className="card task-list">{!active.length && <p className="schedule-empty">No open tasks have been added to this project.</p>}{active.map((task) => <div key={task.id}><div><b>{task.name}</b><span>{task.stage?.name ?? "Unassigned"}</span></div><span>{task.progress}% complete</span><StatusBadge tone={task.status === "BLOCKED" ? "danger" : "info"}>{task.status.replaceAll("_", " ")}</StatusBadge><button className="link" type="button" onClick={() => navigate("/cm/progress")}>UPDATE</button></div>)}</section></main></AppShell>;
}
