import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
export function RequirementReport() {
  return (
    <WorkspacePlaceholder
      eyebrow="SITE REQUIREMENTS"
      title="Material, workforce & equipment"
    >
      <section className="card">
        <p className="eyebrow">MATERIAL REQUIRED</p>
        <h2>Steel rods</h2>
        <p className="sub">500 kg · Required by 18 Nov · High priority</p>
        <button className="primary small">SUBMIT REQUIREMENT</button>
      </section>
    </WorkspacePlaceholder>
  );
}
