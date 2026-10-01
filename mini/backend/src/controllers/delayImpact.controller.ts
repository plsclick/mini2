import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { delayImpactService } from "../services/delayImpact/delayImpact.service";

export const delayImpactController = {
  async getProjectImpact(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await delayImpactService.getProjectImpact(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async getDelayImpact(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await delayImpactService.getDelayImpact(req.params.projectId, req.params.id));
    } catch (error) {
      next(error);
    }
  },
};
