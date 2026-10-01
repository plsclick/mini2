import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiStage, type ApiTask } from "../../services/projectDataService";

type Filter = "all" | "critical" | "in-progress" | "complete" | "blocked";
const statusLabel = (status: string) => status === "IN_PROGRESS" ? "in-progress" : status === "COMPLETED" ? "complete" : status.toLowerCase();

export function TaskManager() {
  const { project, isLoading: projectLoading } = useActiveProject();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [stages, setStages] = useState<ApiStage[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [stageId, setStageId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState("");

  const load = () => {
    if (!project) { setTasks([]); setStages([]); return; }
    void Promise.all([projectDataService.listTasks(project.id), projectDataService.listStages(project.id)]).then(([taskResult, stageResult]) => { setTasks(taskResult); setStages(stageResult); }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load project tasks."));
  };
  useEffect(load, [project?.id]);
  const visible = tasks.filter((task) => task.name.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "critical" && task.priority === "CRITICAL") || statusLabel(task.status) === filter));
  const saveTask = async () => {
    if (!project || name.trim().length < 2) { setError("Enter a task name."); return; }
    try { await projectDataService.createTask(project.id, { name: name.trim(), stageId: stageId || undefined, priority }); setName(""); setError(""); setIsAdding(false); load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create task."); }
  };

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact"><div><p className="eyebrow">TASK MANAGEMENT · {project?.name ?? "NO PROJECT"}</p><h1>Project tasks</h1><p>Tasks here are the records used by the live schedule and dependency views.</p></div><button className="primary small" type="button" onClick={() => setIsAdding((value) => !value)} disabled={!project}><Plus size={15} /> ADD TASK</button></section>
        {isAdding && <section className="card" style={{ marginBottom: 12 }}><p className="eyebrow">NEW TASK</p><div className="twocol"><label>TASK NAME<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Install steel" /></label><label>STAGE<select value={stageId} onChange={(event) => setStageId(event.target.value)}><option value="">Unassigned</option>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label><label>PRIORITY<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label></div>{error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}<div className="form-row"><button className="link" type="button" onClick={() => setIsAdding(false)}>CANCEL</button><button className="primary small" type="button" onClick={() => void saveTask()}>ADD TASK</button></div></section>}
        <section className="card" style={{ marginBottom: 12 }}><div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><label className="schedule-search" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 4, padding: "8px 10px", flex: 1, minWidth: 180 }}><Search size={14} color="var(--dim)" /><input aria-label="Search tasks" style={{ background: "transparent", border: 0, outline: 0, color: "var(--text)", width: "100%" }} placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{(["all", "critical", "in-progress", "blocked", "complete"] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} style={{ padding: "7px 11px", borderRadius: 3, border: "1px solid", borderColor: filter === item ? "var(--amber)" : "var(--line)", background: filter === item ? "#252117" : "transparent", color: filter === item ? "var(--amber)" : "var(--muted)", fontSize: 10, fontFamily: "DM Mono", textTransform: "uppercase" }}>{item}</button>)}</div></div></section>
        <section className="card"><div className="card-head"><div><p className="eyebrow">TASK LIST</p><h2>{projectLoading ? "Loading..." : `${visible.length} tasks`}</h2></div></div>{!project && !projectLoading && <p className="schedule-empty">Create a project before adding tasks.</p>}{project && !visible.length && <p className="schedule-empty">No tasks match this filter.</p>}<div className="task-list">{visible.map((task) => <div key={task.id} style={{ gridTemplateColumns: "1.4fr 0.9fr 0.7fr 0.6fr" }}><div><b>{task.name}</b><span style={{ display: "block", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{task.stage?.name ?? "Unassigned"}{task.priority === "CRITICAL" && <span style={{ marginLeft: 8, color: "var(--red)", fontFamily: "DM Mono", fontSize: 9 }}>● CRITICAL</span>}</span></div><span>{task.progress}%<div style={{ height: 3, background: "var(--line)", borderRadius: 2, marginTop: 5, overflow: "hidden" }}><div style={{ width: `${task.progress}%`, height: "100%", background: task.priority === "CRITICAL" ? "var(--red)" : "var(--amber)" }} /></div></span><StatusBadge tone={task.status === "COMPLETED" ? "success" : task.status === "BLOCKED" ? "danger" : "info"}>{statusLabel(task.status).replace("-", " ").toUpperCase()}</StatusBadge><span style={{ color: "var(--muted)", fontSize: 10 }}>{task.assignedTo?.name ?? "Unassigned"}</span></div>)}</div></section>
      </main>
    </AppShell>
  );
}
