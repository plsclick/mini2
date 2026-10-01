import { Play } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";

function addDays(value: string | null | undefined, days: number) {
  if (!value) return "Not calculated";
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toLocaleDateString("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function SimulationPage() {
  const { schedule, dashboard } = useProjectSchedule();
  const [selectedTask, setSelectedTask] = useState("");
  const [delayDays, setDelayDays] = useState(1);
  const [ran, setRan] = useState(false);
  const selected = schedule?.tasks.find((task) => task.taskId === selectedTask) ?? schedule?.tasks[0];
  return <AppShell><main className="page"><section className="page-title compact"><div><p className="eyebrow">SCHEDULE SIMULATOR · {dashboard?.project.name ?? "NO PROJECT"}</p><h1>What-if simulation</h1><p>Preview the effect of a task delay using the live project schedule.</p></div></section><div className="pm-grid" style={{ gridTemplateColumns: "1fr 1fr" }}><section className="card"><p className="eyebrow">SIMULATION PARAMETERS</p><h2>Configure scenario</h2><div className="sim-controls" style={{ flexDirection: "column", alignItems: "stretch", gap: 14, marginTop: 18 }}><label>SELECT TASK<select value={selected?.taskId ?? ""} onChange={(event) => { setSelectedTask(event.target.value); setRan(false); }}><option value="">Select task</option>{schedule?.tasks.map((task) => <option key={task.taskId} value={task.taskId}>{task.name}</option>)}</select></label><label>DELAY DURATION<div className="stepper"><button type="button" onClick={() => { setDelayDays(Math.max(1, delayDays - 1)); setRan(false); }}>−</button><b>{delayDays} DAYS</b><button type="button" onClick={() => { setDelayDays(delayDays + 1); setRan(false); }}>+</button></div></label><button className="primary small" type="button" style={{ width: "100%", marginTop: 8 }} onClick={() => setRan(true)} disabled={!selected}><Play size={14} /> RUN SIMULATION</button></div></section><section className="card"><p className="eyebrow">SIMULATION RESULT</p><h2>Impact analysis</h2>{!ran ? <p className="sub" style={{ marginTop: 18 }}>{selected ? "Configure parameters and run the simulation." : "Add tasks to the project before simulating impact."}</p> : <div className="sim-result" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12, border: 0, padding: 0, marginTop: 18 }}><div><span>Current completion <b>{schedule?.calculatedCompletionDate ?? "Not calculated"}</b></span><span> → </span><span>Preview <b className="red">{addDays(schedule?.calculatedCompletionDate, delayDays)}</b></span></div><p className="sub">{selected?.name} delayed by {delayDays} day{delayDays === 1 ? "" : "s"}. This preview does not write to the database; submit a delay report to update the schedule.</p></div>}</section></div></main></AppShell>;
}
