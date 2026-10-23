import { createHash, randomUUID } from "node:crypto";
import type { EnquirySubmission } from "../src/lib/enquiry-contract";
import { renderEnquiryEmail } from "./enquiry-email";

// Recipient changes require explicit business authorization, not public input.
export const ENQUIRY_RECIPIENT = "info@envodkingdom.net";
export const DEFAULT_SENDER = "ENVOD KINGDOM Website <info@envodkingdom.net>";

export interface EnquiryEmail {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
  html: string;
  tags: Array<{ name: string; value: string }>;
}

export function buildEnquiryEmail(
  enquiry: EnquirySubmission,
  sender: string,
  receivedAt: number,
): EnquiryEmail {
  return {
    from: sender,
    to: [ENQUIRY_RECIPIENT],
    reply_to: enquiry.email,
    ...renderEnquiryEmail(enquiry, receivedAt),
    tags: [
      { name: "source", value: "website" },
      { name: "form_type", value: enquiry.formType },
    ],
  };
}

export function buildEnquiryIdempotencyKey(
  enquiry: EnquirySubmission,
  sender: string,
): string {
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        template: "enquiry-v2",
        sender,
        data: enquiry,
      }),
    )
    .digest("hex");

  return `envod-${enquiry.submissionId ?? randomUUID()}-${fingerprint}`;
}
