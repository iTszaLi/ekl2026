import { Router, json, type RequestHandler, type ErrorRequestHandler } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { EnquirySubmissionSchema } from "../src/lib/enquiry-contract";
import {
  buildEnquiryEmail,
  buildEnquiryIdempotencyKey,
  DEFAULT_SENDER,
  type EnquiryEmail,
} from "./enquiry-message";

export { DEFAULT_SENDER, ENQUIRY_RECIPIENT } from "./enquiry-message";
type Submission = ReturnType<typeof EnquirySubmissionSchema.parse>;
type SendEmail = (email: EnquiryEmail, key: string, signal: AbortSignal) => Promise<Response>;
interface Options {
  sender?: string;
  sendEmail?: SendEmail;
  timeoutMs?: number;
  now?: () => number;
  maxBuckets?: number;
}

const resend: SendEmail = async (email, key, _signal) => {
  const connectors = new ReplitConnectors();
  return connectors.proxy("resend", "/emails", {
    // This SDK does not expose AbortSignal. The handler still bounds its wait;
    // stable provider idempotency keys protect retries after an uncertain result.
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(email),
  });
};

/** Dependency injection is for isolated tests, never a public/runtime mock switch. */
export function createEnquiryRouter(options: Options = {}) {
  const router = Router();
  const sendEmail = options.sendEmail ?? resend;
  const sender = options.sender ?? DEFAULT_SENDER;
  const now = options.now ?? Date.now;
  const buckets = new Map<string, { count: number; expiresAt: number }>();
  // Metadata only (no customer content). Keep the rendered timestamp identical
  // across retries so Resend sees the same payload for the same idempotency key.
  const receivedTimes = new Map<string, number>();
  const windowMs = 15 * 60 * 1000;
  let nextCleanup = 0;

  const rateLimit: RequestHandler = (req, res, next) => {
    const time = now();
    if (time >= nextCleanup) {
      for (const [key, value] of buckets) if (value.expiresAt <= time) buckets.delete(key);
      nextCleanup = time + 60_000;
    }
    const key = req.ip ?? "unknown";
    let bucket = buckets.get(key);
    if (!bucket || bucket.expiresAt <= time) {
      if (buckets.size >= (options.maxBuckets ?? 10_000) && !bucket) {
        res.setHeader("Retry-After", "60");
        res.status(429).json({ ok: false, error: "Please wait and try again or contact us directly." });
        return;
      }
      bucket = { count: 0, expiresAt: time + windowMs };
      buckets.set(key, bucket);
    }
    if (bucket.count >= 5) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.expiresAt - time) / 1000))));
      res.status(429).json({ ok: false, error: "Too many attempts. Please wait and try again or contact us directly." });
      return;
    }
    bucket.count++;
    next();
  };

  router.post("/", rateLimit, (req, res, next) => {
    if (!req.is("application/json")) {
      res.status(415).json({ ok: false, error: "Submit the form using JSON." });
      return;
    }
    next();
  }, json({ limit: "20kb", strict: true }), async (req, res) => {
    if (typeof req.body?.website === "string" && req.body.website.trim()) {
      // Drop spam without claiming provider acceptance, delivery or consent.
      res.status(202).json({ ok: false, accepted: false, error: "Unable to accept this request. Please contact us directly." });
      return;
    }
    const parsed = EnquirySubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Please check the required fields and privacy notice.",
        fieldErrors: parsed.error.flatten().fieldErrors });
      return;
    }
    const key = buildEnquiryIdempotencyKey(parsed.data, sender);
    const time = now();
    for (const [id, received] of receivedTimes) {
      if (time - received >= 24 * 60 * 60 * 1000) receivedTimes.delete(id);
    }
    if (!receivedTimes.has(key) && receivedTimes.size >= 10_000) {
      res.setHeader("Retry-After", "60");
      res.status(503).json({ ok: false, error: "Please retry later or contact us directly." });
      return;
    }
    const receivedAt = receivedTimes.get(key) ?? time;
    receivedTimes.set(key, receivedAt);
    const email = buildEnquiryEmail(parsed.data, sender, receivedAt);
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const operation = (async () => {
        const response = await sendEmail(email, key, controller.signal);
        const body: unknown = await response.json().catch(() => null);
        return { response, body };
      })();
      const { response, body } = await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error("provider_timeout")); }, options.timeoutMs ?? 15_000);
        }),
      ]);
      const id = body && typeof body === "object" && "id" in body ? body.id : undefined;
      if (!response.ok || typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(id)) {
        req.log?.warn({ providerStatus: response.status }, "Enquiry acceptance not confirmed");
        if (response.status === 429) res.setHeader("Retry-After", "60");
        res.status(response.status === 429 ? 503 : 502).json({
          ok: false, error: "Email acceptance could not be confirmed. Please retry or contact us directly.",
        });
        return;
      }
      req.log?.info({ formType: parsed.data.formType, providerMessageId: id }, "Enquiry accepted by email provider");
      res.status(201).json({ ok: true, accepted: true });
    } catch {
      // Do not log SDK error text, credentials, request content or customer PII.
      req.log?.error("Enquiry provider request failed or timed out");
      res.status(503).json({ ok: false, error: "Email acceptance could not be confirmed. Please retry or contact us directly." });
    } finally {
      if (timer) clearTimeout(timer);
    }
  });
  router.all("/", (_req, res) => {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ ok: false, error: "Use POST to submit an enquiry." });
  });
  return router;
}

export const enquiryApiErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const type = (error as { type?: string }).type;
  const status = type === "entity.too.large" ? 413 : type === "entity.parse.failed" ? 400 : 500;
  res.status(status).json({ ok: false, error: status === 413
    ? "The request is too large. Shorten the message and try again."
    : "The request could not be processed. Please check the form and try again." });
};
