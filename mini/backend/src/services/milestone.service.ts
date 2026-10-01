import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import { MilestoneStatus } from "@prisma/client";
import { BadRequestError } from "../utils/errors";

interface MilestoneInput {
  taskId?: string;
  name: string;
  description?: string;
  plannedDate?: string;
  actualDate?: string;
  status?: MilestoneStatus;
}

export const milestoneService = {
  async listForProject(projectId: string) {
    return prisma.milestone.findMany({
      where: { projectId },
      orderBy: { plannedDate: "asc" },
    });
  },

  async getById(milestoneId: string) {
    const m = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!m) throw new NotFoundError("Milestone");
    return m;
  },

  async create(projectId: string, input: MilestoneInput) {
    if (input.taskId && !(await prisma.task.findFirst({ where: { id: input.taskId, projectId } }))) {
      throw new BadRequestError("Milestone task must belong to this project");
    }
    return prisma.milestone.create({
      data: {
        projectId,
        name: input.name,
        description: input.description,
        plannedDate: input.plannedDate ? new Date(input.plannedDate) : undefined,
        actualDate: input.actualDate ? new Date(input.actualDate) : undefined,
        status: input.status,
      },
    });
  },

  async update(milestoneId: string, input: Partial<MilestoneInput>) {
    const m = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!m) throw new NotFoundError("Milestone");
    if (input.taskId && !(await prisma.task.findFirst({ where: { id: input.taskId, projectId: m.projectId } }))) {
      throw new BadRequestError("Milestone task must belong to this project");
    }
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...input,
        plannedDate: input.plannedDate ? new Date(input.plannedDate) : undefined,
        actualDate: input.actualDate ? new Date(input.actualDate) : undefined,
      },
    });
  },

  async delete(milestoneId: string) {
    const m = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!m) throw new NotFoundError("Milestone");
    return prisma.milestone.delete({ where: { id: milestoneId } });
  },
};
