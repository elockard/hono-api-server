import { z } from "@hono/zod-openapi";

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "invalid_updates",
} as const;

export const ZOD_ERROR_MESSAGES = {
  NO_UPDATES: "No updates provided",
} as const;

export const notFoundSchema = z.object({
  message: z.string(),
});