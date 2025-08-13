import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import defaultHook from "stoker/openapi/default-hook";
import notFound from "stoker/middlewares/not-found";
import onError from "stoker/middlewares/on-error";
import serveEmojiFavicon from "stoker/middlewares/serve-emoji-favicon";

import type { AppBindings, AppOpenAPI } from "@/lib/types";
import { auth } from "@/auth";
import { pinoLogger } from "@/middleware/pino-logger";

export function createRouter(): AppOpenAPI {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export function createApp(): AppOpenAPI {
  const app = createRouter();

  app.use(serveEmojiFavicon("🔥"));
  app.use(pinoLogger());

  // CORS configuration for Better-Auth
  app.use(
    "/api/auth/*",
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  );

  // Session middleware
  app.use("*", async (c, next) => {
    const sessionData = await auth.api.getSession({ 
      headers: c.req.raw.headers 
    });

    if (!sessionData) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", sessionData.user);
    c.set("session", sessionData.session);
    return next();
  });

  // Better-Auth routes
  app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

  app.notFound(notFound);
  app.onError(onError);

  return app;
}