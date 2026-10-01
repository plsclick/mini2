import { prisma } from "../config/database";
import { NotificationType } from "@prisma/client";
import { getIO } from "../websocket/socket";

interface CreateNotificationInput {
  userId: string;
  projectId?: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export const notificationService = {
  async create(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        projectId: input.projectId,
        title: input.title,
        message: input.message,
        type: input.type ?? "INFO",
      },
    });
    getIO().to(`user:${input.userId}`).emit("notification:new", notification);
    return notification;
  },

  async createForProjectMembers(
    projectId: string,
    excludeUserId: string,
    title: string,
    message: string,
    type: NotificationType = "INFO",
  ) {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, projectManagerId: true },
    });

    const userIds = new Set<string>(members.map((m) => m.userId));
    if (project?.clientId) userIds.add(project.clientId);
    if (project?.projectManagerId) userIds.add(project.projectManagerId);
    userIds.delete(excludeUserId);

    const notifications = Array.from(userIds).map((userId) => ({
      userId,
      projectId,
      title,
      message,
      type,
    }));

    const created = await Promise.all(notifications.map((data) => prisma.notification.create({ data })));
    for (const notification of created) {
      getIO().to(`user:${notification.userId}`).emit("notification:new", notification);
    }
    return created;
  },

  async getForUser(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },
};
