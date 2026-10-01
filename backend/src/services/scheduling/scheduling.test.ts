import assert from "node:assert/strict";
import test from "node:test";
import { calculateScheduleData } from "./engine.service";
import type { DependencyType, ScheduleDependency, ScheduleProject, ScheduleTask } from "./types";

const project: ScheduleProject = { id: "project-1", plannedStartDate: "2026-01-01" };

function task(id: string, durationDays: number, status = "TODO"): ScheduleTask {
  const end = new Date(Date.UTC(2026, 0, 1 + durationDays)).toISOString().slice(0, 10);
  return {
    id,
    projectId: project.id,
    name: id,
    status,
    plannedStartDate: "2026-01-01",
    plannedEndDate: end,
  };
}

function dependency(
  predecessorTaskId: string,
  successorTaskId: string,
  dependencyType: DependencyType = "FINISH_TO_START",
  lagDays = 0,
): ScheduleDependency {
  return {
    id: `${predecessorTaskId}-${successorTaskId}`,
    projectId: project.id,
    predecessorTaskId,
    successorTaskId,
    dependencyType,
    lagDays,
  };
}

function calculate(tasks: ScheduleTask[], dependencies: ScheduleDependency[] = []) {
  return calculateScheduleData(project, tasks, dependencies);
}

function scheduled(result: ReturnType<typeof calculate>, taskId: string) {
  const value = result.tasks.find((item) => item.taskId === taskId);
  assert.ok(value, `expected task ${taskId} in schedule`);
  return value;
}

test("single task is critical", () => {
  const result = calculate([task("A", 3)]);
  assert.deepEqual(result.criticalTasks, ["A"]);
  assert.deepEqual(result.criticalPaths, [["A"]]);
  assert.equal(result.totalDurationDays, 3);
});

test("linear dependency marks each task critical", () => {
  const result = calculate([task("A", 2), task("B", 3), task("C", 4)], [
    dependency("A", "B"), dependency("B", "C"),
  ]);
  assert.deepEqual(result.criticalTasks, ["A", "B", "C"]);
  assert.deepEqual(result.criticalPaths, [["A", "B", "C"]]);
  assert.equal(result.totalDurationDays, 9);
});

test("parallel branches give float to the shorter branch", () => {
  const result = calculate([task("A", 1), task("B", 2), task("C", 5)], [
    dependency("A", "B"), dependency("A", "C"),
  ]);
  assert.equal(scheduled(result, "B").totalFloat, 3);
  assert.equal(scheduled(result, "B").isCritical, false);
  assert.equal(scheduled(result, "C").totalFloat, 0);
  assert.deepEqual(result.criticalPaths, [["A", "C"]]);
});

test("multiple predecessors constrain successor to the latest predecessor", () => {
  const result = calculate([task("A", 2), task("B", 5), task("C", 1)], [
    dependency("A", "C"), dependency("B", "C"),
  ]);
  assert.equal(scheduled(result, "C").earliestStart, "2026-01-06");
});

test("cycle is rejected with the cycle task IDs", () => {
  assert.throws(
    () => calculate([task("A", 1), task("B", 1), task("C", 1)], [
      dependency("A", "B"), dependency("B", "C"), dependency("C", "A"),
    ]),
    (error: unknown) => {
      const scheduleError = error as { code?: string; details?: Array<{ taskIds?: string[] }> };
      assert.equal(scheduleError.code, "SCHEDULE_CYCLE_DETECTED");
      assert.deepEqual(scheduleError.details?.[0].taskIds, ["A", "B", "C", "A"]);
      return true;
    },
  );
});

test("self dependency is rejected", () => {
  assert.throws(() => calculate([task("A", 1)], [dependency("A", "A")]), {
    code: "SCHEDULE_SELF_DEPENDENCY",
  });
});

test("finish-to-start lag delays successor start", () => {
  const result = calculate([task("A", 4), task("B", 2)], [dependency("A", "B", "FINISH_TO_START", 2)]);
  assert.equal(scheduled(result, "B").earliestStart, "2026-01-07");
  assert.equal(scheduled(result, "B").earliestFinish, "2026-01-09");
});

test("start-to-start lag constrains successor start", () => {
  const result = calculate([task("A", 4), task("B", 2)], [dependency("A", "B", "START_TO_START", 2)]);
  assert.equal(scheduled(result, "B").earliestStart, "2026-01-03");
});

test("finish-to-finish lag constrains successor finish", () => {
  const result = calculate([task("A", 4), task("B", 2)], [dependency("A", "B", "FINISH_TO_FINISH", 2)]);
  assert.equal(scheduled(result, "B").earliestFinish, "2026-01-07");
});

test("start-to-finish lag is honored in both passes", () => {
  const result = calculate([task("A", 4), task("B", 2)], [dependency("A", "B", "START_TO_FINISH", 2)]);
  assert.equal(scheduled(result, "B").earliestFinish, "2026-01-03");
  assert.equal(scheduled(result, "A").latestFinish, result.calculatedCompletionDate);
  assert.equal(scheduled(result, "A").isCritical, true);
  assert.equal(result.totalDurationDays, 4);
});

test("multiple terminal tasks use latest finish and return multiple paths", () => {
  const result = calculate([task("A", 5), task("B", 5), task("C", 2)]);
  assert.equal(result.calculatedCompletionDate, "2026-01-06");
  assert.equal(result.totalDurationDays, 5);
  assert.deepEqual(result.criticalPaths, [["A"], ["B"]]);
  assert.equal(scheduled(result, "C").totalFloat, 3);
});

test("missing planned dates produce a structured validation error", () => {
  const invalid = { ...task("A", 1), plannedEndDate: null };
  assert.throws(() => calculate([invalid]), { code: "SCHEDULE_DATES_REQUIRED" });
});

test("negative duration is rejected", () => {
  const invalid = { ...task("A", 1), plannedStartDate: "2026-01-03", plannedEndDate: "2026-01-01" };
  assert.throws(() => calculate([invalid]), { code: "SCHEDULE_NEGATIVE_DURATION" });
});

test("cross-project and missing dependency tasks are rejected", () => {
  const invalidDependency = { ...dependency("A", "missing"), projectId: "another-project" };
  assert.throws(() => calculate([task("A", 1)], [invalidDependency]), {
    code: "SCHEDULE_SUCCESSOR_NOT_FOUND",
  });
});

test("topological order follows dependencies rather than task creation order", () => {
  const result = calculate([task("C", 1), task("A", 1), task("B", 1)], [
    dependency("A", "B"), dependency("B", "C"),
  ]);
  assert.deepEqual(result.tasks.map((item) => item.taskId), ["A", "B", "C"]);
});

test("calendar-day normalization and project start fallback are deterministic", () => {
  const localProject = { id: "project-1", plannedStartDate: null };
  const localTask: ScheduleTask = {
    ...task("A", 1),
    plannedStartDate: "2026-01-01T01:30:00+02:00",
    plannedEndDate: "2026-01-02T01:00:00+02:00",
  };
  const result = calculateScheduleData(localProject, [localTask], []);
  assert.equal(result.projectStartDate, "2025-12-31");
  assert.equal(result.tasks[0].durationDays, 1);
});

test("duplicate dependency records are rejected", () => {
  assert.throws(() => calculate([task("A", 1), task("B", 1)], [
    dependency("A", "B"), { ...dependency("A", "B"), id: "duplicate" },
  ]), { code: "SCHEDULE_DUPLICATE_DEPENDENCY" });
});

test("cross-project dependency is rejected when both tasks are present", () => {
  const crossProject = { ...dependency("A", "B"), projectId: "other-project" };
  assert.throws(() => calculate([task("A", 1), task("B", 1)], [crossProject]), {
    code: "SCHEDULE_CROSS_PROJECT_DEPENDENCY",
  });
});

test("forward and backward float calculations agree for every dependency type", () => {
  const types: DependencyType[] = ["FINISH_TO_START", "START_TO_START", "FINISH_TO_FINISH", "START_TO_FINISH"];
  for (const dependencyType of types) {
    const result = calculate([task("A", 4), task("B", 2)], [dependency("A", "B", dependencyType, 1)]);
    for (const item of result.tasks) {
      const startFloat = Date.parse(`${item.latestStart}T00:00:00Z`) - Date.parse(`${item.earliestStart}T00:00:00Z`);
      const finishFloat = Date.parse(`${item.latestFinish}T00:00:00Z`) - Date.parse(`${item.earliestFinish}T00:00:00Z`);
      assert.equal(startFloat / 86_400_000, item.totalFloat, dependencyType);
      assert.equal(finishFloat / 86_400_000, item.totalFloat, dependencyType);
    }
  }
});

test("critical path enumeration is bounded and reports truncation", () => {
  const tasks = Array.from({ length: 16 }, (_, index) => task(`T${index}`, 1));
  const dependencies: ScheduleDependency[] = [];
  for (let layer = 0; layer < 7; layer += 1) {
    for (let branch = 0; branch < 2; branch += 1) {
      for (let nextBranch = 0; nextBranch < 2; nextBranch += 1) {
        dependencies.push(dependency(`T${layer * 2 + branch}`, `T${(layer + 1) * 2 + nextBranch}`));
      }
    }
  }
  const result = calculate(tasks, dependencies);
  assert.equal(result.criticalPaths.length, 100);
  assert.equal(result.criticalPathsTruncated, true);
});

test("Skyline-style parallel work produces a real procurement critical path and float", () => {
  const result = calculate(
    [task("survey", 8), task("excavate", 17), task("foundation", 12), task("structure", 19), task("formwork", 18), task("electrical", 21), task("lift-procurement", 26), task("lift-inspection", 2), task("handover", 3)],
    [
      dependency("survey", "excavate"),
      dependency("excavate", "foundation"),
      dependency("foundation", "structure"),
      dependency("structure", "formwork", "START_TO_START", 2),
      dependency("foundation", "electrical"),
      dependency("foundation", "lift-procurement"),
      dependency("lift-procurement", "lift-inspection"),
      dependency("formwork", "handover"),
      dependency("electrical", "handover"),
      dependency("lift-inspection", "handover"),
    ],
  );
  assert.deepEqual(result.criticalPaths, [["survey", "excavate", "foundation", "lift-procurement", "lift-inspection", "handover"]]);
  assert.equal(scheduled(result, "structure").isCritical, false);
  assert.ok(scheduled(result, "structure").totalFloat > 0);
  assert.equal(result.totalDurationDays, 68);
});

test("in-memory task delay consumes float before extending project completion", () => {
  const tasks = [task("A", 1), task("B", 2), task("C", 5)];
  const dependencies = [dependency("A", "B"), dependency("A", "C")];
  const baseline = calculateScheduleData(project, tasks, dependencies);
  const withinFloat = calculateScheduleData(project, tasks, dependencies, { taskDelayOffsets: { B: 2 } });
  assert.equal(baseline.totalDurationDays, 6);
  assert.equal(scheduled(withinFloat, "B").totalFloat, 1);
  assert.equal(withinFloat.totalDurationDays, baseline.totalDurationDays);

  const beyondFloat = calculateScheduleData(project, tasks, dependencies, { taskDelayOffsets: { B: 4 } });
  assert.equal(beyondFloat.totalDurationDays, baseline.totalDurationDays + 1);
  assert.equal(scheduled(beyondFloat, "B").isCritical, true);
});

test("in-memory delay moves downstream tasks without changing source dates", () => {
  const tasks = [task("A", 1), task("B", 2), task("C", 1)];
  const dependencies = [dependency("A", "B"), dependency("B", "C")];
  const baseline = calculateScheduleData(project, tasks, dependencies);
  const impacted = calculateScheduleData(project, tasks, dependencies, { taskDelayOffsets: { A: 5 } });
  assert.equal(scheduled(impacted, "B").earliestStart, "2026-01-07");
  assert.equal(scheduled(impacted, "C").earliestStart, "2026-01-09");
  assert.equal(impacted.totalDurationDays - baseline.totalDurationDays, 5);
  assert.equal(tasks[0].plannedEndDate, "2026-01-02");
});

test("delay offsets reject unknown tasks and negative days", () => {
  assert.throws(() => calculateScheduleData(project, [task("A", 1)], [], { taskDelayOffsets: { missing: 1 } }), {
    code: "SCHEDULE_DELAY_TASK_NOT_FOUND",
  });
  assert.throws(() => calculateScheduleData(project, [task("A", 1)], [], { taskDelayOffsets: { A: -1 } }), {
    code: "SCHEDULE_INVALID_DELAY_OFFSET",
  });
});
