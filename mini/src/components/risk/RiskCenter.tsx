import { ChevronRight } from "lucide-react";
const risks = [
  ["HIGH", "Steel Delivery", "Impact: +3 days", "red"],
  ["MEDIUM", "Electrical Workforce", "Impact: +1 day", "amber"],
  ["LOW", "Interior Material", "Impact: +0 days", "blue"],
];
export function RiskCenter() {
  return (
    <section className="card risk">
      <div className="card-head">
        <div>
          <p className="eyebrow">RISK CENTER</p>
          <h2>Priority risks</h2>
        </div>
        <button className="link">View all</button>
      </div>
      {risks.map(([severity, title, impact, tone]) => (
        <button className="risk-item" key={title}>
          <i className={tone}>{severity}</i>
          <span>
            <b>{title}</b>
            <small>{impact}</small>
          </span>
          <ChevronRight size={16} />
        </button>
      ))}
    </section>
  );
}
