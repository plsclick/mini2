import { useEffect, useState } from "react";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiResource } from "../../services/projectDataService";
import { ProgressBar } from "../ui/ProgressBar";

export function ResourceCenter() {
  const { project } = useActiveProject();
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("EQUIPMENT");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const load = () => { if (project) void projectDataService.listResources(project.id).then(setResources).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load resources.")); else setResources([]); };
  useEffect(load, [project?.id]);
  const add = async () => { if (!project || !name.trim()) { setError("Enter a resource name."); return; } try { await projectDataService.createResource(project.id, { name: name.trim(), type, quantity, status: "AVAILABLE" }); setName(""); setQuantity(1); setAdding(false); setError(""); load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create resource."); } };
  return <section className="card data-table"><div className="card-head"><div><p className="eyebrow">RESOURCE CENTER</p><h2>Availability and utilization</h2></div><button className="link" type="button" onClick={() => setAdding((value) => !value)} disabled={!project}>{adding ? "CANCEL" : "ADD RESOURCE"}</button></div>{adding && <div className="twocol"><label>NAME<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Crane or crew" /></label><label>TYPE<select value={type} onChange={(event) => setType(event.target.value)}><option value="WORKFORCE">Workforce</option><option value="EQUIPMENT">Equipment</option><option value="SUBCONTRACTOR">Subcontractor</option><option value="OTHER">Other</option></select></label><label>QUANTITY<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label><button className="primary small" type="button" onClick={() => void add()}>SAVE RESOURCE</button></div>}{error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}{!resources.length && <p className="schedule-empty">No resources have been added to this project.</p>}{resources.map((resource) => <div className="data-row" key={resource.id}><div><b>{resource.name}</b><small>{resource.type.replaceAll("_", " ")} · {resource.quantity} {resource.unit ?? "units"}</small></div><ProgressBar name="Availability" value={resource.status === "AVAILABLE" ? 100 : 50} /><span className="badge info">{resource.status.replaceAll("_", " ")}</span></div>)}</section>;
}
