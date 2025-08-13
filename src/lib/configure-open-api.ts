import { Scalar } from "@scalar/hono-api-reference";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.1.0",
    info: {
      version: packageJSON.version,
      title: "Tasks API",
    },
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    })
  );

  app.get(
    "/llms",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    })
  );

  app.get("/llms.txt", async (c: any) => {
    try {
      const content = app.getOpenAPI31Document({
        openapi: "3.1.0",
        info: {
          title: packageJSON.name || "Tasks API",
          version: packageJSON.version,
        },
      });

      const markdown = await createMarkdownFromOpenApi(JSON.stringify(content));

      return c.text(markdown, 200, {
        "Content-Type": "text/plain; charset=utf-8",
      });
    }
    catch (error) {
      console.error("Error generating markdown:", error);
      return c.text("Error generating API documentation", 500);
    }
  });
}