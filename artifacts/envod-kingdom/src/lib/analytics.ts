import { track } from "@vercel/analytics";

export type SiteAnalyticsEvent =
  | "call_click"
  | "whatsapp_click"
  | "email_click"
  | "service_cta_click"
  | "quote_form_start"
  | "quote_form_submit_success"
  | "quote_form_submit_failure"
  | "contact_form_start"
  | "contact_form_submit_success"
  | "contact_form_submit_failure";

export interface SiteAnalyticsPayload {
  page_path?: string;
  service_category?: string;
  language?: "en" | "ar";
  cta_location?: string;
}

/**
 * Send privacy-safe conversion events through Vercel Web Analytics.
 * Form contents and customer identifiers are never included. Analytics
 * failures must not affect the user flow.
 */
export function emitAnalyticsEvent(
  event: SiteAnalyticsEvent,
  payload: SiteAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const properties = Object.fromEntries(
      Object.entries(payload).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
    track(event, properties);
  } catch {
    // Analytics must never break form submission or navigation.
  }
}
