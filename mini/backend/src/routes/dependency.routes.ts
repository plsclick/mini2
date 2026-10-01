import { Router } from "express";
import { dependencyController } from "../controllers/dependency.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireProjectAccess } from "../middleware/projectAccess.middleware";
import { requireEntityProjectAccess } from "../middleware/projectEntityAccess.middleware";
import { validateUuidParam } from "../middleware/validate.middleware";

// Mounted at /api/projects/:projectId/dependencies
const projectDepRouter = Router({ mergeParams: true });
projectDepRouter.param("projectId", validateUuidParam("projectId"));
projectDepRouter.use(requireAuth, requireProjectAccess);
projectDepRouter.get("/", dependencyController.list);
projectDepRouter.post(
  "/",
  requireRole("PROJECT_MANAGER"),
  dependencyController.create,
);

// Mounted at /api/dependencies
const depRouter = Router();
depRouter.param("id", validateUuidParam("id"));
depRouter.use(requireAuth);
depRouter.delete(
  "/:id",
  requireRole("PROJECT_MANAGER"),
  requireEntityProjectAccess("taskDependency"),
  dependencyController.delete,
);

export { projectDepRouter, depRouter };
