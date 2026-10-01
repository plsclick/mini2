import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import { ResourceType } from "@prisma/client";

interface ResourceInput {
  name: string;
  type: ResourceType;
  quantity?: number;
  unit?: string;
  status?: string;
  cost?: number;
}

export const resourceService = {
  async listForProject(projectId: string) {
    return prisma.resource.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(resourceId: string) {
    const r = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!r) throw new NotFoundError("Resource");
    return r;
  },

  async create(projectId: string, input: ResourceInput) {
    return prisma.resource.create({
      data: { projectId, ...input },
    });
  },

  async update(resourceId: string, input: Partial<ResourceInput>) {
    const r = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!r) throw new NotFoundError("Resource");
    return prisma.resource.update({ where: { id: resourceId }, data: input });
  },

  async delete(resourceId: string) {
    const r = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!r) throw new NotFoundError("Resource");
    return prisma.resource.delete({ where: { id: resourceId } });
  },
};
