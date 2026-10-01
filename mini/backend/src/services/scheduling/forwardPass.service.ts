import { dependencyStartOffset } from "./graph.service";
import type { DependencyGraph, ScheduleDependency } from "./types";

export interface ForwardTiming {
  duration: number;
  earliestStart: number;
  earliestFinish: number;
}

export function runForwardPass(
  graph: DependencyGraph,
  durations: Map<string, number>,
): Map<string, ForwardTiming> {
  const timings = new Map<string, ForwardTiming>();

  for (const taskId of graph.topologicalOrder) {
    const duration = durations.get(taskId);
    if (duration === undefined) throw new Error(`Missing duration for task ${taskId}`);

    let earliestStart = 0;
    for (const dependency of graph.predecessors.get(taskId) ?? []) {
      const predecessor = timings.get(dependency.predecessorTaskId);
      if (!predecessor) throw new Error(`Missing predecessor timing for ${dependency.predecessorTaskId}`);
      earliestStart = Math.max(
        earliestStart,
        predecessor.earliestStart + dependencyStartOffset(
          dependency,
          predecessor.duration,
          duration,
        ),
      );
    }

    timings.set(taskId, {
      duration,
      earliestStart,
      earliestFinish: earliestStart + duration,
    });
  }

  return timings;
}

export function scheduleCompletionDay(
  graph: DependencyGraph,
  forwardTimings: Map<string, ForwardTiming>,
): number {
  let completion = 0;
  for (const taskId of graph.taskIds) {
    const timing = forwardTimings.get(taskId);
    if (timing) completion = Math.max(completion, timing.earliestFinish);
  }
  return completion;
}

export function incomingDependencies(graph: DependencyGraph, taskId: string): ScheduleDependency[] {
  return graph.predecessors.get(taskId) ?? [];
}
