import assert from "node:assert/strict";
import test from "node:test";
import { calculateDelayImpactData } from "./impact.engine";
import type { ImpactDelay, ImpactMilestone } from "./impact.engine";
import type { DependencyType, ScheduleDependency, ScheduleProject, ScheduleTask } from "../scheduling/types";
import { CreateDelaySchema, ConstructionManagerUpdateDelaySchema, DelayQuerySchema, UpdateDelaySchema } from "../../validators/delay.validator";
import { requireRole } from "../../middleware/role.middleware";
import type { Request, Response } from "express";

const project: ScheduleProject = { id: "project-1", plannedStartDate: "2026-01-01" };

function task(id: string, duration: number): ScheduleTask {
  return {
    id,
    projectId: project.id,
    name: id,
    status: "IN_PROGRESS",
    plannedStartDate: "2026-01-01",
    plannedEndDate: new Date(Date.UTC(2026, 0, 1 + duration)).toISOString().slice(0, 10),
  };
}

function dependency(from: string, to: string, type: DependencyType = "FINISH_TO_START", lagDays = 0): ScheduleDependency {
  return { id: `${from}-${to}`, projectId: project.id, predecessorTaskId: from, successorTaskId: to, dependencyType: type, lagDays };
}

function delay(id: string, taskId: string, delayDays: number, status = "OPEN"): ImpactDelay {
  return {
    id,
    projectId: project.id,
    taskId,
    reason: "Test delay",
    description: null,
    delayDays,
    severity: "HIGH",
    status,
    reportedAt: "2026-01-01T00:00:00.000Z",
    resolvedAt: status === "RESOLVED" ? "2026-01-02T00:00:00.000Z" : null,
  };
}

function impact(
  tasks: ScheduleTask[],
  dependencies: ScheduleDependency[],
  delays: ImpactDelay[],
  milestones: ImpactMilestone[] = [],
  delayId?: string,
) {
  return calculateDelayImpactData(project, tasks, dependencies, milestones, delays, delayId);
}

test("critical task delay propagates through downstream tasks and changes completion", () => {
  const result = impact(
    [task("A", 2), task("B", 3), task("C", 1)],
    [dependency("A", "B"), dependency("B", "C")],
    [delay("d1", "A", 5)],
  );
  assert.equal(result.baseline.durationDays, 6);
  assert.equal(result.impacted.projectDelayDays, 5);
  assert.equal(result.affectedTasks.find((item) => item.taskId === "A")?.classifications.includes("DIRECTLY_DELAYED"), true);
  assert.equal(result.affectedTasks.find((item) => item.taskId === "C")?.classifications.includes("INDIRECTLY_DELAYED"), true);
  assert.equal(result.affectedTasks.find((item) => item.taskId === "C")?.projectedStart, "2026-01-11");
});

test("non-critical task delay within float consumes float but preserves completion", () => {
  const result = impact(
    [task("A", 1), task("B", 2), task("C", 5)],
    [dependency("A", "B"), dependency("A", "C")],
    [delay("d1", "B", 2)],
  );
  const affected = result.affectedTasks.find((item) => item.taskId === "B");
  assert.equal(result.impacted.projectDelayDays, 0);
  assert.equal(affected?.baselineFloat, 3);
  assert.equal(affected?.projectedFloat, 1);
  assert.equal(affected?.floatConsumed, 2);
});

test("delay beyond remaining float extends project completion", () => {
  const result = impact(
    [task("A", 1), task("B", 2), task("C", 5)],
    [dependency("A", "B"), dependency("A", "C")],
    [delay("d1", "B", 4)],
  );
  const affected = result.affectedTasks.find((item) => item.taskId === "B");
  assert.equal(result.impacted.projectDelayDays, 1);
  assert.equal(affected?.projectedFloat, 0);
  assert.equal(affected?.classifications.includes("PROJECT_COMPLETION_IMPACTED"), true);
});

test("parallel delays are recalculated together instead of summed into project delay", () => {
  const result = impact(
    [task("A", 1), task("B", 2), task("C", 5)],
    [dependency("A", "B"), dependency("A", "C")],
    [delay("d1", "B", 4), delay("d2", "C", 2)],
  );
  assert.equal(result.delaySummary.totalReportedDelayDays, 6);
  assert.equal(result.impacted.projectDelayDays, 2);
});

test("multiple active delays on one task aggregate their offsets", () => {
  const result = impact(
    [task("A", 2)],
    [],
    [delay("d1", "A", 3), delay("d2", "A", 2)],
  );
  assert.equal(result.delaySummary.activeDelayCount, 2);
  assert.equal(result.affectedTasks[0].directDelayDays, 5);
  assert.equal(result.impacted.projectDelayDays, 5);
});

test("resolved delays remain visible but do not affect the current schedule", () => {
  const result = impact(
    [task("A", 2)],
    [],
    [delay("d1", "A", 4, "RESOLVED")],
  );
  assert.equal(result.delays.length, 1);
  assert.equal(result.delaySummary.activeDelayCount, 0);
  assert.equal(result.impacted.projectDelayDays, 0);
  assert.equal(result.affectedTasks.length, 0);
});

test("linked milestone moves by its task's finish delta", () => {
  const milestone: ImpactMilestone = {
    id: "m1",
    projectId: project.id,
    taskId: "A",
    name: "Foundation complete",
    plannedDate: "2026-01-03",
    actualDate: null,
    status: "PENDING",
  };
  const result = impact([task("A", 2)], [], [delay("d1", "A", 3)], [milestone]);
  assert.deepEqual(result.affectedMilestones, [{
    milestoneId: "m1",
    name: "Foundation complete",
    taskId: "A",
    baselineDate: "2026-01-03",
    projectedDate: "2026-01-06",
    delayDays: 3,
  }]);
});

test("individual delay impact isolates one report from other active delays", () => {
  const result = impact(
    [task("A", 2)],
    [],
    [delay("d1", "A", 3), delay("d2", "A", 4)],
    [],
    "d1",
  );
  assert.equal(result.delaySummary.activeDelayCount, 1);
  assert.equal(result.impacted.projectDelayDays, 3);
  assert.equal(result.individualDelay?.id, "d1");
});

test("all dependency types and lag continue to use the existing scheduler", () => {
  const types: DependencyType[] = ["FINISH_TO_START", "START_TO_START", "FINISH_TO_FINISH", "START_TO_FINISH"];
  for (const type of types) {
    const result = impact(
      [task("A", 4), task("B", 2)],
      [dependency("A", "B", type, 1)],
      [delay("d1", "A", 2)],
    );
    assert.ok(result.impacted.durationDays >= result.baseline.durationDays, type);
    assert.equal(result.delaySummary.activeDelayCount, 1, type);
  }
});

test("cyclic dependency graph remains rejected by the shared scheduler", () => {
  assert.throws(() => impact(
    [task("A", 1), task("B", 1), task("C", 1)],
    [dependency("A", "B"), dependency("B", "C"), dependency("C", "A")],
    [delay("d1", "A", 1)],
  ), { code: "SCHEDULE_CYCLE_DETECTED" });
});

test("delay requests require a project task, positive whole days, and valid fields", () => {
  assert.equal(CreateDelaySchema.safeParse({ reason: "Late material", delayDays: 3, severity: "HIGH" }).success, false);
  assert.equal(CreateDelaySchema.safeParse({ taskId: "not-a-uuid", reason: "Late material", delayDays: 3 }).success, false);
  assert.equal(CreateDelaySchema.safeParse({ taskId: "00000000-0000-4000-8000-000000000001", reason: "Late material", delayDays: 0 }).success, false);
  assert.equal(CreateDelaySchema.safeParse({ taskId: "00000000-0000-4000-8000-000000000001", reason: "Late material", delayDays: 3, reportedById: "spoofed" }).success, false);
});

test("construction managers cannot submit delay resolution status", () => {
  assert.equal(ConstructionManagerUpdateDelaySchema.safeParse({ reason: "Revised cause" }).success, true);
  assert.equal(ConstructionManagerUpdateDelaySchema.safeParse({ status: "RESOLVED" }).success, false);
  assert.equal(UpdateDelaySchema.safeParse({ status: "RESOLVED" }).success, true);
});

test("delay list query validates filters and date range ordering", () => {
  assert.equal(DelayQuerySchema.safeParse({ status: "OPEN", severity: "HIGH", fromDate: "2026-10-01T00:00:00.000Z", toDate: "2026-10-02T00:00:00.000Z" }).success, true);
  assert.equal(DelayQuerySchema.safeParse({ fromDate: "2026-10-03T00:00:00.000Z", toDate: "2026-10-02T00:00:00.000Z" }).success, false);
  assert.equal(DelayQuerySchema.safeParse({ status: "UNKNOWN" }).success, false);
});

test("role middleware permits clients to read but limits delay resolution to managers", () => {
  const authorize = (role: string, allowedRoles: string[]) => {
    let rejected = false;
    const middleware = requireRole(...allowedRoles);
    middleware(
      { user: { role } } as Request,
      {} as Response,
      (error?: unknown) => { rejected = error !== undefined; },
    );
    return !rejected;
  };
  assert.equal(authorize("CLIENT", ["CLIENT", "PROJECT_MANAGER", "CONSTRUCTION_MANAGER"]), true);
  assert.equal(authorize("CONSTRUCTION_MANAGER", ["PROJECT_MANAGER"]), false);
  assert.equal(authorize("PROJECT_MANAGER", ["PROJECT_MANAGER"]), true);
});
