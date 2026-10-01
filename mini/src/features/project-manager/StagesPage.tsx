import { Plus } from "lucide-react";
import { AppShell } from "../../components/navigation/AppShell";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useStageStore } from "../../store/stageStore";

export function StagesPage() {
  const stages = useStageStore((s) => s.stages);

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">PROJECT STRUCTURE · SKYLINE RESIDENCY</p>
            <h1>Project stages</h1>
            <p>Manage the construction phases and track their progress.</p>
          </div>
          <button className="primary small">
            <Plus size={15} />
            ADD STAGE
          </button>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">ALL STAGES</p>
              <h2>{stages.length} phases defined</h2>
            </div>
          </div>
          <div className="detail-stack">
            {stages.map((stage) => (
              <div key={stage.id} className="data-row">
                <div>
                  <b>{stage.name}</b>
                  <small>{stage.taskCount} tasks</small>
                </div>
                <ProgressBar name="" value={stage.progress} />
                <StatusBadge
                  tone={
                    stage.status === "complete"
                      ? "success"
                      : stage.status === "at-risk"
                        ? "danger"
                        : "info"
                  }
                >
                  {stage.status.replace("-", " ").toUpperCase()}
                </StatusBadge>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
