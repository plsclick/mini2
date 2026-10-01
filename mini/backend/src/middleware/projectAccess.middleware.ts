import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { ForbiddenError, NotFoundError } from "../utils/errors";

/**
 * Verifies the authenticated user has access to the project identified by
 * req.params.projectId (or req.params.id when used on /projects/:id routes).
 *
 * Access is granted when ANY of the following is true:
 *  1. User is the project's designated client (clientId)
 *  2. User is the project manager (projectManagerId)
 *  3. User has an explicit ProjectMember row for this project
 *
 * The project must also belong to the user's organization.
 * Attaches req.project for downstream handlers.
 */
declare global {
  namespace Express {
    interface Request {
      project?: {
        id: string;
        organizationId: string;
        name: string;
        status: string;
      };
    }
  }
}

export async function requireProjectAccess(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const projectId = req.params.projectId ?? req.params.id;
    if (!projectId) {
      next(new NotFoundError("Project"));
      return;
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: req.user.organizationId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        status: true,
        clientId: true,
        projectManagerId: true,
      },
    });

    if (!project) {
      next(new NotFoundError("Project"));
      return;
    }

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });

    const hasDirectAccess =
      project.clientId === req.user.id ||
      project.projectManagerId === req.user.id ||
      isMember !== null;

    if (!hasDirectAccess) {
      next(new ForbiddenError("You are not a member of this project"));
      return;
    }

    req.project = {
      id: project.id,
      organizationId: project.organizationId,
      name: project.name,
      status: project.status,
    };

    next();
  } catch (err) {
    next(err);
  }
}
