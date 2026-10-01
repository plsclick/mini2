import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import { RecoveryPlanStatus } from "@prisma/client";

interface RecoveryPlanInput {
  title: string;
  description?: string;
  reason?: string;
  estimatedDaysRecovered?: number;
}

interface UpdateRecoveryPlanInput extends Partial<RecoveryPlanInput> {
  status?: RecoveryPlanStatus;
}

export const recoveryService = {
  async listForProject(projectId: string) {
    return prisma.recoveryPlan.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  },

  async getById(planId: string) {
    const p = await prisma.recoveryPlan.findUnique({
      where: { id: planId },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    if (!p) throw new NotFoundError("Recovery plan");
    return p;
  },

  async create(projectId: string, createdById: string, input: RecoveryPlanInput) {
    return prisma.recoveryPlan.create({
      data: { projectId, createdById, ...input },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  },

  async update(planId: string, input: UpdateRecoveryPlanInput) {
    const p = await prisma.recoveryPlan.findUnique({ where: { id: planId } });
    if (!p) throw new NotFoundError("Recovery plan");
    return prisma.recoveryPlan.update({ where: { id: planId }, data: input });
  },

  async delete(planId: string) {
    const p = await prisma.recoveryPlan.findUnique({ where: { id: planId } });
    if (!p) throw new NotFoundError("Recovery plan");
    return prisma.recoveryPlan.delete({ where: { id: planId } });
  },
};
