import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/apiResponse";
import {
  calculateProjectSchedule,
  validateProjectSchedule,
} from "../services/scheduling/scheduling.service";

export const schedulingController = {
  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await calculateProjectSchedule(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async getCriticalPath(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await calculateProjectSchedule(req.params.id);
      sendSuccess(res, {
        projectId: schedule.projectId,
        criticalTasks: schedule.criticalTasks,
        criticalPaths: schedule.criticalPaths,
        criticalPathsTruncated: schedule.criticalPathsTruncated,
        calculatedCompletionDate: schedule.calculatedCompletionDate,
        totalDurationDays: schedule.totalDurationDays,
      });
    } catch (error) {
      next(error);
    }
  },

  async validateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await validateProjectSchedule(req.params.id));
    } catch (error) {
      next(error);
    }
  },
};