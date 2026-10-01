import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { RiskCenter as Risks } from "../../components/risk/RiskCenter";
export function RiskCenterPage() {
  return (
    <WorkspacePlaceholder eyebrow="RISK MANAGEMENT" title="Risk center">
      <Risks />
    </WorkspacePlaceholder>
  );
}
