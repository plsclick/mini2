import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";
import { MaterialStatus } from "@prisma/client";

interface MaterialInput {
  name: string;
  quantityRequired?: number;
  quantityAvailable?: number;
  unit?: string;
  status?: MaterialStatus;
  expectedDeliveryDate?: string;
  supplier?: string;
}

export const materialService = {
  async listForProject(projectId: string) {
    return prisma.material.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(materialId: string) {
    const m = await prisma.material.findUnique({ where: { id: materialId } });
    if (!m) throw new NotFoundError("Material");
    return m;
  },

  async create(projectId: string, input: MaterialInput) {
    return prisma.material.create({
      data: {
        projectId,
        name: input.name,
        quantityRequired: input.quantityRequired ?? 0,
        quantityAvailable: input.quantityAvailable ?? 0,
        unit: input.unit,
        status: input.status,
        expectedDeliveryDate: input.expectedDeliveryDate
          ? new Date(input.expectedDeliveryDate)
          : undefined,
        supplier: input.supplier,
      },
    });
  },

  async update(materialId: string, input: Partial<MaterialInput>) {
    const m = await prisma.material.findUnique({ where: { id: materialId } });
    if (!m) throw new NotFoundError("Material");
    return prisma.material.update({
      where: { id: materialId },
      data: {
        ...input,
        expectedDeliveryDate: input.expectedDeliveryDate
          ? new Date(input.expectedDeliveryDate)
          : undefined,
      },
    });
  },

  async delete(materialId: string) {
    const m = await prisma.material.findUnique({ where: { id: materialId } });
    if (!m) throw new NotFoundError("Material");
    return prisma.material.delete({ where: { id: materialId } });
  },
};
