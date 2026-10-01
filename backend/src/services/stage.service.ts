import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { CreateStageInput, UpdateStageInput } from "../validators/stage.validator";

export const stageService = {
  async listForProject(projectId: string) {
    return prisma.stage.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: { _count: { select: { tasks: true } } },
    });
  },

  async getById(stageId: string) {
    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        tasks: {
          select: {
            id: true, name: true, status: true, progress: true, priority: true,
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!stage) throw new NotFoundError("Stage");
    return stage;
  },

  async create(projectId: string, input: CreateStageInput) {
    const maxOrder = await prisma.stage.aggregate({
      where: { projectId },
      _max: { order: true },
    });
    const order = input.order ?? (maxOrder._max.order ?? -1) + 1;

    return prisma.stage.create({
      data: {
        projectId,
        name: input.name,
        description: input.description,
        order,
        plannedStartDate: input.plannedStartDate
          ? new Date(input.plannedStartDate)
          : undefined,
        plannedEndDate: input.plannedEndDate
          ? new Date(input.plannedEndDate)
          : undefined,
      },
    });
  },

  async update(stageId: string, input: UpdateStageInput) {
    const stage = await prisma.stage.findUnique({ where: { id: stageId } });
    if (!stage) throw new NotFoundError("Stage");

    return prisma.stage.update({
      where: { id: stageId },
      data: {
        ...input,
        plannedStartDate: input.plannedStartDate
          ? new Date(input.plannedStartDate)
          : undefined,
        plannedEndDate: input.plannedEndDate
          ? new Date(input.plannedEndDate)
          : undefined,
        actualStartDate: input.actualStartDate
          ? new Date(input.actualStartDate)
          : undefined,
        actualEndDate: input.actualEndDate
          ? new Date(input.actualEndDate)
          : undefined,
      },
    });
  },

  async delete(stageId: string) {
    const stage = await prisma.stage.findUnique({ where: { id: stageId } });
    if (!stage) throw new NotFoundError("Stage");
    return prisma.stage.delete({ where: { id: stageId } });
  },
};
