import type { ScheduleAnalysis } from "../../types/schedule";

function dateDay(value: string): number {
  return Date.parse(`${value}T00:00:00Z`) / 86_400_000;
}

function formatAxisDate(day: number): string {
  return new Date(day * 86_400_000).toLocaleDateString("en", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).toUpperCase();
}

export function GanttChart({ schedule }: { schedule: ScheduleAnalysis | null }) {
  const tasks = schedule?.tasks ?? [];
  const startDay = schedule?.projectStartDate ? dateDay(schedule.projectStartDate) : 0;
  const timelineDays = Math.max(schedule?.totalDurationDays ?? 0, 1);
  const axis = Array.from({ length: 6 }, (_, index) =>
    formatAxisDate(startDay + (timelineDays * index) / 5),
  );

  return (
    <>
      <div className="gantt-axis">
        {axis.map((date, index) => <span key={`${date}-${index}`}>{date}</span>)}
      </div>
      {tasks.map((task) => {
        const calculatedStart = ((dateDay(task.earliestStart) - startDay) / timelineDays) * 100;
        const calculatedWidth = (task.durationDays / timelineDays) * 100;
        const plannedStart = ((dateDay(task.plannedStartDate) - startDay) / timelineDays) * 100;
        const plannedWidth = ((dateDay(task.plannedEndDate) - dateDay(task.plannedStartDate)) / timelineDays) * 100;
        const tone = task.isCritical
          ? "critical"
          : task.status === "COMPLETED"
            ? "done"
            : task.status === "IN_PROGRESS"
              ? "active"
              : "upcoming";
        return (
        <div className="gantt-row" key={task.taskId} title={`${task.earliestStart} to ${task.earliestFinish} · ${task.totalFloat} days float`}>
          <span>{task.name}</span>
          <div>
            <i
              className="planned"
              title={`Planned: ${task.plannedStartDate} – ${task.plannedEndDate}`}
              style={{ left: `${plannedStart}%`, width: `${Math.max(plannedWidth, 0.5)}%` }}
            />
            <i
              className={`${tone} calculated`}
              title={`Calculated: ${task.earliestStart} – ${task.earliestFinish}`}
              style={{ left: `${calculatedStart}%`, width: `${Math.max(calculatedWidth, task.durationDays > 0 ? 0.5 : 0)}%` }}
            />
          </div>
        </div>
        );
      })}
      {tasks.length === 0 && <p className="schedule-empty">No schedule data available.</p>}
    </>
  );
}
