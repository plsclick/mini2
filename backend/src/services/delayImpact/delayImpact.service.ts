import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";
import { loadProjectScheduleData } from "../scheduling/scheduling.service";
import { calculateDelayImpactData } from "./impact.engine";

export const delayImpactService = {
  async getProjectImpact(projectId: string) {
    const [scheduleData, delays, milestones] = await Promise.all([
      loadProjectScheduleData(projectId),
      prisma.delay.findMany({
        where: { projectId },
        orderBy: { reportedAt: "desc" },
        select: {
          id: true,
          projectId: true,
          taskId: true,
          reason: true,
          description: true,
          delayDays: true,
          severity: true,
          status: true,
          reportedAt: true,
          resolvedAt: true,
        },
      }),
      prisma.milestone.findMany({
        where: { projectId },
        select: {
          id: true,
          projectId: true,
          taskId: true,
          name: true,
          plannedDate: true,
          actualDate: true,
          status: true,
        },
      }),
    ]);
    return calculateDelayImpactData(
      scheduleData.project,
      scheduleData.tasks,
      scheduleData.dependencies,
      milestones,
      delays,
    );
  },

  async getDelayImpact(projectId: string, delayId: string) {
    const [scheduleData, delay, milestones] = await Promise.all([
      loadProjectScheduleData(projectId),
      prisma.delay.findFirst({
        where: { id: delayId, projectId },
        select: {
          id: true,
          projectId: true,
          taskId: true,
          reason: true,
          description: true,
          delayDays: true,
          severity: true,
          status: true,
          reportedAt: true,
          resolvedAt: true,
        },
      }),
      prisma.milestone.findMany({
        where: { projectId },
        select: {
          id: true,
          projectId: true,
          taskId: true,
          name: true,
          plannedDate: true,
          actualDate: true,
          status: true,
        },
      }),
    ]);
    if (!delay) throw new NotFoundError("Delay");
    return calculateDelayImpactData(
      scheduleData.project,
      scheduleData.tasks,
      scheduleData.dependencies,
      milestones,
      [delay],
      delayId,
    );
  },
};
