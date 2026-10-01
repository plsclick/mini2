import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireProjectAccess } from "../middleware/projectAccess.middleware";
import { requireEntityProjectAccess } from "../middleware/projectEntityAccess.middleware";
import { validateUuidParam } from "../middleware/validate.middleware";

// Mounted at /api/projects/:projectId/tasks
const projectTaskRouter = Router({ mergeParams: true });
projectTaskRouter.param("projectId", validateUuidParam("projectId"));
projectTaskRouter.use(requireAuth, requireProjectAccess);
projectTaskRouter.get("/", taskController.list);
projectTaskRouter.post(
  "/",
  requireRole("PROJECT_MANAGER"),
  taskController.create,
);

// Mounted at /api/tasks
const taskRouter = Router();
taskRouter.param("id", validateUuidParam("id"));
taskRouter.use(requireAuth);
taskRouter.get("/:id", requireEntityProjectAccess("task"), taskController.getById);
taskRouter.put(
  "/:id",
  requireRole("PROJECT_MANAGER", "CONSTRUCTION_MANAGER"),
  requireEntityProjectAccess("task"),
  taskController.update,
);
taskRouter.delete(
  "/:id",
  requireRole("PROJECT_MANAGER"),
  requireEntityProjectAccess("task"),
  taskController.delete,
);

export { projectTaskRouter, taskRouter };
