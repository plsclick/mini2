import { prisma } from "../config/database";
import { NotFoundError, BadRequestError } from "../utils/errors";
import type { CreateDelayInput, DelayQueryInput, UpdateDelayInput } from "../validators/delay.validator";

export const delayService = {
  async listForProject(projectId: string, filters: DelayQueryInput = {}) {
    return prisma.delay.findMany({
      where: {
        projectId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
        ...(filters.taskId ? { taskId: filters.taskId } : {}),
        ...(filters.fromDate || filters.toDate
          ? { reportedAt: {
              ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
              ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
            } }
          : {}),
      },
      orderBy: { reportedAt: "desc" },
      include: {
        task: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true, role: true } },
      },
    });
  },

  async getById(delayId: string) {
    const d = await prisma.delay.findUnique({
      where: { id: delayId },
      include: {
        task: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true, role: true } },
      },
    });
    if (!d) throw new NotFoundError("Delay");
    return d;
  },

  async create(projectId: string, reportedById: string, input: CreateDelayInput) {
    if (input.taskId && !(await prisma.task.findFirst({ where: { id: input.taskId, projectId } }))) {
      throw new BadRequestError("Task must belong to this project");
    }
    return prisma.delay.create({
      data: {
        projectId,
        reportedById,
        taskId: input.taskId,
        reason: input.reason,
        description: input.description,
        delayDays: input.delayDays,
        severity: input.severity,
      },
      include: {
        task: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    });
  },

  async update(projectId: string, delayId: string, input: UpdateDelayInput) {
    const d = await prisma.delay.findFirst({ where: { id: delayId, projectId } });
    if (!d) throw new NotFoundError("Delay");

    return prisma.delay.update({
      where: { id: delayId },
      data: {
        ...input,
        resolvedAt: input.status === "RESOLVED"
          ? d.resolvedAt ?? new Date()
          : input.status
            ? null
            : undefined,
      },
      include: {
        task: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    });
  },
};
