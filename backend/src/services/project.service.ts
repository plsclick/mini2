import { prisma } from "../config/database";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errors";
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from "../validators/project.validator";

const projectSelect = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  location: true,
  status: true,
  progress: true,
  plannedStartDate: true,
  plannedEndDate: true,
  actualStartDate: true,
  actualEndDate: true,
  createdAt: true,
  updatedAt: true,
  client: { select: { id: true, name: true, email: true } },
  projectManager: { select: { id: true, name: true, email: true } },
  _count: { select: { stages: true, tasks: true, members: true } },
};

export const projectService = {
  async listForUser(userId: string, organizationId: string) {
    return prisma.project.findMany({
      where: {
        organizationId,
        OR: [
          { clientId: userId },
          { projectManagerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: projectSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ...projectSelect,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
    if (!project) throw new NotFoundError("Project");
    return project;
  },

  async getDashboard(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ...projectSelect,
        tasks: { select: { status: true, progress: true } },
        delays: { where: { status: { in: ["OPEN", "INVESTIGATING"] } }, select: { delayDays: true } },
        risks: { where: { status: { in: ["OPEN", "MONITORING"] } }, select: { severity: true } },
        resources: { select: { id: true } },
      },
    });
    if (!project) throw new NotFoundError("Project");

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((task) => task.status === "COMPLETED").length;
    const averageTaskProgress = totalTasks === 0
      ? 0
      : Math.round(project.tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks);
    const activeDelayDays = project.delays.reduce((sum, delay) => sum + delay.delayDays, 0);
    const riskWeight = project.risks.reduce((sum, risk) => sum + (risk.severity === "CRITICAL" ? 4 : risk.severity === "HIGH" ? 3 : risk.severity === "MEDIUM" ? 2 : 1), 0);

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        plannedStartDate: project.plannedStartDate,
        plannedEndDate: project.plannedEndDate,
      },
      statistics: {
        totalTasks,
        completedTasks,
        activeDelays: project.delays.length,
        activeDelayDays,
        activeRisks: project.risks.length,
        riskWeight,
        resources: project.resources.length,
        averageTaskProgress,
      },
    };
  },

  async create(input: CreateProjectInput, userId: string, organizationId: string) {
    const [client, projectManager] = await Promise.all([
      input.clientId
        ? prisma.user.findFirst({ where: { id: input.clientId, organizationId, role: "CLIENT" } })
        : Promise.resolve(null),
      prisma.user.findFirst({ where: { id: input.projectManagerId ?? userId, organizationId, role: "PROJECT_MANAGER" } }),
    ]);
    if (input.clientId && !client) throw new BadRequestError("Client must belong to this organization");
    if (!projectManager) throw new BadRequestError("Project manager must belong to this organization");

    return prisma.project.create({
      data: {
        organizationId,
        name: input.name,
        description: input.description,
        location: input.location,
        clientId: input.clientId,
        projectManagerId: input.projectManagerId ?? userId,
        plannedStartDate: input.plannedStartDate
          ? new Date(input.plannedStartDate)
          : undefined,
        plannedEndDate: input.plannedEndDate
          ? new Date(input.plannedEndDate)
          : undefined,
        // Auto-add the creating PM as a member
        members: {
          create: { userId, projectRole: "PROJECT_MANAGER" },
        },
      },
      select: projectSelect,
    });
  },

  async update(projectId: string, input: UpdateProjectInput) {
    const current = await prisma.project.findUnique({ where: { id: projectId }, select: { organizationId: true } });
    if (!current) throw new NotFoundError("Project");
    if (input.clientId) {
      const client = await prisma.user.findFirst({ where: { id: input.clientId, organizationId: current.organizationId, role: "CLIENT" } });
      if (!client) throw new BadRequestError("Client must belong to this organization");
    }
    if (input.projectManagerId) {
      const manager = await prisma.user.findFirst({ where: { id: input.projectManagerId, organizationId: current.organizationId, role: "PROJECT_MANAGER" } });
      if (!manager) throw new BadRequestError("Project manager must belong to this organization");
    }
    return prisma.project.update({
      where: { id: projectId },
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
      select: projectSelect,
    });
  },

  async delete(projectId: string) {
    return prisma.project.delete({ where: { id: projectId } });
  },

  async addMember(projectId: string, input: AddMemberInput) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { organizationId: true } });
    const user = await prisma.user.findFirst({ where: { id: input.userId, organizationId: project?.organizationId } });
    if (!project || !user) throw new BadRequestError("Member must belong to this organization");
    if (user.role !== input.projectRole) throw new BadRequestError("Project role must match the user's role");
    return prisma.projectMember.create({
      data: { projectId, userId: input.userId, projectRole: input.projectRole },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  },

  async removeMember(projectId: string, userId: string, requesterId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { projectManagerId: true },
    });
    if (!project) throw new NotFoundError("Project");

    // PM cannot remove themselves if they are the project manager
    if (userId === project.projectManagerId && userId === requesterId) {
      throw new ForbiddenError("Project manager cannot remove themselves");
    }

    return prisma.projectMember.deleteMany({
      where: { projectId, userId },
    });
  },
};
