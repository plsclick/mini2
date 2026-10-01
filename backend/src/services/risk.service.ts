import { prisma } from "../config/database";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { RiskSeverity, RiskStatus } from "@prisma/client";

interface RiskInput {
  taskId?: string;
  title: string;
  description?: string;
  probability?: number;
  impact?: number;
  severity?: RiskSeverity;
  mitigation?: string;
}

interface UpdateRiskInput extends Partial<RiskInput> {
  status?: RiskStatus;
}

export const riskService = {
  async listForProject(projectId: string) {
    return prisma.risk.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  },

  async getById(riskId: string) {
    const r = await prisma.risk.findUnique({
      where: { id: riskId },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    if (!r) throw new NotFoundError("Risk");
    return r;
  },

  async create(projectId: string, createdById: string, input: RiskInput) {
    if (input.taskId && !(await prisma.task.findFirst({ where: { id: input.taskId, projectId } }))) {
      throw new BadRequestError("Task must belong to this project");
    }
    return prisma.risk.create({
      data: { projectId, createdById, ...input },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  },

  async update(riskId: string, input: UpdateRiskInput) {
    const r = await prisma.risk.findUnique({ where: { id: riskId } });
    if (!r) throw new NotFoundError("Risk");
    return prisma.risk.update({ where: { id: riskId }, data: input });
  },

  async delete(riskId: string) {
    const r = await prisma.risk.findUnique({ where: { id: riskId } });
    if (!r) throw new NotFoundError("Risk");
    return prisma.risk.delete({ where: { id: riskId } });
  },
};
