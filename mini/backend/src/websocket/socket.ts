import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { env } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/database";
import { SocketEvents } from "./events";

let io: SocketIOServer;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl.split(",").map((url) => url.trim()),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── Auth handshake ──────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        next(new Error("Authentication required"));
        return;
      }

      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, organizationId: true, role: true, name: true, isActive: true },
      });

      if (!user || !user.isActive) {
        next(new Error("User not found or disabled"));
        return;
      }

      // Attach user data to socket for use in handlers
      (socket as AuthenticatedSocket).user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { user } = socket;

    console.log(`[Socket] ${user.name} (${user.role}) connected — ${socket.id}`);

    // Auto-join user's personal room for targeted notifications
    socket.join(`user:${user.id}`);

    // ── Join a project room ──────────────────────────────────────────────────
    socket.on(SocketEvents.JOIN_PROJECT, async (projectId: string) => {
      try {
        if (!projectId) return;

        // Verify the user actually has access to this project
        const [member, project] = await Promise.all([
          prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: user.id } },
          }),
          prisma.project.findUnique({
            where: { id: projectId },
            select: { clientId: true, projectManagerId: true, organizationId: true },
          }),
        ]);

        if (!project) {
          socket.emit("error", { message: "Project not found" });
          return;
        }

        const hasAccess =
          project.organizationId === user.organizationId &&
          (member !== null ||
            project.clientId === user.id ||
            project.projectManagerId === user.id);

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied to project room" });
          return;
        }

        socket.join(`project:${projectId}`);
        socket.emit("joined:project", { projectId });
        console.log(`[Socket] ${user.name} joined project:${projectId}`);
      } catch (err) {
        console.error("[Socket] join:project error", err);
      }
    });

    // ── Leave a project room ─────────────────────────────────────────────────
    socket.on(SocketEvents.LEAVE_PROJECT, (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`[Socket] ${user.name} left project:${projectId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] ${user.name} disconnected — ${reason}`);
    });
  });

  return io;
}

/** Returns the shared Socket.IO server instance. Throws if not yet initialised. */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO has not been initialised. Call initSocket() first.");
  }
  return io;
}

export function emitScheduleUpdated(projectId: string, reason: string): void {
  getIO().to(`project:${projectId}`).emit(SocketEvents.SCHEDULE_UPDATED, {
    projectId,
    reason,
    changedAt: new Date().toISOString(),
  });
}

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    organizationId: string;
    role: string;
    name: string;
    isActive: boolean;
  };
}
