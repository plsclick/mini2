import { useState } from "react";
import { Camera, Check, Clock3, Plus, Upload, X } from "lucide-react";
import { AppShell } from "../../components/navigation/AppShell";
import { fileService } from "../../services/platform/fileService";
import { useActiveProject } from "../../hooks/useActiveProject";
import "./SiteUpdates.css";

type SiteUpdate = {
  title: string;
  stage: string;
  description: string;
  evidence: string;
  time: string;
};

const initialUpdates: SiteUpdate[] = [];

export function SiteUpdates() {
  const { project } = useActiveProject();
  const [updates, setUpdates] = useState(initialUpdates);
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState("Structure · Level 04");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const addEvidence = async () => {
    const file = await fileService.selectEvidence();
    if (file) setEvidence(file.name);
  };

  const submitUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setUpdates((current) => [
      { title: title.trim(), stage, description: description.trim(), evidence, time: "Just now" },
      ...current,
    ]);
    setTitle("");
    setDescription("");
    setEvidence("");
    setSubmitted(true);
  };

  return (
    <AppShell>
      <main className="page site-updates-page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">SITE OPERATIONS · {project?.name ?? "NO PROJECT"}</p>
            <h1>Site updates</h1>
            <p>Share verified progress and conditions with the project team.</p>
          </div>
          <div className="updates-live"><i /> TEAM FEED</div>
        </section>

        <div className="site-updates-grid">
          <section className="card update-composer">
            <div className="card-head">
              <div><p className="eyebrow">NEW FIELD NOTE</p><h2>Post an update</h2></div>
              <Plus size={18} />
            </div>
            {submitted && <p className="update-confirm"><Check size={14} /> Update shared with the project team.</p>}
            <form onSubmit={submitUpdate}>
              <label>UPDATE TITLE<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What changed on site?" /></label>
              <label>RELATED STAGE / TASK<select value={stage} onChange={(event) => setStage(event.target.value)}><option>Structure · Level 04</option><option>Foundation · Grid C–F</option><option>Electrical · Level 02</option><option>Plumbing · Level 03</option><option>Interior · Level 01</option><option>General site</option></select></label>
              <label>UPDATE<textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe progress, site conditions, or work completed..." rows={5} /></label>
              <button type="button" className="evidence-picker" onClick={addEvidence}><Camera size={16} /><span>{evidence || "Add photo or document evidence"}</span>{evidence ? <X size={15} onClick={(event) => { event.stopPropagation(); setEvidence(""); }} /> : <Upload size={15} />}</button>
              <div className="composer-footer"><span><Clock3 size={13} /> Submitted as Aditya Sharma · Site Manager</span><button className="primary small" type="submit">POST UPDATE</button></div>
            </form>
          </section>

          <section className="card updates-feed-card">
            <div className="card-head">
              <div><p className="eyebrow">PROJECT ACTIVITY</p><h2>Recent site notes</h2></div>
              <span className="updates-count">{updates.length} UPDATES</span>
            </div>
            <div className="site-updates-feed">
              {updates.map((update, index) => (
                <article className="site-update" key={`${update.title}-${index}`}>
                  <div className="update-marker"><i /></div>
                  <div className="site-update-content">
                    <div className="update-meta"><span>{update.time}</span><b>ADITYA SHARMA · CONSTRUCTION MANAGER</b></div>
                    <h3>{update.title}</h3>
                    <span className="update-stage">{update.stage}</span>
                    <p>{update.description}</p>
                    {update.evidence && <button className="evidence-file" type="button"><Camera size={14} />{update.evidence}</button>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}