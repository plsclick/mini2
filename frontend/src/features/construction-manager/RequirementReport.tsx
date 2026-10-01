import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
import { api } from "../../services/api";
export function RequirementReport() {
  const { projectId, refresh } = useProjectSchedule();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("MATERIAL");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!projectId || title.trim().length < 2) { setError("Enter a requirement title."); return; }
    setSaving(true);
    setError("");
    try {
      await api.post(`/projects/${projectId}/requirements`, { title: title.trim(), description: description || undefined, type, quantity, unit: unit || undefined, priority });
      setMessage("Requirement submitted to the project team.");
      setTitle("");
      setDescription("");
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit the requirement.");
    } finally { setSaving(false); }
  };

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact"><div><p className="eyebrow">SITE REQUIREMENTS</p><h1>Material, workforce & equipment</h1><p>Request what the site needs and keep the project moving.</p></div></section>
        <section className="card" style={{ maxWidth: 760 }}>
          <p className="eyebrow">NEW REQUIREMENT</p>
          <div className="twocol">
            <label>TITLE<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Steel rods" /></label>
            <label>TYPE<select value={type} onChange={(event) => setType(event.target.value)}><option value="MATERIAL">Material</option><option value="WORKFORCE">Workforce</option><option value="EQUIPMENT">Equipment</option><option value="OTHER">Other</option></select></label>
            <label>QUANTITY<input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>UNIT<input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="kg, people, units" /></label>
            <label>PRIORITY<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
          </div>
          <label>DESCRIPTION<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is needed and why?" /></label>
          {message && <p role="status">{message}</p>}
          {error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}
          <button className="primary small" type="button" onClick={() => void submit()} disabled={saving}>{saving ? "SUBMITTING..." : "SUBMIT REQUIREMENT"}</button>
        </section>
      </main>
    </AppShell>
  );
}
