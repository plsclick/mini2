import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from "../validators/auth.validator";
import { sendSuccess, sendCreated } from "../utils/apiResponse";
import { NotFoundError } from "../utils/errors";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = RegisterSchema.parse(req.body);
      const result = await authService.register(input);
      sendCreated(res, result);
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = LoginSchema.parse(req.body);
      const result = await authService.login(input);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user.id);
      if (!user) throw new NotFoundError("User");
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.user.id, input);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // JWT is stateless; client discards the token.
      // Extend here in Phase 2 with a token denylist if needed.
      sendSuccess(res, { message: "Logged out successfully" });
    } catch (err) { next(err); }
  },
};
