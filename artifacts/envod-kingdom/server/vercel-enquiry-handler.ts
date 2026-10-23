import { EnquirySubmissionSchema } from "../src/lib/enquiry-contract.js";
import {
  buildEnquiryEmail,
  buildEnquiryIdempotencyKey,
  DEFAULT_SENDER,
  type EnquiryEmail,
} from "./enquiry-message.js";

const MAX_BODY_BYTES = 20 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const PROVIDER_TIMEOUT_MS = 8_000;
const TRUSTED_FIXED_ORIGINS = new Set([
  "https://envodkingdom.net",
  "https://www.envodkingdom.net",
]);

type SendEmail = (
  email: EnquiryEmail,
  idempotencyKey: string,
  signal: AbortSignal,
) => Promise<Response>;

interface HandlerOptions {
  sendEmail?: SendEmail;
  getApiKey?: () => string | undefined;
  sender?: string;
  now?: () => number;
  maxBuckets?: number;
}

interface RateBucket {
  count: number;
  expiresAt: number;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  extraHeaders: HeadersInit = {},
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function trustedOrigin(request: Request): string | undefined {
  const origin = request.headers.get("origin");
  if (!origin) return;

  try {
    const parsed = new URL(origin);
    const requestOrigin = new URL(request.url).origin;
    if (
      parsed.origin === origin &&
      (origin === requestOrigin || TRUSTED_FIXED_ORIGINS.has(origin))
    ) {
      return origin;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function clientAddress(request: Request): string {
  // Vercel appends the connecting client address to this platform header.
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return forwarded?.at(-1) ?? "unknown";
}

async function readBoundedJson(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new RangeError("body_too_large");
  }

  if (!request.body) throw new SyntaxError("empty_body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("body_too_large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

function createResendSender(getApiKey: () => string | undefined): SendEmail {
  return async (email, idempotencyKey, signal) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("email_provider_not_configured");

    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(email),
      signal,
    });
  };
}

/**
 * The in-memory limiter is intentionally conservative and stores no customer
 * content. Vercel may create multiple function instances, so this is best-effort
 * per warm instance; provider idempotency and the form honeypot are additional
 * protections, not a substitute for a shared distributed rate-limit store.
 */
export function createVercelEnquiryHandler(options: HandlerOptions = {}) {
  const now = options.now ?? Date.now;
  const sender = options.sender ?? process.env.RESEND_FROM_EMAIL ?? DEFAULT_SENDER;
  const getApiKey = options.getApiKey ?? (() => process.env.RESEND_API_KEY);
  const sendEmail = options.sendEmail ?? createResendSender(getApiKey);
  const buckets = new Map<string, RateBucket>();
  const receivedTimes = new Map<string, number>();
  let nextCleanup = 0;

  return async function handleEnquiry(request: Request): Promise<Response> {
    const origin = trustedOrigin(request);
    if (!origin) {
      return jsonResponse(
        { ok: false, error: "This request could not be accepted. Please use the website form." },
        403,
      );
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Use POST to submit an enquiry." },
        405,
        { ...corsHeaders, Allow: "POST, OPTIONS" },
      );
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return jsonResponse(
        { ok: false, error: "Submit the form using JSON." },
        415,
        corsHeaders,
      );
    }

    const time = now();
    if (time >= nextCleanup) {
      for (const [key, bucket] of buckets) {
        if (bucket.expiresAt <= time) buckets.delete(key);
      }
      for (const [key, receivedAt] of receivedTimes) {
        if (time - receivedAt >= 24 * 60 * 60 * 1000) receivedTimes.delete(key);
      }
      nextCleanup = time + 60_000;
    }

    const address = clientAddress(request);
    let bucket = buckets.get(address);
    if (!bucket || bucket.expiresAt <= time) {
      if (buckets.size >= (options.maxBuckets ?? 10_000) && !bucket) {
        return jsonResponse(
          { ok: false, error: "Please retry later or contact us directly." },
          429,
          { ...corsHeaders, "Retry-After": "60" },
        );
      }
      bucket = { count: 0, expiresAt: time + RATE_WINDOW_MS };
      buckets.set(address, bucket);
    }
    if (bucket.count >= MAX_ATTEMPTS_PER_WINDOW) {
      return jsonResponse(
        { ok: false, error: "Too many attempts. Please wait and try again or contact us directly." },
        429,
        {
          ...corsHeaders,
          "Retry-After": String(Math.max(1, Math.ceil((bucket.expiresAt - time) / 1000))),
        },
      );
    }
    bucket.count++;

    let body: unknown;
    try {
      body = await readBoundedJson(request);
    } catch (error) {
      const tooLarge = error instanceof RangeError;
      return jsonResponse(
        {
          ok: false,
          error: tooLarge
            ? "The request is too large. Shorten the message and try again."
            : "The request could not be processed. Check the form and try again.",
        },
        tooLarge ? 413 : 400,
        corsHeaders,
      );
    }

    if (
      body &&
      typeof body === "object" &&
      "website" in body &&
      typeof body.website === "string" &&
      body.website.trim()
    ) {
      return jsonResponse(
        {
          ok: false,
          accepted: false,
          error: "Unable to accept this request. Please contact us directly.",
        },
        202,
        corsHeaders,
      );
    }

    const parsed = EnquirySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        {
          ok: false,
          error: "Please check the required fields and privacy notice.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        400,
        corsHeaders,
      );
    }

    const idempotencyKey = buildEnquiryIdempotencyKey(parsed.data, sender);
    if (!options.sendEmail && !getApiKey()) {
      return jsonResponse(
        {
          ok: false,
          error: "Email delivery is not configured yet. Please contact us directly.",
        },
        503,
        corsHeaders,
      );
    }

    const receivedAt = receivedTimes.get(idempotencyKey) ?? time;
    receivedTimes.set(idempotencyKey, receivedAt);
    const email = buildEnquiryEmail(parsed.data, sender, receivedAt);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

    try {
      const providerResponse = await sendEmail(email, idempotencyKey, controller.signal);
      const providerBody: unknown = await providerResponse.json().catch(() => null);
      const providerId =
        providerBody &&
        typeof providerBody === "object" &&
        "id" in providerBody
          ? providerBody.id
          : undefined;

      if (
        !providerResponse.ok ||
        typeof providerId !== "string" ||
        !/^[a-zA-Z0-9_-]{1,200}$/.test(providerId)
      ) {
        console.warn("Enquiry email acceptance was not confirmed", {
          providerStatus: providerResponse.status,
        });
        return jsonResponse(
          {
            ok: false,
            error: "Email acceptance could not be confirmed. Please retry or contact us directly.",
          },
          providerResponse.status === 429 ? 503 : 502,
          {
            ...corsHeaders,
            ...(providerResponse.status === 429 ? { "Retry-After": "60" } : {}),
          },
        );
      }

      console.info("Enquiry accepted by email provider", {
        formType: parsed.data.formType,
        providerMessageId: providerId,
      });
      return jsonResponse({ ok: true, accepted: true }, 201, corsHeaders);
    } catch {
      // Do not log provider errors, credentials, request content or customer PII.
      console.error("Enquiry email provider request failed or timed out");
      return jsonResponse(
        {
          ok: false,
          error: "Email acceptance could not be confirmed. Please retry or contact us directly.",
        },
        503,
        corsHeaders,
      );
    } finally {
      clearTimeout(timer);
    }
  };
}
