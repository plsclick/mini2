import { MaterialDeliveryTable } from "../../components/materials/MaterialDeliveryTable";
import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { ResourceCenter } from "../../components/resources/ResourceCenter";
export function ResourcesPage() {
  return (
    <WorkspacePlaceholder eyebrow="RESOURCE MANAGEMENT" title="Resource center">
      <div className="detail-stack">
        <ResourceCenter />
        <MaterialDeliveryTable />
      </div>
    </WorkspacePlaceholder>
  );
}
