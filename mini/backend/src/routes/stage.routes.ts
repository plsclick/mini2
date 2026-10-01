import { Router } from "express";
import { stageController } from "../controllers/stage.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireProjectAccess } from "../middleware/projectAccess.middleware";
import { requireEntityProjectAccess } from "../middleware/projectEntityAccess.middleware";
import { validateUuidParam } from "../middleware/validate.middleware";

const router = Router({ mergeParams: true });
router.param("projectId", validateUuidParam("projectId"));
router.param("id", validateUuidParam("id"));

router.use(requireAuth, requireProjectAccess);

router.get("/", stageController.list);
router.post("/", requireRole("PROJECT_MANAGER"), stageController.create);
router.get("/:id", requireEntityProjectAccess("stage"), stageController.getById);
router.put("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess("stage"), stageController.update);
router.delete("/:id", requireRole("PROJECT_MANAGER"), requireEntityProjectAccess("stage"), stageController.delete);

export default router;
