import { serve } from "@hono/node-server";

import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import indexRouter from "@/routes/index.routes";
import tasksRouter from "@/routes/tasks/tasks.index";

const app = createApp();

// API routes
const routes = [
  indexRouter,
  tasksRouter,
] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

// Configure OpenAPI documentation
configureOpenAPI(app);

const port = Number(process.env.PORT) || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});