import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "password",
    database: process.env.DATABASE_NAME || "hono_workplan",
    ssl: process.env.DATABASE_SSL === "true",
  },
});