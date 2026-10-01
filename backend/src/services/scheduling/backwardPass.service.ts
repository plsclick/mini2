import { dependencyStartOffset, FLOAT_TOLERANCE_DAYS } from "./graph.service";
import type { DependencyGraph } from "./types";
import type { ForwardTiming } from "./forwardPass.service";

export interface BackwardTiming {
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
}

export function runBackwardPass(
  graph: DependencyGraph,
  durations: Map<string, number>,
  forwardTimings: Map<string, ForwardTiming>,
  completion: number,
): Map<string, BackwardTiming> {
  const timings = new Map<string, BackwardTiming>();

  for (const taskId of [...graph.topologicalOrder].reverse()) {
    const duration = durations.get(taskId);
    const forward = forwardTimings.get(taskId);
    if (duration === undefined || !forward) throw new Error(`Missing timing for task ${taskId}`);

    const successors = graph.successors.get(taskId) ?? [];
    let latestStart = completion - duration;

    for (const dependency of successors) {
      const successor = timings.get(dependency.successorTaskId);
      const successorDuration = durations.get(dependency.successorTaskId);
      if (!successor || successorDuration === undefined) {
        throw new Error(`Missing successor timing for ${dependency.successorTaskId}`);
      }
      latestStart = Math.min(
        latestStart,
        successor.latestStart - dependencyStartOffset(dependency, duration, successorDuration),
      );
    }

    let totalFloat = latestStart - forward.earliestStart;
    if (Math.abs(totalFloat) <= FLOAT_TOLERANCE_DAYS) totalFloat = 0;
    timings.set(taskId, {
      latestStart,
      latestFinish: latestStart + duration,
      totalFloat,
    });
  }

  return timings;
}
