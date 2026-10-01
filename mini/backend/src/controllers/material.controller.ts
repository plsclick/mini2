import { Request, Response, NextFunction } from "express";
import { materialService } from "../services/material.service";
import { z } from "zod";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";

const MaterialSchema = z.object({
  name: z.string().min(1).max(200),
  quantityRequired: z.number().min(0).optional(),
  quantityAvailable: z.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  status: z.enum(["REQUIRED","ORDERED","IN_TRANSIT","AVAILABLE","DELAYED","CANCELLED"]).optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  supplier: z.string().max(200).optional(),
});

export const materialController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const materials = await materialService.listForProject(req.params.projectId);
      sendSuccess(res, materials);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const m = await materialService.getById(req.params.id);
      sendSuccess(res, m);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = MaterialSchema.parse(req.body);
      const m = await materialService.create(req.params.projectId, input);
      sendCreated(res, m);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = MaterialSchema.partial().parse(req.body);
      const m = await materialService.update(req.params.id, input);
      sendSuccess(res, m);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await materialService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
