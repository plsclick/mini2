import type {
  DependencyGraph,
  ScheduleDependency,
  ScheduleTask,
} from "./types";

export const FLOAT_TOLERANCE_DAYS = 1e-7;

export function buildDependencyGraph(
  tasks: ScheduleTask[],
  dependencies: ScheduleDependency[],
): DependencyGraph {
  const taskIds = tasks.map((task) => task.id);
  const predecessors = new Map<string, ScheduleDependency[]>();
  const successors = new Map<string, ScheduleDependency[]>();
  const indegrees = new Map<string, number>();

  for (const taskId of taskIds) {
    predecessors.set(taskId, []);
    successors.set(taskId, []);
    indegrees.set(taskId, 0);
  }

  for (const dependency of dependencies) {
    if (!indegrees.has(dependency.predecessorTaskId) || !indegrees.has(dependency.successorTaskId)) continue;
    successors.get(dependency.predecessorTaskId)?.push(dependency);
    predecessors.get(dependency.successorTaskId)?.push(dependency);
    indegrees.set(dependency.successorTaskId, (indegrees.get(dependency.successorTaskId) ?? 0) + 1);
  }

  const queue = taskIds.filter((taskId) => indegrees.get(taskId) === 0);
  const topologicalOrder: string[] = [];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const taskId = queue[queueIndex++];
    topologicalOrder.push(taskId);
    for (const dependency of successors.get(taskId) ?? []) {
      const successorTaskId = dependency.successorTaskId;
      const nextIndegree = (indegrees.get(successorTaskId) ?? 0) - 1;
      indegrees.set(successorTaskId, nextIndegree);
      if (nextIndegree === 0) queue.push(successorTaskId);
    }
  }

  if (topologicalOrder.length !== taskIds.length) {
    const cycleTaskIds = findCycle(taskIds, successors, indegrees);
    const error = new Error(`Circular task dependencies detected: ${cycleTaskIds.join(" -> ")}`);
    Object.assign(error, { code: "SCHEDULE_CYCLE_DETECTED", taskIds: cycleTaskIds });
    throw error;
  }

  return { taskIds, predecessors, successors, topologicalOrder };
}

export function dependencyStartOffset(
  dependency: ScheduleDependency,
  predecessorDuration: number,
  successorDuration: number,
): number {
  const predecessorEventOffset =
    dependency.dependencyType === "FINISH_TO_START" ||
    dependency.dependencyType === "FINISH_TO_FINISH"
      ? predecessorDuration
      : 0;
  const successorEventOffset =
    dependency.dependencyType === "FINISH_TO_FINISH" ||
    dependency.dependencyType === "START_TO_FINISH"
      ? successorDuration
      : 0;

  return predecessorEventOffset + dependency.lagDays - successorEventOffset;
}

function findCycle(
  taskIds: string[],
  successors: Map<string, ScheduleDependency[]>,
  remainingIndegrees: Map<string, number>,
): string[] {
  const residual = new Set(taskIds.filter((taskId) => (remainingIndegrees.get(taskId) ?? 0) > 0));
  const colors = new Map<string, 0 | 1 | 2>();

  for (const startId of residual) {
    if (colors.has(startId)) continue;
    colors.set(startId, 1);
    const path = [startId];
    const frames = [{ taskId: startId, nextEdge: 0 }];

    while (frames.length > 0) {
      const frame = frames[frames.length - 1];
      const edges = successors.get(frame.taskId) ?? [];
      let descended = false;

      while (frame.nextEdge < edges.length) {
        const nextId = edges[frame.nextEdge++].successorTaskId;
        if (!residual.has(nextId)) continue;
        const color = colors.get(nextId) ?? 0;
        if (color === 1) {
          const cycleStart = path.lastIndexOf(nextId);
          return [...path.slice(cycleStart), nextId];
        }
        if (color === 0) {
          colors.set(nextId, 1);
          path.push(nextId);
          frames.push({ taskId: nextId, nextEdge: 0 });
          descended = true;
          break;
        }
      }

      if (!descended && frame.nextEdge >= edges.length) {
        colors.set(frame.taskId, 2);
        frames.pop();
        path.pop();
      }
    }
  }

  return [...residual];
}
