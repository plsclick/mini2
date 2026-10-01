import { useState } from "react";
import { CalendarRange, GitBranch, RefreshCw, Search } from "lucide-react";
import { AppShell } from "../../components/navigation/AppShell";
import { CriticalPath } from "../../components/dependency/CriticalPath";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";
import type { ScheduledTask } from "../../types/schedule";
import "./ScheduleWorkspace.css";

type ScheduleView = "timeline" | "dependencies" | "critical-path";

const titles: Record<ScheduleView, { eyebrow: string; title: string; description: string }> = {
  timeline: {
    eyebrow: "MASTER SCHEDULE · SKYLINE RESIDENCY",
    title: "Project timeline",
    description: "Planned work, current delivery, and schedule pressure in one view.",
  },
  dependencies: {
    eyebrow: "SCHEDULE LOGIC · SKYLINE RESIDENCY",
    title: "Dependency network",
    description: "Review the sequence of work and how downstream activities connect.",
  },
  "critical-path": {
    eyebrow: "PROJECT CONTROL · SKYLINE RESIDENCY",
    title: "Critical path",
    description: "Track the activities with no schedule float and their effect on handover.",
  },
};

const statusLabels: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function dateDay(value: string): number {
  return Date.parse(`${value}T00:00:00Z`) / 86_400_000;
}

function formatDate(value: string | null): string {
  if (!value) return "Not calculated";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function taskTone(task: ScheduledTask): string {
  if (task.isCritical) return "critical";
  if (task.status === "COMPLETED") return "done";
  if (task.status === "IN_PROGRESS") return "active";
  return "upcoming";
}

export function ScheduleWorkspace({ mode }: { mode: ScheduleView }) {
  const { schedule, isLoading, error, refresh } = useProjectSchedule();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All stages");
  const [status, setStatus] = useState("All status");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [scale, setScale] = useState("WEEK");
  const startDay = schedule?.projectStartDate ? dateDay(schedule.projectStartDate) : 0;
  const timelineDays = Math.max(schedule?.totalDurationDays ?? 0, 1);
  const scheduleTasks = (schedule?.tasks ?? []).map((task) => ({
    ...task,
    stage: task.stageName ?? "Unassigned",
    statusLabel: statusLabels[task.status] ?? task.status,
    start: ((dateDay(task.earliestStart) - startDay) / timelineDays) * 100,
    width: (task.durationDays / timelineDays) * 100,
    plannedStart: ((dateDay(task.plannedStartDate) - startDay) / timelineDays) * 100,
    plannedWidth: ((dateDay(task.plannedEndDate) - dateDay(task.plannedStartDate)) / timelineDays) * 100,
    tone: taskTone(task),
  }));
  const visibleTasks = scheduleTasks.filter((task) =>
      task.name.toLowerCase().includes(query.toLowerCase()) &&
      (stage === "All stages" || task.stage === stage) &&
      (status === "All status" || task.status === status) &&
      (!criticalOnly || task.isCritical),
  );
  const stageNames = [...new Set(scheduleTasks.map((task) => task.stage))];
  const statusNames = [...new Set(scheduleTasks.map((task) => task.status))];
  const axisCount = scale === "MONTH" ? 4 : 7;
  const timelineAxis = Array.from({ length: axisCount }, (_, index) => {
    const day = startDay + (timelineDays * index) / (axisCount - 1);
    return new Date(day * 86_400_000).toLocaleDateString("en", {
      month: scale === "MONTH" ? "long" : "short",
      ...(scale === "MONTH" ? {} : { day: "2-digit" as const }),
      timeZone: "UTC",
    }).toUpperCase();
  });
  const pageTitle = titles[mode];

  return (
    <AppShell>
      <main className="page schedule-workspace">
        <section className="page-title compact">
          <div>
            <p className="eyebrow">{pageTitle.eyebrow}</p>
            <h1>{pageTitle.title}</h1>
            <p>{pageTitle.description}</p>
          </div>
          <div className="schedule-status"><i /> {isLoading ? "CALCULATING" : "LIVE SCHEDULE"}<button className="schedule-refresh" onClick={refresh} title="Refresh schedule" aria-label="Refresh schedule"><RefreshCw size={14} /></button></div>
        </section>

        <section className="schedule-summary" aria-label="Schedule summary">
          <div><span>CALCULATED COMPLETION</span><strong>{formatDate(schedule?.calculatedCompletionDate ?? null)}</strong></div>
          <div><span>SCHEDULE DURATION</span><strong>{schedule ? `${schedule.totalDurationDays} days` : "—"}</strong></div>
          <div><span>CRITICAL ACTIVITIES</span><strong>{schedule?.statistics.criticalTaskCount ?? "—"} <small>of {schedule?.statistics.totalTasks ?? "—"}</small></strong></div>
          <div><span>COMPLETED TASKS</span><strong>{schedule?.statistics.completedTasks ?? "—"} <small>of {schedule?.statistics.totalTasks ?? "—"}</small></strong></div>
        </section>
        {error && <p className="schedule-error" role="alert">{error}</p>}
        {isLoading && <p className="schedule-empty" role="status">Calculating project schedule…</p>}

        {mode === "timeline" ? (
          <section className="card schedule-timeline">
            <div className="schedule-toolbar">
              <div className="schedule-heading"><CalendarRange size={17} /><div><h2>Schedule overview</h2><span>{formatDate(schedule?.projectStartDate ?? null)} – {formatDate(schedule?.calculatedCompletionDate ?? null)}</span></div></div>
              <div className="schedule-tools">
                <label className="schedule-search"><Search size={15} /><input aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
                <select aria-label="Filter by stage" value={stage} onChange={(event) => setStage(event.target.value)}><option>All stages</option>{stageNames.map((item) => <option key={item}>{item}</option>)}</select>
                <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All status</option>{statusNames.map((item) => <option key={item} value={item}>{statusLabels[item] ?? item}</option>)}</select>
                <button className={criticalOnly ? "schedule-filter selected" : "schedule-filter"} onClick={() => setCriticalOnly(!criticalOnly)} aria-pressed={criticalOnly}>Critical only</button>
                <div className="schedule-scales" aria-label="Timeline scale">{["DAY", "WEEK", "MONTH"].map((item) => <button className={scale === item ? "selected" : ""} onClick={() => setScale(item)} key={item}>{item}</button>)}</div>
              </div>
            </div>
            <div className="timeline-grid">
              <div className="timeline-label-head">TASK / STAGE</div>
              <div className="timeline-dates">{timelineAxis.map((date, index) => <span key={`${date}-${index}`}>{date}</span>)}</div>
              {visibleTasks.map((task) => (
                <div className="timeline-task" key={task.taskId}>
                  <div className="timeline-task-label"><span>{task.name}</span><small>{task.stage} · {task.statusLabel} · {task.durationDays}d · {task.totalFloat}d float{task.isCritical ? " · CRITICAL" : ""}</small></div>
                  <div className="timeline-track">
                    <i className="timeline-bar planned" title={`Planned: ${task.plannedStartDate} – ${task.plannedEndDate}`} style={{ left: `${task.plannedStart}%`, width: `${Math.max(task.plannedWidth, 0.5)}%` }} />
                    <i className={`timeline-bar ${task.tone} calculated`} title={`Calculated: ${task.earliestStart} – ${task.earliestFinish}; float ${task.totalFloat} days`} style={{ left: `${task.start}%`, width: `${Math.max(task.width, task.durationDays > 0 ? 0.5 : 0)}%` }} />
                  </div>
                </div>
              ))}
              {!visibleTasks.length && <p className="schedule-empty">No tasks match these filters.</p>}
            </div>
            <div className="schedule-legend"><span><i className="planned" />Planned range</span><span><i className="done" />Complete</span><span><i className="active" />Calculated · in progress</span><span><i className="critical" />Calculated · critical</span><span><i className="upcoming" />Upcoming</span></div>
          </section>
        ) : (
          <section className="card schedule-network">
            <div className="schedule-toolbar">
              <div className="schedule-heading"><GitBranch size={17} /><div><h2>{mode === "critical-path" ? "Critical sequence" : "Task relationships"}</h2><span>{schedule?.dependencies.length ?? 0} dependencies · {schedule?.statistics.totalTasks ?? 0} tasks</span></div></div>
              <div className="network-key"><i /> Critical sequence <span>•</span> <i className="network-muted" /> Other work</div>
            </div>
            <CriticalPath schedule={schedule} criticalOnly={mode === "critical-path"} />
            <div className="network-footer"><span><b>CALCULATED COMPLETION</b> {formatDate(schedule?.calculatedCompletionDate ?? null)}</span><span><b>CRITICAL PATHS</b> {schedule?.criticalPaths.length ?? 0}{schedule?.criticalPathsTruncated ? "+" : ""}</span><span><b>CRITICAL TASKS</b> {schedule?.statistics.criticalTaskCount ?? 0}</span></div>
          </section>
        )}
      </main>
    </AppShell>
  );
}