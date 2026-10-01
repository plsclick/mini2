import { FLOAT_TOLERANCE_DAYS, dependencyStartOffset } from "./graph.service";
import type { BackwardTiming } from "./backwardPass.service";
import type { ForwardTiming } from "./forwardPass.service";
import type { DependencyGraph } from "./types";

const MAX_CRITICAL_PATHS = 100;

export interface CriticalPathResult {
  criticalTaskIds: string[];
  criticalPaths: string[][];
  criticalPathsTruncated: boolean;
}

export function findCriticalPaths(
  graph: DependencyGraph,
  forward: Map<string, ForwardTiming>,
  backward: Map<string, BackwardTiming>,
  completion: number,
): CriticalPathResult {
  const criticalTaskIds = graph.taskIds.filter((taskId) => {
    const timing = backward.get(taskId);
    return timing !== undefined && timing.totalFloat <= FLOAT_TOLERANCE_DAYS;
  });
  const criticalTasks = new Set(criticalTaskIds);
  const criticalSuccessors = new Map<string, string[]>();
  const criticalPredecessors = new Map<string, string[]>();

  for (const taskId of criticalTaskIds) {
    criticalSuccessors.set(taskId, []);
    criticalPredecessors.set(taskId, []);
  }

  for (const predecessorTaskId of criticalTaskIds) {
    const predecessor = forward.get(predecessorTaskId);
    if (!predecessor) continue;
    for (const dependency of graph.successors.get(predecessorTaskId) ?? []) {
      const successorTaskId = dependency.successorTaskId;
      if (!criticalTasks.has(successorTaskId)) continue;
      const successor = forward.get(successorTaskId);
      if (!successor) continue;
      const requiredStart = predecessor.earliestStart + dependencyStartOffset(
        dependency,
        predecessor.duration,
        successor.duration,
      );
      if (Math.abs(successor.earliestStart - requiredStart) > FLOAT_TOLERANCE_DAYS) continue;
      criticalSuccessors.get(predecessorTaskId)?.push(successorTaskId);
      criticalPredecessors.get(successorTaskId)?.push(predecessorTaskId);
    }
  }

  const starts = criticalTaskIds.filter((taskId) =>
    (criticalPredecessors.get(taskId)?.length ?? 0) === 0 &&
    Math.abs(forward.get(taskId)?.earliestStart ?? Number.POSITIVE_INFINITY) <= FLOAT_TOLERANCE_DAYS,
  );
  const targets = new Set(criticalTaskIds.filter((taskId) => {
    const timing = forward.get(taskId);
    return timing !== undefined &&
      Math.abs(timing.earliestFinish - completion) <= FLOAT_TOLERANCE_DAYS &&
      (criticalSuccessors.get(taskId)?.length ?? 0) === 0;
  }));

  const criticalPaths: string[][] = [];
  let criticalPathsTruncated = false;
  for (const startTaskId of starts) {
    const path = [startTaskId];
    const stack = [{ taskId: startTaskId, nextSuccessor: 0 }];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      if (targets.has(frame.taskId)) {
        if (criticalPaths.length < MAX_CRITICAL_PATHS) criticalPaths.push([...path]);
        else criticalPathsTruncated = true;
        stack.pop();
        path.pop();
        if (criticalPathsTruncated) break;
        continue;
      }

      const successors = criticalSuccessors.get(frame.taskId) ?? [];
      if (frame.nextSuccessor >= successors.length) {
        stack.pop();
        path.pop();
        continue;
      }
      const nextTaskId = successors[frame.nextSuccessor++];
      path.push(nextTaskId);
      stack.push({ taskId: nextTaskId, nextSuccessor: 0 });
    }
    if (criticalPathsTruncated) break;
  }

  return { criticalTaskIds, criticalPaths, criticalPathsTruncated };
}
