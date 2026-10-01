import { AppError } from "../../utils/errors";
import { durationInCalendarDays, fromCalendarDay, toCalendarDay } from "./calendar.service";
import { runBackwardPass } from "./backwardPass.service";
import { findCriticalPaths } from "./criticalPath.service";
import { buildDependencyGraph } from "./graph.service";
import { runForwardPass, scheduleCompletionDay } from "./forwardPass.service";
import { validateScheduleData } from "./scheduleValidation.service";
import type { ScheduleAnalysis, ScheduleDependency, ScheduleOptions, ScheduleProject, ScheduleTask } from "./types";

export function calculateScheduleData(
  project: ScheduleProject,
  tasks: ScheduleTask[],
  dependencies: ScheduleDependency[],
  options: ScheduleOptions = {},
): ScheduleAnalysis {
  const validation = validateScheduleData(project, tasks, dependencies);
  if (!validation.valid) {
    const firstError = validation.errors[0];
    throw new AppError(422, firstError.code, firstError.message, validation.errors);
  }

  const taskIds = new Set(tasks.map((task) => task.id));
  for (const [taskId, delayDays] of Object.entries(options.taskDelayOffsets ?? {})) {
    if (!taskIds.has(taskId)) {
      throw new AppError(422, "SCHEDULE_DELAY_TASK_NOT_FOUND", `Delay offset references missing task ${taskId}`);
    }
    if (!Number.isInteger(delayDays) || delayDays < 0) {
      throw new AppError(422, "SCHEDULE_INVALID_DELAY_OFFSET", `Delay offset for task ${taskId} must be a non-negative whole number of days`);
    }
  }

  const startCandidates = tasks
    .map((task) => task.plannedStartDate)
    .filter((value): value is Date | string => value !== null)
    .map(toCalendarDay);
  const projectStartDay = project.plannedStartDate
    ? toCalendarDay(project.plannedStartDate)
    : startCandidates.length > 0
      ? Math.min(...startCandidates)
      : null;
  const graph = buildDependencyGraph(tasks, dependencies);
  const durations = new Map(tasks.map((task) => [
    task.id,
    durationInCalendarDays(task.plannedStartDate as Date | string, task.plannedEndDate as Date | string) +
      (options.taskDelayOffsets?.[task.id] ?? 0),
  ]));

  if (projectStartDay === null) {
    return {
      projectId: project.id,
      projectStartDate: null,
      projectEndDate: null,
      calculatedCompletionDate: null,
      totalDurationDays: 0,
      tasks: [],
      criticalTasks: [],
      criticalPaths: [],
      criticalPathsTruncated: false,
      dependencies,
      statistics: { totalTasks: 0, completedTasks: 0, criticalTaskCount: 0, nonCriticalTaskCount: 0 },
    };
  }

  const forward = runForwardPass(graph, durations);
  const completion = tasks.length > 0 ? scheduleCompletionDay(graph, forward) : 0;
  const backward = runBackwardPass(graph, durations, forward, completion);
  const critical = findCriticalPaths(graph, forward, backward, completion);
  const criticalTaskSet = new Set(critical.criticalTaskIds);
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const scheduledTasks = graph.topologicalOrder.map((taskId) => {
    const task = tasksById.get(taskId);
    const early = forward.get(taskId);
    const late = backward.get(taskId);
    if (!task || !early || !late) throw new Error(`Incomplete schedule result for task ${taskId}`);

    return {
      taskId,
      name: task.name,
      stageName: task.stageName ?? null,
      status: task.status,
      durationDays: early.duration,
      plannedStartDate: fromCalendarDay(toCalendarDay(task.plannedStartDate as Date | string)),
      plannedEndDate: fromCalendarDay(toCalendarDay(task.plannedEndDate as Date | string)),
      earliestStart: fromCalendarDay(projectStartDay + early.earliestStart),
      earliestFinish: fromCalendarDay(projectStartDay + early.earliestFinish),
      latestStart: fromCalendarDay(projectStartDay + late.latestStart),
      latestFinish: fromCalendarDay(projectStartDay + late.latestFinish),
      totalFloat: late.totalFloat,
      isCritical: criticalTaskSet.has(taskId),
      predecessors: (graph.predecessors.get(taskId) ?? []).map((dependency) => dependency.predecessorTaskId),
      successors: (graph.successors.get(taskId) ?? []).map((dependency) => dependency.successorTaskId),
    };
  });

  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const completionDate = tasks.length > 0 ? fromCalendarDay(projectStartDay + completion) : null;
  return {
    projectId: project.id,
    projectStartDate: fromCalendarDay(projectStartDay),
    projectEndDate: completionDate,
    calculatedCompletionDate: completionDate,
    totalDurationDays: completion,
    tasks: scheduledTasks,
    criticalTasks: critical.criticalTaskIds,
    criticalPaths: critical.criticalPaths,
    criticalPathsTruncated: critical.criticalPathsTruncated,
    dependencies,
    statistics: {
      totalTasks: tasks.length,
      completedTasks,
      criticalTaskCount: criticalTaskSet.size,
      nonCriticalTaskCount: tasks.length - criticalTaskSet.size,
    },
  };
}
