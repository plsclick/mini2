import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";
import { calculateScheduleData } from "./engine.service";
import { validateScheduleData } from "./scheduleValidation.service";
import type { ScheduleAnalysis, ScheduleDependency, ScheduleOptions, ScheduleProject, ScheduleTask, ScheduleValidationResult } from "./types";

export async function calculateProjectSchedule(projectId: string, options: ScheduleOptions = {}): Promise<ScheduleAnalysis> {
  const { project, tasks, dependencies } = await loadProjectScheduleData(projectId);
  return calculateScheduleData(project, tasks, dependencies, options);
}

export async function validateProjectSchedule(projectId: string): Promise<ScheduleValidationResult> {
  const { project, tasks, dependencies } = await loadProjectScheduleData(projectId);
  return validateScheduleData(project, tasks, dependencies);
}

export async function loadProjectScheduleData(projectId: string): Promise<{
  project: ScheduleProject;
  tasks: ScheduleTask[];
  dependencies: ScheduleDependency[];
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, plannedStartDate: true },
  });
  if (!project) throw new NotFoundError("Project");

  const [tasks, dependencies] = await Promise.all([
    prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        name: true,
        stage: { select: { name: true } },
        status: true,
        plannedStartDate: true,
        plannedEndDate: true,
      },
    }),
    prisma.taskDependency.findMany({
      where: {
        OR: [
          { projectId },
          { predecessorTask: { projectId } },
          { successorTask: { projectId } },
        ],
      },
      select: {
        id: true,
        projectId: true,
        predecessorTaskId: true,
        successorTaskId: true,
        dependencyType: true,
        lagDays: true,
      },
    }),
  ]);
  return {
    project,
    tasks: tasks.map(({ stage, ...task }) => ({ ...task, stageName: stage?.name ?? null })),
    dependencies,
  };
}
