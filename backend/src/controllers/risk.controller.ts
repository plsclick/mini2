import { Request, Response, NextFunction } from "express";
import { riskService } from "../services/risk.service";
import { activityService } from "../services/activity.service";
import { z } from "zod";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getIO } from "../websocket/socket";

const RiskSchema = z.object({
  taskId: z.string().uuid().optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  probability: z.number().min(0).max(1).optional(),
  impact: z.number().min(0).max(1).optional(),
  severity: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  mitigation: z.string().max(2000).optional(),
  status: z.enum(["OPEN","MONITORING","MITIGATED","CLOSED"]).optional(),
});

export const riskController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const risks = await riskService.listForProject(req.params.projectId);
      sendSuccess(res, risks);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await riskService.getById(req.params.id);
      sendSuccess(res, r);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = RiskSchema.parse(req.body);
      const r = await riskService.create(req.params.projectId, req.user.id, input);
      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "RISK_CREATED",
        entityType: "Risk",
        entityId: r.id,
        description: `Risk "${r.title}" was identified`,
      });
      sendCreated(res, r);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = RiskSchema.partial().parse(req.body);
      const r = await riskService.update(req.params.id, input);
      getIO().to(`project:${r.projectId}`).emit("risk:updated", r);
      sendSuccess(res, r);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await riskService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
