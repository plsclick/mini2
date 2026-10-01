import { Request, Response, NextFunction } from "express";
import { stageService } from "../services/stage.service";
import { activityService } from "../services/activity.service";
import { CreateStageSchema, UpdateStageSchema } from "../validators/stage.validator";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getIO } from "../websocket/socket";

export const stageController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const stages = await stageService.listForProject(req.params.projectId);
      sendSuccess(res, stages);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const stage = await stageService.getById(req.params.id);
      sendSuccess(res, stage);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateStageSchema.parse(req.body);
      const stage = await stageService.create(req.params.projectId, input);
      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "STAGE_CREATED",
        entityType: "Stage",
        entityId: stage.id,
        description: `Stage "${stage.name}" was created`,
      });
      sendCreated(res, stage);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateStageSchema.parse(req.body);
      const stage = await stageService.update(req.params.id, input);
      getIO().to(`project:${stage.projectId}`).emit("project:updated", { stage });
      sendSuccess(res, stage);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await stageService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
