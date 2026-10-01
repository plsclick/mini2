import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { projectService } from "../../services/projectService";
import { projectDataService, type ProjectUser } from "../../services/projectDataService";
export function ProjectBuilder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", location: "", plannedStartDate: "", plannedEndDate: "", clientId: "", constructionManagerId: "" });
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    void projectDataService.listUsers().then(setUsers).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load organization users."));
  }, []);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const createProject = async () => {
    setError("");
    if (!form.name.trim()) return setError("Project name is required.");
    setIsSaving(true);
    try {
      const project = await projectService.createProject({
        name: form.name.trim(),
        description: form.description || undefined,
        location: form.location || undefined,
        clientId: form.clientId || undefined,
        plannedStartDate: form.plannedStartDate ? new Date(`${form.plannedStartDate}T00:00:00.000Z`).toISOString() : undefined,
        plannedEndDate: form.plannedEndDate ? new Date(`${form.plannedEndDate}T00:00:00.000Z`).toISOString() : undefined,
      });
      if (form.constructionManagerId) {
        await projectDataService.createMember(project.id, { userId: form.constructionManagerId, projectRole: "CONSTRUCTION_MANAGER" });
      }
      navigate(`/pm/dashboard?project=${project.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create project.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <WorkspacePlaceholder
      eyebrow="PROJECT CONSTRUCTOR"
      title="Build project structure"
    >
      <div className="builder">
        <section className="card">
          <p className="eyebrow">PROJECT TREE</p>
          <p className="sub">Create the project first, then add stages and tasks from the project workspace.</p>
          <button className="outline" type="button" onClick={() => navigate("/pm/stages")}><Plus size={15} /> ADD STAGE</button>
        </section>
        <section className="card">
          <p className="eyebrow">TASK CONFIGURATION</p>
          <h2>Project details</h2>
          <div className="twocol">
            <label>
              PROJECT NAME
              <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Skyline Residency" />
            </label>
            <label>
              LOCATION
              <input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Project location" />
            </label>
            <label>
              START DATE
              <input type="date" value={form.plannedStartDate} onChange={(event) => update("plannedStartDate", event.target.value)} />
            </label>
            <label>
              END DATE
              <input type="date" value={form.plannedEndDate} onChange={(event) => update("plannedEndDate", event.target.value)} />
            </label>
          </div>
          <label>
            DESCRIPTION
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What is this project delivering?" rows={4} />
          </label>
          <div className="twocol">
            <label>CLIENT<select value={form.clientId} onChange={(event) => update("clientId", event.target.value)}><option value="">Select a client</option>{users.filter((user) => user.role === "CLIENT").map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select></label>
            <label>CONSTRUCTION MANAGER<select value={form.constructionManagerId} onChange={(event) => update("constructionManagerId", event.target.value)}><option value="">Assign later</option>{users.filter((user) => user.role === "CONSTRUCTION_MANAGER").map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select></label>
          </div>
          {error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}
          <button className="primary small" type="button" onClick={() => void createProject()} disabled={isSaving}>
            {isSaving ? "CREATING..." : "CREATE PROJECT"} <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </WorkspacePlaceholder>
  );
}
