/// <reference types="express" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { Router, type Request, type RequestHandler, type Response } from "express";
import type {} from "pino-http";
import { z } from "zod";
import { getAdminSession } from "../search-console/security.js";
import { isTrustedMutationOrigin } from "../search-console/router.js";
import { DataForSeoError } from "./client.js";
import {
  BudgetExceededError,
  ConflictError,
  DataForSeoService,
  LABS_OPERATIONS,
  type LabsOperationId,
} from "./service.js";
import { LocalFileJsonStore, VercelBlobJsonStore, type JsonStore } from "./store.js";

type Environment = NodeJS.ProcessEnv;

export interface DataForSeoRouterOptions {
  env?: Environment;
  fetchImpl?: typeof fetch;
  now?: () => number;
  store?: JsonStore | null;
}

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

/** Private Blob in production; git-ignored local directory in development. Never the Vercel filesystem. */
export function defaultDataForSeoStore(env: Environment): JsonStore | null {
  const blobToken = env.BLOB_READ_WRITE_TOKEN?.trim();
  if (blobToken) return new VercelBlobJsonStore(blobToken);
  if (env.VERCEL === "1") return null;
  return new LocalFileJsonStore(path.resolve(moduleDirectory, "..", "..", ".private-data", "dataforseo"));
}

function sendError(res: Response, status: number, message: string, extra: Record<string, unknown> = {}): void {
  res.status(status).json({ ok: false, error: message, ...extra });
}

function rateLimiter(limit: number, windowMs: number, now: () => number): RequestHandler {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (req, res, next) => {
    const time = now();
    const key = req.ip ?? "unknown";
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= time) {
      if (buckets.size > 2000) buckets.clear();
      bucket = { count: 0, resetAt: time + windowMs };
      buckets.set(key, bucket);
    }
    if (bucket.count >= limit) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - time) / 1000))));
      sendError(res, 429, "Too many DataForSEO dashboard requests. Please wait and retry.");
      return;
    }
    bucket.count += 1;
    next();
  };
}

const runSchema = z.object({
  operation: z.enum(LABS_OPERATIONS as [LabsOperationId, ...LabsOperationId[]]),
  params: z.unknown().default({}),
  refresh: z.boolean().default(false),
  confirm: z.literal(true),
});

const estimateSchema = z.object({
  operation: z.union([z.enum(LABS_OPERATIONS as [LabsOperationId, ...LabsOperationId[]]), z.literal("rank_check")]),
  params: z.unknown().default({}),
});

export function createDataForSeoRouter(options: DataForSeoRouterOptions = {}): Router {
  const env = options.env ?? process.env;
  const now = options.now ?? Date.now;
  const router = Router();
  let service: DataForSeoService | null = null;
  const getService = () => {
    service ??= new DataForSeoService({
      env,
      fetchImpl: options.fetchImpl,
      now,
      store: options.store === undefined ? defaultDataForSeoStore(env) : options.store,
    });
    return service;
  };

  const requireAdmin: RequestHandler = (req, res, next) => {
    const secret = env.SESSION_SECRET?.trim();
    const session = getAdminSession(
      req,
      secret && secret.length >= 32 ? secret : undefined,
      env.GSC_ADMIN_EMAIL?.trim().toLowerCase(),
      now(),
    );
    if (!session) {
      sendError(res, 401, "Sign in with the authorized ENVOD administrator account to continue.");
      return;
    }
    res.locals.adminEmail = session.email;
    next();
  };

  const requireSameOrigin: RequestHandler = (req, res, next) => {
    if (!isTrustedMutationOrigin(req, env)) {
      sendError(res, 403, "This request must come from the ENVOD KINGDOM site.");
      return;
    }
    next();
  };

  const handle =
    (work: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
    async (req, res) => {
      try {
        const body = await work(req, res);
        if (!res.headersSent) res.json(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          sendError(res, 400, "The request is invalid.", {
            issues: error.issues.slice(0, 5).map((issue) => `${issue.path.join(".") || "request"}: ${issue.message}`),
          });
          return;
        }
        if (error instanceof BudgetExceededError) {
          sendError(
            res,
            402,
            `This request is estimated at $${error.estimate.estimatedUsd.toFixed(4)}, which exceeds the remaining monthly DataForSEO budget of $${error.estimate.budget.remainingUsd.toFixed(4)}.`,
            { estimate: error.estimate },
          );
          return;
        }
        if (error instanceof ConflictError) {
          sendError(res, 409, error.message);
          return;
        }
        if (error instanceof DataForSeoError) {
          const status =
            error.kind === "not_configured" ? 503
            : error.kind === "payment" ? 402
            : error.kind === "rate_limit" ? 429
            : error.kind === "invalid_request" ? 400
            : error.kind === "timeout" || error.kind === "network" ? 504
            : 502;
          sendError(res, status, error.message, { providerCode: error.statusCode, kind: error.kind });
          return;
        }
        req.log?.error({ route: req.path }, "DataForSEO dashboard route failed");
        sendError(res, 500, "The DataForSEO request could not be completed.");
      }
    };

  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });
  router.use(express.json({ limit: "64kb", strict: true }));
  router.use(requireAdmin);
  router.use(rateLimiter(240, 5 * 60_000, now));

  const paidLimiter = rateLimiter(60, 5 * 60_000, now);

  router.get("/status", handle(async (req) => getService().status(req.query.refresh === "1")));
  router.get("/usage", handle(async () => getService().usage()));
  router.get("/config", handle(async () => getService().trackingConfig()));
  router.put("/config", requireSameOrigin, handle(async (req) => getService().saveTrackingConfig(req.body)));
  router.get("/locations", handle(async (req) => getService().locations(req.query.refresh === "1")));
  router.get("/rank-history", handle(async () => getService().rankHistory()));

  router.post(
    "/estimate",
    requireSameOrigin,
    handle(async (req) => {
      const parsed = estimateSchema.parse(req.body);
      if (parsed.operation === "rank_check") return getService().estimateRankCheck(parsed.params);
      return getService().estimateOperation(parsed.operation, parsed.params);
    }),
  );

  router.post(
    "/run",
    requireSameOrigin,
    paidLimiter,
    handle(async (req) => {
      const parsed = runSchema.parse(req.body);
      return getService().runOperation(parsed.operation, parsed.params, parsed.refresh);
    }),
  );

  router.post(
    "/rank-check/start",
    requireSameOrigin,
    paidLimiter,
    handle(async (req) => {
      const body = z.object({ confirm: z.literal(true) }).passthrough().parse(req.body);
      return getService().startRankCheck(body);
    }),
  );

  router.post(
    "/rank-check/:runId/continue",
    requireSameOrigin,
    paidLimiter,
    handle(async (req) => getService().continueRankCheck(String(req.params.runId))),
  );

  router.use((_req, res) => sendError(res, 404, "Unknown DataForSEO dashboard route."));
  return router;
}
