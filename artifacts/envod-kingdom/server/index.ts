import { createServer as createHttpServer } from "node:http";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import compression from "compression";
import type { ViteDevServer } from "vite";
import { createEnquiryRouter, DEFAULT_SENDER, enquiryApiErrorHandler } from "./enquiries";
import { createSearchConsoleRouter } from "./search-console/router";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const artifactRoot = path.resolve(serverDirectory, "..");
const publicDirectory = path.join(artifactRoot, "dist", "public");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 3000);
const configuredBasePath = (process.env.BASE_PATH ?? "/").trim();
const basePath =
  configuredBasePath === "/" || configuredBasePath === ""
    ? ""
    : `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`;
const apiPrefix = `${basePath}/api`;

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});

const app = express();
app.set("trust proxy", 1);
if (isProduction) app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const allowedOrigins = new Set(
  (process.env.ENQUIRY_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
allowedOrigins.add("https://www.envodkingdom.net");
allowedOrigins.add("https://envodkingdom.net");

app.use(apiPrefix, (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const origin = req.get("origin");
  if (!origin) {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
    return;
  }

  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  if (origin !== requestOrigin && !allowedOrigins.has(origin)) {
    res.status(403).json({ ok: false, error: "This origin is not allowed." });
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Retry-After");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get(`${apiPrefix}/healthz`, (_req, res) => {
  res.json({ status: "ok" });
});

app.use(`${apiPrefix}/enquiries`, createEnquiryRouter({
  sender: process.env.RESEND_FROM_EMAIL ?? DEFAULT_SENDER,
}));

app.use(
  `${apiPrefix}/search-console`,
  createSearchConsoleRouter({ apiPrefix, basePath }),
);

app.use(apiPrefix, enquiryApiErrorHandler);

async function startServer(): Promise<void> {
  const httpServer = createHttpServer(app);
  let vite: ViteDevServer | undefined;

  if (isProduction) {
    app.use(
      basePath || "/",
      express.static(publicDirectory, {
        index: false,
        redirect: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        },
      }),
    );

    app.get(/.*/, (req, res) => {
      const requestPath = basePath
        ? req.path.slice(basePath.length) || "/"
        : req.path;
      const normalizedPath = requestPath.startsWith("/")
        ? requestPath
        : `/${requestPath}`;

      if (
        normalizedPath === "/blog" ||
        normalizedPath.startsWith("/blog/")
      ) {
        res.redirect(301, `${basePath}/gallery`);
        return;
      }

      if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
        res.redirect(
          301,
          `${basePath}${normalizedPath.replace(/\/+$/, "")}`,
        );
        return;
      }

      const routeFile =
        normalizedPath === "/"
          ? path.join(publicDirectory, "index.html")
          : path.resolve(
              publicDirectory,
              `.${normalizedPath}`,
              "index.html",
            );
      const safeFile =
        routeFile === path.join(publicDirectory, "index.html") ||
        routeFile.startsWith(`${publicDirectory}${path.sep}`);

      if (safeFile && existsSync(routeFile)) {
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.sendFile(routeFile);
        return;
      }

      res.status(404);
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(path.join(publicDirectory, "spa.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      configFile: path.join(artifactRoot, "vite.config.ts"),
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    const viteErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
      if (error instanceof Error) vite?.ssrFixStacktrace(error);
      req.log.error({ error }, "Vite request failed");
      if (res.headersSent) {
        next(error);
        return;
      }
      res.status(500).send("Development server error");
    };
    app.use(viteErrorHandler);
  }

  httpServer.listen(port, "0.0.0.0", () => {
    logger.info({ port, isProduction }, "ENVOD KINGDOM server started");
  });

  const shutdown = async () => {
    await vite?.close();
    httpServer.close(() => {
      logger.info("ENVOD KINGDOM server stopped");
      process.exit(0);
    });
  };
  process.once("SIGTERM", () => void shutdown());
  process.once("SIGINT", () => void shutdown());
}

void startServer().catch((error: unknown) => {
  logger.error(
    { error: error instanceof Error ? error.message : "unknown error" },
    "ENVOD KINGDOM server failed to start",
  );
  process.exitCode = 1;
});
