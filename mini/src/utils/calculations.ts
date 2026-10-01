import type { Task } from "../types/task";
import type { Stage } from "../types/stage";

/** Weighted average progress across stages */
export function overallProgress(stages: Stage[]): number {
  if (!stages.length) return 0;
  const total = stages.reduce((sum, s) => sum + s.taskCount, 0);
  if (!total) return 0;
  const weighted = stages.reduce((sum, s) => sum + s.progress * s.taskCount, 0);
  return Math.round(weighted / total);
}

/** Total project delay: max delay across all critical-path tasks */
export function projectDelayDays(tasks: Task[]): number {
  const critical = tasks.filter((t) => t.isCritical);
  if (!critical.length) return 0;
  return critical.reduce((max, t) => {
    const slack = t.slack ?? 0;
    return slack < 0 ? Math.max(max, Math.abs(slack)) : max;
  }, 0);
}

/** Schedule performance index: actual / planned (0–1) */
export function scheduleIndex(actual: number, planned: number): number {
  if (!planned) return 1;
  return Math.min(actual / planned, 1);
}

/** Count tasks on the critical path with zero float */
export function criticalTaskCount(tasks: Task[]): number {
  return tasks.filter((t) => t.isCritical && (t.slack ?? 1) === 0).length;
}

/** Simple float health: 0–100 score based on average slack of non-critical tasks */
export function scheduleHealthScore(tasks: Task[]): number {
  const nonCrit = tasks.filter((t) => !t.isCritical);
  if (!nonCrit.length) return 100;
  const avgSlack = nonCrit.reduce((s, t) => s + (t.slack ?? 0), 0) / nonCrit.length;
  return Math.round(Math.min(100, (avgSlack / 5) * 100));
}
