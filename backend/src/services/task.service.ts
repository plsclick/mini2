import { prisma } from "../config/database";
import { NotFoundError, BadRequestError } from "../utils/errors";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator";

const taskSelect = {
  id: true,
  projectId: true,
  stageId: true,
  name: true,
  description: true,
  status: true,
  priority: true,
  progress: true,
  plannedStartDate: true,
  plannedEndDate: true,
  actualStartDate: true,
  actualEndDate: true,
  estimatedHours: true,
  actualHours: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  stage: { select: { id: true, name: true } },
};

export const taskService = {
  async listForProject(projectId: string, filters?: {
    stageId?: string;
    status?: string;
    assignedToId?: string;
  }) {
    return prisma.task.findMany({
      where: {
        projectId,
        ...(filters?.stageId ? { stageId: filters.stageId } : {}),
        ...(filters?.status ? { status: filters.status as never } : {}),
        ...(filters?.assignedToId ? { assignedToId: filters.assignedToId } : {}),
      },
      select: taskSelect,
      orderBy: [{ stageId: "asc" }, { createdAt: "asc" }],
    });
  },

  async getById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        ...taskSelect,
        successorDependencies: {
          include: { successorTask: { select: { id: true, name: true } } },
        },
        predecessorDependencies: {
          include: { predecessorTask: { select: { id: true, name: true } } },
        },
      },
    });
    if (!task) throw new NotFoundError("Task");
    return task;
  },

  async create(projectId: string, input: CreateTaskInput) {
    if (input.stageId && !(await prisma.stage.findFirst({ where: { id: input.stageId, projectId } }))) {
      throw new BadRequestError("Stage must belong to this project");
    }
    if (input.assignedToId) await assertProjectMember(projectId, input.assignedToId);
    return prisma.task.create({
      data: {
        projectId,
        stageId: input.stageId,
        name: input.name,
        description: input.description,
        priority: input.priority,
        assignedToId: input.assignedToId,
        plannedStartDate: input.plannedStartDate
          ? new Date(input.plannedStartDate)
          : undefined,
        plannedEndDate: input.plannedEndDate
          ? new Date(input.plannedEndDate)
          : undefined,
        estimatedHours: input.estimatedHours,
      },
      select: taskSelect,
    });
  },

  async update(taskId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError("Task");
    const plannedStartDate = input.plannedStartDate
      ? new Date(input.plannedStartDate)
      : task.plannedStartDate;
    const plannedEndDate = input.plannedEndDate
      ? new Date(input.plannedEndDate)
      : task.plannedEndDate;
    if (plannedStartDate && plannedEndDate && plannedEndDate < plannedStartDate) {
      throw new BadRequestError("Planned end date must be on or after planned start date");
    }
    if (input.stageId && !(await prisma.stage.findFirst({ where: { id: input.stageId, projectId: task.projectId } }))) {
      throw new BadRequestError("Stage must belong to this project");
    }
    if (input.assignedToId) await assertProjectMember(task.projectId, input.assignedToId);

    return prisma.task.update({
      where: { id: taskId },
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
      select: taskSelect,
    });
  },

  async delete(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError("Task");
    return prisma.task.delete({ where: { id: taskId } });
  },
};

async function assertProjectMember(projectId: string, userId: string): Promise<void> {
  const [project, member, assignee] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, select: { clientId: true, projectManagerId: true } }),
    prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);
  if (!project || !assignee || assignee.role === "CLIENT" || (!member && project.clientId !== userId && project.projectManagerId !== userId)) {
    throw new BadRequestError("Assignee must be a member of this project");
  }
}
