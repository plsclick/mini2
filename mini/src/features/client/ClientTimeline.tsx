import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { GanttChart } from "../../components/timeline/GanttChart";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
export function ClientTimeline() {
  const { schedule } = useProjectSchedule();
  return (
    <WorkspacePlaceholder eyebrow="PROJECT JOURNEY" title="Major milestones">
      <section className="card gantt">
        <GanttChart schedule={schedule} />
      </section>
    </WorkspacePlaceholder>
  );
}
