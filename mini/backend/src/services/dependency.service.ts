import { prisma } from "../config/database";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors";
import type { CreateDependencyInput } from "../validators/dependency.validator";

export const dependencyService = {
  async listForProject(projectId: string) {
    return prisma.taskDependency.findMany({
      where: { projectId },
      include: {
        predecessorTask: { select: { id: true, name: true, status: true } },
        successorTask: { select: { id: true, name: true, status: true } },
      },
    });
  },

  async create(projectId: string, input: CreateDependencyInput) {
    if (input.predecessorTaskId === input.successorTaskId) {
      throw new BadRequestError("A task cannot depend on itself");
    }

    // Verify both tasks belong to this project
    const [pred, succ] = await Promise.all([
      prisma.task.findFirst({
        where: { id: input.predecessorTaskId, projectId },
      }),
      prisma.task.findFirst({
        where: { id: input.successorTaskId, projectId },
      }),
    ]);

    if (!pred) throw new NotFoundError("Predecessor task");
    if (!succ) throw new NotFoundError("Successor task");

    const existing = await prisma.taskDependency.findUnique({
      where: {
        predecessorTaskId_successorTaskId: {
          predecessorTaskId: input.predecessorTaskId,
          successorTaskId: input.successorTaskId,
        },
      },
    });
    if (existing) throw new ConflictError("This dependency already exists");

    return prisma.taskDependency.create({
      data: {
        projectId,
        predecessorTaskId: input.predecessorTaskId,
        successorTaskId: input.successorTaskId,
        dependencyType: input.dependencyType,
        lagDays: input.lagDays,
      },
      include: {
        predecessorTask: { select: { id: true, name: true } },
        successorTask: { select: { id: true, name: true } },
      },
    });
  },

  async delete(dependencyId: string) {
    const dep = await prisma.taskDependency.findUnique({
      where: { id: dependencyId },
    });
    if (!dep) throw new NotFoundError("Dependency");
    return prisma.taskDependency.delete({ where: { id: dependencyId } });
  },
};
