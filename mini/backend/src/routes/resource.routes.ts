import { Router } from "express";
import { resourceController } from "../controllers/resource.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireProjectAccess } from "../middleware/projectAccess.middleware";
import { requireEntityProjectAccess } from "../middleware/projectEntityAccess.middleware";
import { validateUuidParam } from "../middleware/validate.middleware";

const router = Router({ mergeParams: true });
router.param("projectId", validateUuidParam("projectId"));
router.param("id", validateUuidParam("id"));
router.use(requireAuth, requireProjectAccess);

router.get("/", resourceController.list);
router.post("/", requireRole("PROJECT_MANAGER"), resourceController.create);
router.get("/:id", requireEntityProjectAccess("resource"), resourceController.getById);
router.put("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess("resource"), resourceController.update);
router.delete("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess("resource"), resourceController.delete);

export default router;
