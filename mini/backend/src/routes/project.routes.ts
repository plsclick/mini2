import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireProjectAccess } from "../middleware/projectAccess.middleware";
import { validateUuidParam } from "../middleware/validate.middleware";
import { schedulingController } from "../controllers/scheduling.controller";

const router = Router();
router.param("id", validateUuidParam("id"));
router.param("userId", validateUuidParam("userId"));

// All routes require authentication
router.use(requireAuth);

// List all accessible projects
router.get("/", projectController.list);

// Create a project — PM only
router.post(
  "/",
  requireRole("PROJECT_MANAGER"),
  projectController.create,
);

import { delayImpactController } from "../controllers/delayImpact.controller";
router.get("/:id/schedule/validate", requireProjectAccess, schedulingController.validateSchedule);
router.get("/:id/schedule/impact", requireProjectAccess, delayImpactController.getProjectImpact);
router.get("/:id/schedule", requireProjectAccess, schedulingController.getSchedule);
router.get("/:id/critical-path", requireProjectAccess, schedulingController.getCriticalPath);
router.get("/:id/dashboard", requireProjectAccess, projectController.dashboard);

// Single project — requires membership
router.get("/:id", requireProjectAccess, projectController.getById);

router.put(
  "/:id",
  requireRole("PROJECT_MANAGER"),
  requireProjectAccess,
  projectController.update,
);

router.delete(
  "/:id",
  requireRole("PROJECT_MANAGER"),
  requireProjectAccess,
  projectController.delete,
);

// Member management
router.post(
  "/:id/members",
  requireRole("PROJECT_MANAGER"),
  requireProjectAccess,
  projectController.addMember,
);

router.delete(
  "/:id/members/:userId",
  requireRole("PROJECT_MANAGER"),
  requireProjectAccess,
  projectController.removeMember,
);

export default router;
