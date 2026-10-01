import { prisma } from "../config/database";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ConflictError, UnauthorizedError } from "../utils/errors";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) throw new ConflictError("Email already registered");

    const passwordHash = await hashPassword(input.password);
    const orgName = input.organizationName ?? `${input.name}'s Organization`;
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: "CLIENT",
        organization: { create: { name: orgName } },
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    const token = signToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        organization: { select: { id: true, name: true } },
      },
    });
    return user;
  },
};
