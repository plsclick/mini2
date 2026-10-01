import { Plus } from "lucide-react";
import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
export function ProjectBuilder() {
  return (
    <WorkspacePlaceholder
      eyebrow="PROJECT CONSTRUCTOR"
      title="Build project structure"
    >
      <div className="builder">
        <section className="card">
          <p className="eyebrow">PROJECT TREE</p>
          {[
            "Foundation · Excavation · Footing · Foundation Slab",
            "Structure · Columns · Beams · Slabs",
            "Electrical · Main risers · Floor distribution",
          ].map((item) => (
            <button className="tree-item" key={item}>
              ⌄ {item}
            </button>
          ))}
          <button className="outline">
            <Plus size={15} /> ADD STAGE
          </button>
        </section>
        <section className="card">
          <p className="eyebrow">TASK CONFIGURATION</p>
          <h2>Structural Steel Installation</h2>
          <div className="twocol">
            <label>
              START DATE
              <input value="20 Nov 2026" readOnly />
            </label>
            <label>
              END DATE
              <input value="25 Nov 2026" readOnly />
            </label>
            <label>
              DURATION
              <input value="5 days" readOnly />
            </label>
            <label>
              PRIORITY
              <select>
                <option>Critical</option>
              </select>
            </label>
          </div>
          <button className="primary small">SAVE TASK</button>
        </section>
      </div>
    </WorkspacePlaceholder>
  );
}
