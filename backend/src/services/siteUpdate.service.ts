import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { CreateSiteUpdateInput, UpdateSiteUpdateInput } from "../validators/siteUpdate.validator";

export const siteUpdateService = {
  async listForProject(projectId: string) {
    return prisma.siteUpdate.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        submittedBy: { select: { id: true, name: true, role: true } },
      },
    });
  },

  async getById(updateId: string) {
    const u = await prisma.siteUpdate.findUnique({
      where: { id: updateId },
      include: {
        submittedBy: { select: { id: true, name: true, role: true } },
      },
    });
    if (!u) throw new NotFoundError("Site update");
    return u;
  },

  async create(projectId: string, submittedById: string, input: CreateSiteUpdateInput) {
    return prisma.siteUpdate.create({
      data: {
        projectId,
        submittedById,
        title: input.title,
        description: input.description,
        progress: input.progress,
        issue: input.issue,
      },
      include: {
        submittedBy: { select: { id: true, name: true } },
      },
    });
  },

  async update(updateId: string, input: UpdateSiteUpdateInput) {
    const u = await prisma.siteUpdate.findUnique({ where: { id: updateId } });
    if (!u) throw new NotFoundError("Site update");
    return prisma.siteUpdate.update({ where: { id: updateId }, data: input });
  },

  async delete(updateId: string) {
    const u = await prisma.siteUpdate.findUnique({ where: { id: updateId } });
    if (!u) throw new NotFoundError("Site update");
    return prisma.siteUpdate.delete({ where: { id: updateId } });
  },
};
