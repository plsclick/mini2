import { resources } from "../../mock/resources";
import { ProgressBar } from "../ui/ProgressBar";
export function ResourceCenter() {
  return (
    <section className="card data-table">
      <div className="card-head">
        <div>
          <p className="eyebrow">RESOURCE CENTER</p>
          <h2>Availability and utilization</h2>
        </div>
        <button className="link">Manage resources</button>
      </div>
      {resources.map((resource) => (
        <div className="data-row" key={resource.id}>
          <div>
            <b>{resource.name}</b>
            <small>
              {resource.category.toUpperCase()} · {resource.assigned}
            </small>
          </div>
          <ProgressBar name="Utilization" value={resource.utilization} />
          <span
            className={`badge ${resource.status === "delayed" ? "danger" : "info"}`}
          >
            {resource.status.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}
