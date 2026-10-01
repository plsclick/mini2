import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { ProgressHistory } from "../../components/dashboard/ProgressHistory";
export function ClientProject() {
  return (
    <WorkspacePlaceholder
      eyebrow="PROJECT OVERVIEW · READ ONLY"
      title="Skyline Residency"
    >
      <ProgressHistory />
    </WorkspacePlaceholder>
  );
}
