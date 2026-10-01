import { BadRequestError, NotFoundError } from "../../utils/errors";
import { fromCalendarDay, toCalendarDay } from "../scheduling/calendar.service";
import { calculateScheduleData } from "../scheduling/engine.service";
import type {
  ScheduleAnalysis,
  ScheduleDependency,
  ScheduleProject,
  ScheduleTask,
} from "../scheduling/types";

export type DelayImpactClassification =
  | "DIRECTLY_DELAYED"
  | "INDIRECTLY_DELAYED"
  | "FLOAT_CONSUMED"
  | "CRITICAL"
  | "PROJECT_COMPLETION_IMPACTED"
  | "UNCHANGED";

export interface ImpactDelay {
  id: string;
  projectId: string;
  taskId: string | null;
  reason: string;
  description: string | null;
  delayDays: number;
  severity: string;
  status: string;
  reportedAt: Date | string;
  resolvedAt: Date | string | null;
}

export interface ImpactMilestone {
  id: string;
  projectId: string;
  taskId: string | null;
  name: string;
  plannedDate: Date | string | null;
  actualDate: Date | string | null;
  status: string;
}

export interface AffectedTask {
  taskId: string;
  taskName: string;
  baselineStart: string;
  baselineEnd: string;
  projectedStart: string;
  projectedEnd: string;
  baselineFloat: number;
  projectedFloat: number;
  floatConsumed: number;
  impactDays: number;
  directDelayDays: number;
  classifications: DelayImpactClassification[];
}

export interface AffectedMilestone {
  milestoneId: string;
  name: string;
  taskId: string;
  baselineDate: string;
  projectedDate: string;
  delayDays: number;
}

export interface DelayImpactAnalysis {
  projectId: string;
  baseline: {
    completionDate: string | null;
    durationDays: number;
  };
  impacted: {
    completionDate: string | null;
    durationDays: number;
    projectDelayDays: number;
  };
  delaySummary: {
    activeDelayCount: number;
    totalReportedDelayDays: number;
  };
  delays: ImpactDelay[];
  affectedTasks: AffectedTask[];
  affectedMilestones: AffectedMilestone[];
  individualDelay?: ImpactDelay & { isActive: boolean };
}

export function calculateDelayImpactData(
  project: ScheduleProject,
  tasks: ScheduleTask[],
  dependencies: ScheduleDependency[],
  milestones: ImpactMilestone[],
  delays: ImpactDelay[],
  individualDelayId?: string,
): DelayImpactAnalysis {
  const selectedDelay = individualDelayId
    ? delays.find((delay) => delay.id === individualDelayId)
    : undefined;
  if (individualDelayId && !selectedDelay) throw new NotFoundError("Delay");

  const activeDelays = (individualDelayId ? [selectedDelay!] : delays).filter(
    (delay) => delay.status === "OPEN" || delay.status === "INVESTIGATING",
  );
  const taskIds = new Set(tasks.map((task) => task.id));
  const taskDelayOffsets: Record<string, number> = {};
  for (const delay of activeDelays) {
    if (!delay.taskId) continue;
    if (!taskIds.has(delay.taskId)) {
      throw new BadRequestError(`Delay ${delay.id} references a task outside this project`);
    }
    taskDelayOffsets[delay.taskId] = (taskDelayOffsets[delay.taskId] ?? 0) + delay.delayDays;
  }

  const baselineSchedule = calculateScheduleData(project, tasks, dependencies);
  const impactedSchedule = activeDelays.length > 0
    ? calculateScheduleData(project, tasks, dependencies, { taskDelayOffsets })
    : baselineSchedule;
  const projectDelayDays = Math.max(
    0,
    impactedSchedule.totalDurationDays - baselineSchedule.totalDurationDays,
  );
  const baselineTasks = new Map(baselineSchedule.tasks.map((task) => [task.taskId, task]));
  const impactedTasks = new Map(impactedSchedule.tasks.map((task) => [task.taskId, task]));
  const directDelayDaysByTask = new Map<string, number>();
  for (const delay of activeDelays) {
    if (delay.taskId) {
      directDelayDaysByTask.set(
        delay.taskId,
        (directDelayDaysByTask.get(delay.taskId) ?? 0) + delay.delayDays,
      );
    }
  }

  const completionCriticalTasks = new Set(impactedSchedule.criticalTasks);
  const affectedTasks: AffectedTask[] = [];
  for (const [taskId, baselineTask] of baselineTasks) {
    const projectedTask = impactedTasks.get(taskId);
    if (!projectedTask) continue;

    const directDelayDays = directDelayDaysByTask.get(taskId) ?? 0;
    const startDelta = toCalendarDay(projectedTask.earliestStart) - toCalendarDay(baselineTask.earliestStart);
    const finishDelta = toCalendarDay(projectedTask.earliestFinish) - toCalendarDay(baselineTask.earliestFinish);
    const floatConsumed = Math.max(0, baselineTask.totalFloat - projectedTask.totalFloat);
    const criticalityChanged = baselineTask.isCritical !== projectedTask.isCritical;
    const moved = startDelta !== 0 || finishDelta !== 0;
    if (directDelayDays === 0 && !moved && floatConsumed === 0 && !criticalityChanged) continue;

    const classifications: DelayImpactClassification[] = [];
    if (directDelayDays > 0) classifications.push("DIRECTLY_DELAYED");
    else if (moved) classifications.push("INDIRECTLY_DELAYED");
    if (floatConsumed > 0) classifications.push("FLOAT_CONSUMED");
    if (projectedTask.isCritical) classifications.push("CRITICAL");
    if (projectDelayDays > 0 && completionCriticalTasks.has(taskId) && finishDelta > 0) {
      classifications.push("PROJECT_COMPLETION_IMPACTED");
    }
    if (classifications.length === 0) classifications.push("UNCHANGED");

    affectedTasks.push({
      taskId,
      taskName: projectedTask.name,
      baselineStart: baselineTask.earliestStart,
      baselineEnd: baselineTask.earliestFinish,
      projectedStart: projectedTask.earliestStart,
      projectedEnd: projectedTask.earliestFinish,
      baselineFloat: baselineTask.totalFloat,
      projectedFloat: projectedTask.totalFloat,
      floatConsumed,
      impactDays: Math.max(0, finishDelta),
      directDelayDays,
      classifications,
    });
  }

  const impactedMilestones: AffectedMilestone[] = [];
  for (const milestone of milestones) {
    if (!milestone.taskId || !milestone.plannedDate || milestone.actualDate ||
        milestone.status === "ACHIEVED" || milestone.status === "CANCELLED") continue;
    const baselineTask = baselineTasks.get(milestone.taskId);
    const projectedTask = impactedTasks.get(milestone.taskId);
    if (!baselineTask || !projectedTask) continue;

    const taskFinishDelta = toCalendarDay(projectedTask.earliestFinish) -
      toCalendarDay(baselineTask.earliestFinish);
    if (taskFinishDelta === 0) continue;
    const baselineDateDay = toCalendarDay(milestone.plannedDate);
    impactedMilestones.push({
      milestoneId: milestone.id,
      name: milestone.name,
      taskId: milestone.taskId,
      baselineDate: fromCalendarDay(baselineDateDay),
      projectedDate: fromCalendarDay(baselineDateDay + taskFinishDelta),
      delayDays: Math.max(0, taskFinishDelta),
    });
  }

  return {
    projectId: project.id,
    baseline: {
      completionDate: baselineSchedule.calculatedCompletionDate,
      durationDays: baselineSchedule.totalDurationDays,
    },
    impacted: {
      completionDate: impactedSchedule.calculatedCompletionDate,
      durationDays: impactedSchedule.totalDurationDays,
      projectDelayDays,
    },
    delaySummary: {
      activeDelayCount: activeDelays.length,
      totalReportedDelayDays: activeDelays.reduce((total, delay) => total + delay.delayDays, 0),
    },
    delays: individualDelayId ? (selectedDelay ? [selectedDelay] : []) : delays,
    affectedTasks,
    affectedMilestones: impactedMilestones,
    ...(individualDelayId && selectedDelay
      ? { individualDelay: { ...selectedDelay, isActive: activeDelays.length > 0 } }
      : {}),
  };
}
