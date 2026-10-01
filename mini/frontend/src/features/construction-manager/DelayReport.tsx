import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
import { api } from "../../services/api";
export function DelayReport() {
  const { projectId, schedule, refresh } = useProjectSchedule();
  const [taskId, setTaskId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [delayDays, setDelayDays] = useState(1);
  const [severity, setSeverity] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const selectedTaskId = taskId || schedule?.tasks[0]?.taskId;
    if (!projectId || !selectedTaskId || reason.trim().length < 5) {
      setError("Select a task and enter a reason of at least 5 characters.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post(`/projects/${projectId}/delays`, { taskId: selectedTaskId, reason: reason.trim(), description: description || undefined, delayDays, severity });
      setMessage("Delay reported. The schedule will recalculate automatically.");
      setReason("");
      setDescription("");
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not report the delay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact"><div><p className="eyebrow">PROJECT EXCEPTION</p><h1>Report a delay</h1><p>Report site impact before it grows.</p></div></section>
        <section className="card" style={{ maxWidth: 760 }}>
          <p className="eyebrow">DELAY DETECTION</p>
          <div className="twocol">
            <label>TASK<select value={taskId || schedule?.tasks[0]?.taskId || ""} onChange={(event) => setTaskId(event.target.value)}><option value="">Select task</option>{schedule?.tasks.map((task) => <option key={task.taskId} value={task.taskId}>{task.name}</option>)}</select></label>
            <label>SEVERITY<select value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
            <label>DELAY DAYS<input type="number" min="1" value={delayDays} onChange={(event) => setDelayDays(Math.max(1, Number(event.target.value) || 1))} /></label>
            <label>REASON<input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Material delivery missed" /></label>
          </div>
          <label>DESCRIPTION<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain what happened and what is affected." /></label>
          {message && <p role="status">{message}</p>}
          {error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}
          <button className="primary small" type="button" onClick={() => void submit()} disabled={saving}>{saving ? "SUBMITTING..." : "SUBMIT DELAY REPORT"}</button>
        </section>
      </main>
    </AppShell>
  );
}
