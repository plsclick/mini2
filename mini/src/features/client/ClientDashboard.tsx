import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { MetricCard } from "../../components/ui/MetricCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { AppShell } from "../../components/navigation/AppShell";
const stages = [
  ["Planning", 100],
  ["Foundation", 100],
  ["Structure", 82],
  ["Electrical", 61],
  ["Plumbing", 48],
  ["Interior", 25],
  ["Finishing", 5],
] as const;
const milestones = [
  ["Foundation Complete", "Completed", "good"],
  ["Structure Complete", "In progress", "warn"],
  ["Electrical Complete", "Upcoming", ""],
  ["Interior Complete", "Upcoming", ""],
  ["Handover", "22 Dec 2026", ""],
];
export function ClientDashboard() {
  return (
    <AppShell>
      <main className="page client-page">
        <section className="page-title">
          <div>
            <p className="eyebrow">RESIDENTIAL TOWER · MUMBAI</p>
            <h1>
              Skyline Residency <StatusBadge tone="danger">AT RISK</StatusBadge>
            </h1>
            <p>Project status and delivery outlook</p>
          </div>
          <button className="outline">
            View project <ArrowUpRight size={16} />
          </button>
        </section>
        <div className="metrics four">
          <MetricCard
            label="OVERALL PROGRESS"
            value="72%"
            detail="↑ 4% this week"
            tone="amber"
          />
          <MetricCard label="PLANNED COMPLETION" value="18 Dec" detail="2026" />
          <MetricCard
            label="PROJECTED COMPLETION"
            value="22 Dec"
            detail="+4 days variance"
          />
          <MetricCard
            label="SCHEDULE VARIANCE"
            value="+4 days"
            detail="Recovery in progress"
            tone="danger"
          />
        </div>
        <div className="client-grid">
          <section className="card status-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">PROJECT STATUS</p>
                <h2>Delivery outlook</h2>
              </div>
              <StatusBadge tone="danger">AT RISK</StatusBadge>
            </div>
            <div className="status-row">
              <div className="radial">
                <strong>
                  72<small>%</small>
                </strong>
                <span>COMPLETE</span>
              </div>
              <div className="status-data">
                <div>
                  <small>CURRENT PROGRESS</small>
                  <b>72%</b>
                </div>
                <div>
                  <small>EXPECTED COMPLETION</small>
                  <b>22 Dec 2026</b>
                </div>
                <div>
                  <small>SCHEDULE DELAY</small>
                  <b className="red">+4 days</b>
                </div>
              </div>
            </div>
          </section>
          <section className="card update-callout">
            <p className="eyebrow">PROJECT UPDATE</p>
            <h3>
              Steel delivery caused a 3-day delay to Structural Steel
              Installation.
            </h3>
            <p>
              The project team has created a recovery plan expected to recover{" "}
              <b>2 days.</b>
            </p>
            <button className="link">
              View recovery plan <ArrowRight size={15} />
            </button>
          </section>
          <section className="card stages">
            <div className="card-head">
              <h2>Stage progress</h2>
              <button className="link">View details</button>
            </div>
            {stages.map(([name, value]) => (
              <ProgressBar key={name} name={name} value={value} />
            ))}
          </section>
          <section className="card milestones">
            <div className="card-head">
              <h2>Project journey</h2>
              <button className="link">Full timeline</button>
            </div>
            {milestones.map(([title, state, tone], index) => (
              <div className="milestone" key={title}>
                <i className={tone}>{tone === "good" ? "✓" : index + 1}</i>
                <span>
                  <b>{title}</b>
                  <small>{state}</small>
                </span>
              </div>
            ))}
          </section>
          <section className="card recent">
            <div className="card-head">
              <h2>Recent updates</h2>
              <button className="link">All updates</button>
            </div>
            <ActivityFeed client />
          </section>
        </div>
      </main>
    </AppShell>
  );
}
