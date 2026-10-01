import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireProjectAccess } from "../middleware/projectAccess.middleware";
import { requireEntityProjectAccess } from "../middleware/projectEntityAccess.middleware";
import { projectTaskRouter, taskRouter } from "./task.routes";
import stageRouter from "./stage.routes";
import { projectDepRouter, depRouter } from "./dependency.routes";
import resourceRouter from "./resource.routes";
import { stageController } from "../controllers/stage.controller";
import { dependencyController } from "../controllers/dependency.controller";
import { resourceController } from "../controllers/resource.controller";
import { materialController } from "../controllers/material.controller";
import { milestoneController } from "../controllers/milestone.controller";
import { delayController } from "../controllers/delay.controller";
import { riskController } from "../controllers/risk.controller";
import { recoveryController } from "../controllers/recovery.controller";
import { requirementController } from "../controllers/requirement.controller";
import { siteUpdateController } from "../controllers/siteUpdate.controller";
import { notificationController } from "../controllers/notification.controller";
import { activityController } from "../controllers/activity.controller";
import { prisma } from "../config/database";
import { sendSuccess } from "../utils/apiResponse";
import { validateUuidParam } from "../middleware/validate.middleware";

const router = Router();
router.param("projectId", validateUuidParam("projectId"));
router.param("id", validateUuidParam("id"));
router.param("userId", validateUuidParam("userId"));
const projectResource = (controller: Record<string, any>, entity: Parameters<typeof requireEntityProjectAccess>[0]) => {
  const routes = Router({ mergeParams: true });
  routes.param("projectId", validateUuidParam("projectId"));
  routes.param("id", validateUuidParam("id"));
  routes.use(requireAuth, requireProjectAccess);
  routes.get("/", controller.list);
  routes.post("/", requireRole("PROJECT_MANAGER"), controller.create);
  routes.get("/:id", requireEntityProjectAccess(entity), controller.getById);
  routes.put("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess(entity), controller.update);
  routes.delete("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess(entity), controller.delete);
  return routes;
};

const projectReadWriteRoute = (controller: Record<string, any>, entity: Parameters<typeof requireEntityProjectAccess>[0]) => {
  const routes = Router({ mergeParams: true });
  routes.param("projectId", validateUuidParam("projectId"));
  routes.param("id", validateUuidParam("id"));
  routes.use(requireAuth, requireProjectAccess);
  routes.get("/", controller.list);
  routes.post("/", requireRole("PROJECT_MANAGER", "CONSTRUCTION_MANAGER"), controller.create);
  routes.get("/:id", requireEntityProjectAccess(entity), controller.getById);
  routes.put("/:id", requireRole("PROJECT_MANAGER", "CONSTRUCTION_MANAGER"), requireEntityProjectAccess(entity), controller.update);
  routes.delete("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess(entity), controller.delete);
  return routes;
};

router.use("/projects/:projectId/tasks", projectTaskRouter);
router.use("/tasks", taskRouter);
router.use("/projects/:projectId/stages", stageRouter);
router.use("/projects/:projectId/dependencies", projectDepRouter);
router.use("/dependencies", depRouter);
router.use("/projects/:projectId/resources", resourceRouter);
router.use("/projects/:projectId/materials", projectResource(materialController, "material"));
router.use("/projects/:projectId/milestones", projectResource(milestoneController, "milestone"));

import { delayImpactController } from "../controllers/delayImpact.controller";
const delays = Router({ mergeParams: true });
delays.param("projectId", validateUuidParam("projectId"));
delays.param("id", validateUuidParam("id"));
delays.use(requireAuth, requireProjectAccess);
delays.get("/", delayController.list);
delays.post("/", requireRole("PROJECT_MANAGER", "CONSTRUCTION_MANAGER"), delayController.create);
delays.get("/:id/impact", requireEntityProjectAccess("delay"), delayImpactController.getDelayImpact);
delays.get("/:id", requireEntityProjectAccess("delay"), delayController.getById);
delays.patch("/:id", requireRole("PROJECT_MANAGER", "CONSTRUCTION_MANAGER"), requireEntityProjectAccess("delay"), delayController.update);
delays.put("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess("delay"), delayController.update);
router.use("/projects/:projectId/delays", delays);

router.use("/projects/:projectId/risks", projectResource(riskController, "risk"));
router.use("/projects/:projectId/recovery-plans", projectResource(recoveryController, "recoveryPlan"));
const requirements = Router({ mergeParams: true });
requirements.param("projectId", validateUuidParam("projectId"));
requirements.param("id", validateUuidParam("id"));
requirements.use(requireAuth, requireProjectAccess);
requirements.get("/", requirementController.list);
requirements.post("/", requireRole("PROJECT_MANAGER", "CONSTRUCTION_MANAGER"), requirementController.create);
requirements.get("/:id", requireEntityProjectAccess("requirement"), requirementController.getById);
requirements.put("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess("requirement"), requirementController.update);
router.use("/projects/:projectId/requirements", requirements);
router.use("/projects/:projectId/site-updates", projectReadWriteRoute(siteUpdateController, "siteUpdate"));

const notifications = Router();
notifications.param("id", validateUuidParam("id"));
notifications.use(requireAuth);
notifications.get("/", notificationController.list);
notifications.get("/unread-count", notificationController.unreadCount);
notifications.put("/read-all", notificationController.markAllRead);
notifications.put("/:id/read", notificationController.markRead);
router.use("/notifications", notifications);

const projectNotifications = Router({ mergeParams: true });
projectNotifications.param("projectId", validateUuidParam("projectId"));
projectNotifications.use(requireAuth, requireProjectAccess);
projectNotifications.post("/", requireRole("PROJECT_MANAGER"), notificationController.sendToProject);
router.use("/projects/:projectId/notifications", projectNotifications);

const activity = Router({ mergeParams: true });
activity.param("projectId", validateUuidParam("projectId"));
activity.use(requireAuth, requireProjectAccess);
activity.get("/", activityController.listForProject);
router.use("/projects/:projectId/activity", activity);
router.get("/activity", requireAuth, activityController.listForUser);

const userRoutes = Router();
userRoutes.get("/", requireAuth, requireRole("PROJECT_MANAGER"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user.organizationId, isActive: true },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, users);
  } catch (err) { next(err); }
});
router.use("/users", userRoutes);

export default router;