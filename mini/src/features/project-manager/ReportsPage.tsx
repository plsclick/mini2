import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { ReportGrid } from "../../components/reports/ReportGrid";
export function ReportsPage() {
  return (
    <WorkspacePlaceholder eyebrow="PROJECT REPORTING" title="Reports">
      <ReportGrid />
    </WorkspacePlaceholder>
  );
}
