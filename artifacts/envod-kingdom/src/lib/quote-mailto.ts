export const CONTACT_EMAIL = "info@envodkingdom.net";
export const CONTACT_WHATSAPP = "+966 50 226 0256";

export interface QuoteField {
  label: string;
  value: string;
}

const MAX_URL_LENGTH = 1900;

/**
 * Build a professionally formatted `mailto:` URL for a quote request.
 * Empty fields are omitted; the body is defensively truncated so the
 * final URL stays within safe mail-client limits (Arabic text expands
 * heavily under percent-encoding).
 */
export function buildQuoteMailto(fields: QuoteField[]): string {
  const lines = fields
    .filter((f) => f.value.trim())
    .map((f) => `${f.label}: ${f.value.trim()}`);

  let body = [
    "Dear ENVOD KINGDOM Team,",
    "",
    "I would like to request a quote. Please find my details below:",
    "",
    ...lines,
    "",
    "Please get back to me with a quotation and any additional details required.",
    "",
    "Best regards,",
  ].join("\r\n");

  const make = (b: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quote Request")}&body=${encodeURIComponent(b)}`;

  let url = make(body);
  while (url.length > MAX_URL_LENGTH && body.length > 200) {
    body = body.slice(0, body.length - 100);
    url = make(body);
  }
  return url;
}
