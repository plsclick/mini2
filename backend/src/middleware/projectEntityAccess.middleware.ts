import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { ForbiddenError, NotFoundError } from "../utils/errors";

type ProjectEntity = "task" | "stage" | "taskDependency" | "resource" | "material" | "milestone" | "delay" | "risk" | "recoveryPlan" | "requirement" | "siteUpdate";

export function requireEntityProjectAccess(entity: ProjectEntity) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const record = await findProjectId(entity, id);
      if (!record) throw new NotFoundError(entity);

      if (req.params.projectId && req.params.projectId !== record.projectId) {
        throw new NotFoundError(entity);
      }

      const project = await prisma.project.findFirst({
        where: {
          id: record.projectId,
          organizationId: req.user.organizationId,
          OR: [
            { clientId: req.user.id },
            { projectManagerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
        select: { id: true, organizationId: true, name: true, status: true },
      });
      if (!project) throw new ForbiddenError("Access denied to this project");
      req.project = project;
      next();
    } catch (err) {
      next(err);
    }
  };
}

function findProjectId(entity: ProjectEntity, id: string): Promise<{ projectId: string } | null> {
  const args = { where: { id }, select: { projectId: true } };
  switch (entity) {
    case "task": return prisma.task.findUnique(args);
    case "stage": return prisma.stage.findUnique(args);
    case "taskDependency": return prisma.taskDependency.findUnique(args);
    case "resource": return prisma.resource.findUnique(args);
    case "material": return prisma.material.findUnique(args);
    case "milestone": return prisma.milestone.findUnique(args);
    case "delay": return prisma.delay.findUnique(args);
    case "risk": return prisma.risk.findUnique(args);
    case "recoveryPlan": return prisma.recoveryPlan.findUnique(args);
    case "requirement": return prisma.requirement.findUnique(args);
    case "siteUpdate": return prisma.siteUpdate.findUnique(args);
  }
}