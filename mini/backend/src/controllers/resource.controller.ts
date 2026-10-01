import { Request, Response, NextFunction } from "express";
import { resourceService } from "../services/resource.service";
import { z } from "zod";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";

const ResourceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["WORKFORCE", "EQUIPMENT", "SUBCONTRACTOR", "OTHER"]),
  quantity: z.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  cost: z.number().min(0).optional(),
});

export const resourceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await resourceService.listForProject(req.params.projectId);
      sendSuccess(res, resources);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await resourceService.getById(req.params.id);
      sendSuccess(res, r);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ResourceSchema.parse(req.body);
      const r = await resourceService.create(req.params.projectId, input);
      sendCreated(res, r);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ResourceSchema.partial().parse(req.body);
      const r = await resourceService.update(req.params.id, input);
      sendSuccess(res, r);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resourceService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
