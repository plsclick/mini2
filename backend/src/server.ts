import { createServer } from "http";
import { app } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { initSocket } from "./websocket/socket";

async function start(): Promise<void> {
  await connectDatabase();
  const server = createServer(app);
  initSocket(server);
  server.listen(env.port, () => console.log(`BUILD//PULSE API listening on port ${env.port}`));

  const shutdown = (signal: string) => {
    console.log(`${signal} received; shutting down`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error: unknown) => {
  console.error("Failed to start API", error);
  process.exitCode = 1;
});