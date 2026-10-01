import { useEffect, useState } from "react";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiMaterial } from "../../services/projectDataService";

export function MaterialDeliveryTable() {
  const { project } = useActiveProject();
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const load = () => { if (project) void projectDataService.listMaterials(project.id).then(setMaterials).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load materials.")); else setMaterials([]); };
  useEffect(load, [project?.id]);
  const add = async () => { if (!project || !name.trim()) { setError("Enter a material name."); return; } try { await projectDataService.createMaterial(project.id, { name: name.trim(), quantityRequired: quantity, quantityAvailable: 0, status: "REQUIRED" }); setName(""); setQuantity(1); setAdding(false); setError(""); load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create material."); } };
  return <section className="card data-table"><div className="card-head"><div><p className="eyebrow">MATERIAL DELIVERY</p><h2>Supply watch</h2></div><button className="link" type="button" onClick={() => setAdding((value) => !value)} disabled={!project}>{adding ? "CANCEL" : "ADD MATERIAL"}</button></div>{adding && <div className="twocol"><label>MATERIAL<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Steel rods" /></label><label>REQUIRED QUANTITY<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label><button className="primary small" type="button" onClick={() => void add()}>SAVE MATERIAL</button></div>}{error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}{!materials.length && <p className="schedule-empty">No materials have been added to this project.</p>}{materials.map((material) => <div className="data-row material-row" key={material.id}><div><b>{material.name}</b><small>{material.quantityAvailable} available · {material.quantityRequired} required</small></div><span>{material.status.replaceAll("_", " ")}<small>{material.supplier ?? "No supplier"}</small></span><span>{material.expectedDeliveryDate ? new Date(material.expectedDeliveryDate).toLocaleDateString() : "No delivery date"}</span></div>)}</section>;
}
