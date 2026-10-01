import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { CreateRequirementInput, UpdateRequirementInput } from "../validators/requirement.validator";

export const requirementService = {
  async listForProject(projectId: string) {
    return prisma.requirement.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        submittedBy: { select: { id: true, name: true, role: true } },
      },
    });
  },

  async getById(requirementId: string) {
    const r = await prisma.requirement.findUnique({
      where: { id: requirementId },
      include: {
        submittedBy: { select: { id: true, name: true, role: true } },
      },
    });
    if (!r) throw new NotFoundError("Requirement");
    return r;
  },

  async create(projectId: string, submittedById: string, input: CreateRequirementInput) {
    return prisma.requirement.create({
      data: {
        projectId,
        submittedById,
        title: input.title,
        description: input.description,
        type: input.type,
        quantity: input.quantity,
        unit: input.unit,
        priority: input.priority,
        requiredBy: input.requiredBy ? new Date(input.requiredBy) : undefined,
      },
      include: {
        submittedBy: { select: { id: true, name: true } },
      },
    });
  },

  async update(requirementId: string, input: UpdateRequirementInput) {
    const r = await prisma.requirement.findUnique({ where: { id: requirementId } });
    if (!r) throw new NotFoundError("Requirement");

    return prisma.requirement.update({
      where: { id: requirementId },
      data: {
        ...input,
        requiredBy: input.requiredBy ? new Date(input.requiredBy) : undefined,
      },
    });
  },
};
