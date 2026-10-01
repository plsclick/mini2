import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
export function DelayReport() {
  return (
    <WorkspacePlaceholder eyebrow="PROJECT EXCEPTION" title="Report a delay">
      <section className="card">
        <p className="eyebrow">DELAY DETECTION</p>
        <h2>Report before the impact grows.</h2>
        <p className="sub">
          The schedule engine will recalculate affected tasks and critical path
          impact after submission.
        </p>
        <button className="primary small">START DELAY REPORT</button>
      </section>
    </WorkspacePlaceholder>
  );
}
