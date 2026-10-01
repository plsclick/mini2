import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiStage } from "../../services/projectDataService";

const statusLabel = (status: string) => status.replaceAll("_", " ").toLowerCase();

export function StagesPage() {
  const { project, isLoading: projectLoading } = useActiveProject();
  const [stages, setStages] = useState<ApiStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadStages = () => {
    if (!project) { setStages([]); setIsLoading(false); return; }
    setIsLoading(true);
    void projectDataService.listStages(project.id).then(setStages).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load stages.")).finally(() => setIsLoading(false));
  };
  useEffect(loadStages, [project?.id]);

  const saveStage = async () => {
    if (!project || !name.trim()) { setError("Enter a stage name."); return; }
    try {
      await projectDataService.createStage(project.id, { name: name.trim(), description: description || undefined });
      setName(""); setDescription(""); setError(""); setIsAdding(false); loadStages();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create stage."); }
  };

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact"><div><p className="eyebrow">PROJECT STRUCTURE · {project?.name ?? "NO PROJECT"}</p><h1>Project stages</h1><p>Manage construction phases stored in the project database.</p></div><button className="primary small" type="button" onClick={() => setIsAdding((value) => !value)} disabled={!project}><Plus size={15} /> ADD STAGE</button></section>
        {isAdding && <section className="card" style={{ marginBottom: 12 }}><p className="eyebrow">NEW STAGE</p><div className="twocol"><label>STAGE NAME<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Foundation" /></label><label>DESCRIPTION<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Scope of this phase" /></label></div>{error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}<div className="form-row"><button className="link" type="button" onClick={() => setIsAdding(false)}>CANCEL</button><button className="primary small" type="button" onClick={() => void saveStage()}>SAVE STAGE</button></div></section>}
        <section className="card"><div className="card-head"><div><p className="eyebrow">ALL STAGES</p><h2>{projectLoading || isLoading ? "Loading stages..." : `${stages.length} phases defined`}</h2></div></div>{!project && !projectLoading && <p className="schedule-empty">Create a project before adding stages.</p>}{!isLoading && project && stages.length === 0 && <p className="schedule-empty">No stages yet. Add the first phase to start building the schedule.</p>}<div className="detail-stack">{stages.map((stage) => <div key={stage.id} className="data-row"><div><b>{stage.name}</b><small>{stage._count?.tasks ?? 0} tasks · {statusLabel(stage.status)}</small></div><ProgressBar name="" value={stage.progress ?? 0} /><span className="badge info">{statusLabel(stage.status).toUpperCase()}</span></div>)}</div></section>
      </main>
    </AppShell>
  );
}
