import { durationInCalendarDays, toCalendarDay } from "./calendar.service";
import { buildDependencyGraph } from "./graph.service";
import type {
  ScheduleDependency,
  ScheduleIssue,
  ScheduleProject,
  ScheduleTask,
  ScheduleValidationResult,
} from "./types";

const DEPENDENCY_TYPES = new Set([
  "FINISH_TO_START",
  "START_TO_START",
  "FINISH_TO_FINISH",
  "START_TO_FINISH",
]);

export function validateScheduleData(
  project: ScheduleProject,
  tasks: ScheduleTask[],
  dependencies: ScheduleDependency[],
): ScheduleValidationResult {
  const errors: ScheduleIssue[] = [];
  const tasksById = new Map<string, ScheduleTask>();

  for (const task of tasks) {
    if (tasksById.has(task.id)) {
      errors.push({ code: "SCHEDULE_DUPLICATE_TASK", message: `Task ID ${task.id} appears more than once`, taskIds: [task.id] });
      continue;
    }
    tasksById.set(task.id, task);

    if (!task.plannedStartDate || !task.plannedEndDate) {
      errors.push({ code: "SCHEDULE_DATES_REQUIRED", message: `Task "${task.name}" needs both planned start and end dates`, taskIds: [task.id] });
      continue;
    }
    const startDay = toCalendarDay(task.plannedStartDate);
    const endDay = toCalendarDay(task.plannedEndDate);
    if (!Number.isFinite(startDay) || !Number.isFinite(endDay)) {
      errors.push({ code: "SCHEDULE_INVALID_DATE", message: `Task "${task.name}" has an invalid planned date`, taskIds: [task.id] });
    } else if (endDay < startDay) {
      errors.push({ code: "SCHEDULE_NEGATIVE_DURATION", message: `Task "${task.name}" ends before it starts`, taskIds: [task.id] });
    } else if (!Number.isFinite(durationInCalendarDays(task.plannedStartDate, task.plannedEndDate))) {
      errors.push({ code: "SCHEDULE_INVALID_DURATION", message: `Task "${task.name}" has an invalid duration`, taskIds: [task.id] });
    }
    if (task.projectId !== project.id) {
      errors.push({ code: "SCHEDULE_CROSS_PROJECT_TASK", message: `Task "${task.name}" does not belong to this project`, taskIds: [task.id] });
    }
  }

  if (project.plannedStartDate && !Number.isFinite(toCalendarDay(project.plannedStartDate))) {
    errors.push({ code: "SCHEDULE_INVALID_PROJECT_START", message: "Project planned start date is invalid" });
  }

  const seenDependencies = new Set<string>();
  for (const dependency of dependencies) {
    const pair = `${dependency.predecessorTaskId}\u0000${dependency.successorTaskId}`;
    if (seenDependencies.has(pair)) {
      errors.push({ code: "SCHEDULE_DUPLICATE_DEPENDENCY", message: "Duplicate dependency between the same tasks", taskIds: [dependency.predecessorTaskId, dependency.successorTaskId], dependencyId: dependency.id });
    }
    seenDependencies.add(pair);

    if (dependency.predecessorTaskId === dependency.successorTaskId) {
      errors.push({ code: "SCHEDULE_SELF_DEPENDENCY", message: "A task cannot depend on itself", taskIds: [dependency.predecessorTaskId], dependencyId: dependency.id });
    }
    if (!tasksById.has(dependency.predecessorTaskId)) {
      errors.push({ code: "SCHEDULE_PREDECESSOR_NOT_FOUND", message: `Predecessor task ${dependency.predecessorTaskId} is not in this project`, taskIds: [dependency.predecessorTaskId], dependencyId: dependency.id });
    }
    if (!tasksById.has(dependency.successorTaskId)) {
      errors.push({ code: "SCHEDULE_SUCCESSOR_NOT_FOUND", message: `Successor task ${dependency.successorTaskId} is not in this project`, taskIds: [dependency.successorTaskId], dependencyId: dependency.id });
    }
    if (dependency.projectId !== project.id) {
      errors.push({ code: "SCHEDULE_CROSS_PROJECT_DEPENDENCY", message: `Dependency ${dependency.id} does not belong to this project`, taskIds: [dependency.predecessorTaskId, dependency.successorTaskId], dependencyId: dependency.id });
    }
    if (!DEPENDENCY_TYPES.has(dependency.dependencyType)) {
      errors.push({ code: "SCHEDULE_INVALID_DEPENDENCY_TYPE", message: `Dependency ${dependency.id} has an unsupported dependency type`, dependencyId: dependency.id });
    }
    if (!Number.isInteger(dependency.lagDays) || dependency.lagDays < 0) {
      errors.push({ code: "SCHEDULE_INVALID_LAG", message: `Dependency ${dependency.id} must have a non-negative whole-day lag`, dependencyId: dependency.id });
    }
  }

  if (errors.length === 0) {
    try {
      buildDependencyGraph(tasks, dependencies);
    } catch (error) {
      const cycleError = error as Error & { code?: string; taskIds?: string[] };
      errors.push({
        code: cycleError.code ?? "SCHEDULE_CYCLE_DETECTED",
        message: cycleError.message,
        taskIds: cycleError.taskIds,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
