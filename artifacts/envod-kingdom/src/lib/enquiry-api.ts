import type { EnquirySubmissionSchema } from "./enquiry-contract";
import type { z } from "zod";

interface EnquiryApiResponse {
  ok: boolean;
  accepted?: boolean;
  error?: string;
}

function getEnquiryEndpoint(): string {
  const configuredApiRoot = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredApiRoot) {
    const url = new URL(configuredApiRoot, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash ||
      (url.origin !== window.location.origin && url.protocol !== "https:")) {
      throw new Error("The enquiry API must use a secure, credential-free URL.");
    }
    return `${url.href.replace(/\/+$/, "")}/enquiries`;
  }

  const basePath = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${basePath}api/enquiries`;
}

// Hashed keys and opaque IDs only; no form data persisted to browser storage.
const attempts = new Map<string, { id: string; expires: number }>();

export class EnquiryApiError extends Error {
  constructor(message: string, public readonly rateLimited = false) { super(message); }
}

export async function submitEnquiry(
  payload: z.input<typeof EnquirySubmissionSchema>,
): Promise<void> {
  let response: Response;
  let result: EnquiryApiResponse | null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  if (!attempts.has(fingerprint)) {
    if (attempts.size >= 20) attempts.delete(attempts.keys().next().value!);
    attempts.set(fingerprint, { id: crypto.randomUUID(), expires: now + 24 * 60 * 60 * 1000 });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    response = await fetch(getEnquiryEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
      body: JSON.stringify({ ...payload, submissionId: attempts.get(fingerprint)!.id }),
    });
    result = await response.json().catch(() => null);
  } catch {
    throw new Error(
      "We couldn't reach the enquiry service. Please try again or contact us directly.",
    );
  } finally { clearTimeout(timeout); }

  if (response.status !== 201 || result?.ok !== true || result?.accepted !== true) {
    throw new EnquiryApiError(
      result?.error ??
        "Your enquiry could not be sent. Please try again or contact us directly.",
      response.status === 429,
    );
  }
  attempts.delete(fingerprint);
}
