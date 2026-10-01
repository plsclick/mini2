import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiTask } from "../../services/projectDataService";

export function ProgressPage() {
  const { project } = useActiveProject();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newPct, setNewPct] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const load = () => { if (project) void projectDataService.listTasks(project.id).then(setTasks); else setTasks([]); };
  useEffect(load, [project?.id]);
  const submit = async (task: ApiTask) => { await projectDataService.updateTask(task.id, { progress: newPct, status: newPct >= 100 ? "COMPLETED" : newPct > 0 ? "IN_PROGRESS" : "TODO" }); setEditing(null); setSubmitted(task.id); load(); };
  const assignedTasks = tasks.filter((task) => task.status === "IN_PROGRESS" || task.status === "BLOCKED" || task.progress > 0);
  return <AppShell><main className="page"><section className="page-title compact"><div><p className="eyebrow">SITE OPERATIONS · {project?.name ?? "NO PROJECT"}</p><h1>Update progress</h1><p>Report current completion for live project tasks.</p></div></section><section className="card"><div className="card-head"><div><p className="eyebrow">ACTIVE TASKS</p><h2>{assignedTasks.length} active tasks</h2></div></div>{!assignedTasks.length && <p className="schedule-empty">No active tasks have been added to this project.</p>}{assignedTasks.map((task) => <div key={task.id} style={{ borderTop: "1px solid var(--line)", padding: "16px 0", display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: 16, alignItems: "center" }}><div><StatusBadge tone={task.status === "BLOCKED" ? "danger" : "info"}>{task.status.replaceAll("_", " ")}</StatusBadge><b style={{ display: "block", fontSize: 13, marginTop: 7 }}>{task.name}</b><p style={{ margin: "3px 0 0", fontSize: 10, color: "var(--muted)" }}>{task.stage?.name ?? "Unassigned"}</p></div><div>{editing === task.id ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="range" min={0} max={100} value={newPct} onChange={(event) => setNewPct(Number(event.target.value))} style={{ flex: 1 }} /><b>{newPct}%</b></div> : <><b style={{ fontSize: 18 }}>{task.progress}%</b><div style={{ height: 4, background: "var(--line)", marginTop: 6, overflow: "hidden" }}><div style={{ width: `${task.progress}%`, height: "100%", background: "var(--amber)" }} /></div></>}</div><div style={{ display: "flex", gap: 8 }}>{editing === task.id ? <><button className="primary small" type="button" onClick={() => void submit(task)}><Check size={13} /> SAVE</button><button className="outline" type="button" onClick={() => setEditing(null)}>CANCEL</button></> : <button className={submitted === task.id ? "outline" : "primary small"} type="button" onClick={() => { setEditing(task.id); setNewPct(task.progress); setSubmitted(null); }}>{submitted === task.id ? "UPDATED" : "UPDATE"}</button>}</div></div>)}</section></main></AppShell>;
}
