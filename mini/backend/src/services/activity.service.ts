import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import { getIO } from "../websocket/socket";

interface LogActivityInput {
  projectId?: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Prisma.InputJsonObject;
}

export const activityService = {
  async log(input: LogActivityInput) {
    const activity = await prisma.activity.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        description: input.description,
        metadata: input.metadata,
      },
    });
    if (input.projectId) getIO().to(`project:${input.projectId}`).emit("activity:new", activity);
    return activity;
  },

  async getForProject(projectId: string, limit = 50) {
    return prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });
  },

  async getForUser(userId: string, limit = 50) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        project: { select: { id: true, name: true } },
      },
    });
  },
};
