import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  port: parseInt(optional("PORT", "5000"), 10),
  nodeEnv: optional("NODE_ENV", "development"),
  clientUrl: optional("CLIENT_URL", "http://localhost:5173"),
  isDevelopment: optional("NODE_ENV", "development") === "development",
  isProduction: optional("NODE_ENV", "development") === "production",
} as const;
