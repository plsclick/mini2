import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import domainRoutes from "./routes/domain.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.clientUrl.split(",").map((url) => url.trim()), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(morgan(env.isProduction ? "combined" : "dev"));

app.get("/health", (_req, res) => res.status(200).json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", domainRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);