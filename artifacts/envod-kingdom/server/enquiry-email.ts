import type { EnquirySubmission } from "../src/lib/enquiry-contract.js";
import { formatServiceRequirementValue, getEnquiryServiceByValue, getServiceRequirementLabel } from "../src/lib/enquiry-services.js";

const escape = (value: string) => value.replace(/[&<>"']/g, (character) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
const cleanSubject = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();

type Field = {
  label: string;
  value: string;
  href?: string;
  whatsapp?: string;
  strong?: boolean;
  wide?: boolean;
  htmlValue?: string;
};
type Section = { title: string; fields: Field[] };

// Only link internationally formatted numbers. Do not guess a country or imply
// that a WhatsApp account exists. Suppress obvious demo and reserved NANP fixtures.
export function contactLinks(phone: string, isTest = false) {
  if (!/^(?:\+|00)[\d ()-]+$/.test(phone.trim())) return {};
  const digits = phone.trim().replace(/^00/, "+").replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(digits)) return {};
  const national = digits.startsWith("1") && digits.length === 11 ? digits.slice(1) : "";
  const reservedNanpFixture = national.length === 10 && national.slice(3, 6) === "555" &&
    Number(national.slice(6)) >= 100 && Number(national.slice(6)) <= 199;
  const obviousFixture = /^(?:0+|1+|12345678|1234567890)$/.test(digits) || /(\d)\1{6,}/.test(digits);
  if (reservedNanpFixture || obviousFixture || isTest) return {};
  return { href: `tel:+${digits}`, whatsapp: `https://wa.me/${digits}` };
}

/** Preserve the mailto address separator while safely encoding unusual local parts. */
export function mailtoHref(email: string, subject?: string) {
  const at = email.lastIndexOf("@");
  const address = at > 0
    ? `${encodeURIComponent(email.slice(0, at))}@${email.slice(at + 1).split(".").map(encodeURIComponent).join(".")}`
    : encodeURIComponent(email);
  return `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}

function renderCard({ label, value, href, whatsapp, strong, htmlValue }: Field): string {
  const escapedValue = escape(value).replace(/\r\n?|\n/g, "<br>");
  const content = htmlValue ?? (href
    ? `<a href="${escape(href)}" style="color:#173f61;text-decoration:underline;overflow-wrap:anywhere;word-break:break-all;">${escapedValue}</a>`
    : escapedValue);
  const whatsappAction = whatsapp
    ? `<br><a href="${escape(whatsapp)}" style="font-size:12px;color:#176348;text-decoration:underline;">Open WhatsApp</a>`
    : "";
  return `<div style="padding:9px 11px;background:#f5f7f9;overflow-wrap:anywhere;word-break:break-word;">
    <div style="margin:0 0 3px;font-size:11px;line-height:15px;color:#627181;">${escape(label)}</div>
    <div dir="auto" style="font-size:${strong ? "15px" : "13px"};font-weight:${strong ? "bold" : "normal"};line-height:19px;color:#17283b;overflow-wrap:anywhere;word-break:break-word;">${content}${whatsappAction}</div>
  </div>`;
}

function renderGrid(fields: Field[]): string {
  const rows: string[] = [];
  for (let index = 0; index < fields.length;) {
    const current = fields[index]!;
    if (current.wide) {
      rows.push(`<tr><td colspan="2" style="padding:0 0 7px;">${renderCard(current)}</td></tr>`);
      index++;
      continue;
    }
    const next = fields[index + 1];
    const hasPair = Boolean(next && !next.wide);
    rows.push(`<tr>
      <td class="ek-col" ${hasPair ? 'width="50%"' : 'colspan="2"'} valign="top" style="${hasPair ? "width:50%;" : ""}padding:0 ${hasPair ? "4px" : "0"} 7px 0;">${renderCard(current)}</td>
      ${hasPair ? `<td class="ek-col" width="50%" valign="top" style="width:50%;padding:0 0 7px 4px;">${renderCard(next!)}</td>` : ""}
    </tr>`);
    index += hasPair ? 2 : 1;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border:0;">${rows.join("")}</table>`;
}

export function renderEnquiryEmail(enquiry: EnquirySubmission, receivedAt: number) {
  const isTest = /^\[TEST\](?:\s|$)/i.test(enquiry.service);
  const date = `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh", day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(receivedAt))} (Riyadh time, UTC+03:00)`;
  const fullReference = enquiry.submissionId;
  // The short display is only a convenience, not a new sequential identifier.
  // The full UUID stays in the original enquiry and in this element's title.
  const shortReference = fullReference ? `…${fullReference.replace(/-/g, "").slice(-12).toUpperCase()}` : "";
  const service = isTest ? enquiry.service.replace(/^\[TEST\]\s*/i, "") : enquiry.service;
  const field = (label: string, value = "", options: Partial<Field> = {}): Field => ({ label, value, ...options });
  const serviceCategory = getEnquiryServiceByValue(enquiry.service);
  const privacyAcknowledgement = enquiry.privacyConsent === true
    ? isTest
      ? "Simulated for this test only — no genuine customer consent is recorded."
      : "Acknowledged by the submitter."
    : "";
  const serviceFields = Object.entries(enquiry.serviceDetails).flatMap(([id, value]) => {
    const label = serviceCategory && getServiceRequirementLabel(serviceCategory.id, id, enquiry.language);
    return label
      ? [field(label, formatServiceRequirementValue(serviceCategory.id, id, value, enquiry.language), { wide: value.length > 60 })]
      : [];
  });
  const sections: Section[] = [
    { title: "Enquiry summary", fields: [
      field("Enquiry reference", shortReference, fullReference
        ? { htmlValue: `<span title="Full enquiry identifier: ${escape(fullReference)}">${escape(shortReference)}</span>` }
        : {}),
      field("Submitted", date),
      field("Service requested", service, { strong: true, wide: true }),
      field("Language", enquiry.language === "ar" ? "Arabic" : "English"),
    ] },
    { title: "Customer information", fields: [
      field("Customer name", enquiry.name),
      field("Company name", enquiry.company),
      field("Email address", enquiry.email, { href: mailtoHref(enquiry.email) }),
      field("Phone / WhatsApp", enquiry.phone, contactLinks(enquiry.phone, isTest)),
    ] },
    { title: "Service requirements", fields: serviceFields },
    { title: "Customer's description", fields: [
      field("Tell us about your requirements", enquiry.requirementsText, { wide: true }),
      field("Additional notes or special instructions", enquiry.message, { wide: true }),
    ] },
    { title: "Shipment information", fields: [
      field("Origin", enquiry.origin),
      field("Destination", enquiry.destination),
      field("Commodity or cargo description", enquiry.cargoDescription, { wide: true }),
      field("Number of packages or pieces", enquiry.packageCount),
      field("Packed dimensions (with units)", enquiry.dimensions),
      field("Gross weight (kg)", enquiry.weightKg),
      field("Ready or preferred shipping date", enquiry.preferredShippingDate),
      field("Event & venue", enquiry.eventDetails),
    ] },
    { title: "Submission details", fields: [
      field("Privacy notice acknowledgement", privacyAcknowledgement, { wide: true }),
    ] },
  ].map((section) => ({ ...section, fields: section.fields.filter(({ value }) => value.trim()) }))
    .filter(({ fields }) => fields.length);

  const heading = "New Website Enquiry";
  const intro = "A new enquiry has been submitted through your website.";
  const testNotice = "TEST SUBMISSION — Not a genuine customer enquiry.";
  const subject = isTest
    ? "[TEST] Enquiry Email Preview | Envod Kingdom"
    : enquiry.service.trim()
      ? `New Enquiry — ${cleanSubject(enquiry.service).slice(0, 90)} | Envod Kingdom`
      : "New Website Enquiry — Envod Kingdom";
  const summary = sections[0]!;
  const customer = sections[1]!;
  const serviceRequirements = sections.find(({ title }) => title === "Service requirements");
  const customerDescription = sections.find(({ title }) => title === "Customer's description");
  const shipment = sections.find(({ title }) => title === "Shipment information");
  const submission = sections.find(({ title }) => title === "Submission details");
  const contentSections = [customer, serviceRequirements, customerDescription, shipment, submission]
    .filter((section): section is Section => Boolean(section?.fields.length));
  const sectionHtml = contentSections
    .map(({ title, fields }) => `<tr><td style="padding:15px 24px 0;">
      <h2 style="margin:0 0 7px;font-size:14px;line-height:19px;color:#21344b;">${title}</h2>
      ${renderGrid(fields)}</td></tr>`).join("");
  const replyHref = mailtoHref(enquiry.email, `Re: ${subject}`);
  const plainSection = (section: Section) =>
    `${section.title}\n${section.fields.map(({ label, value }) => `${label}: ${value}`).join("\n")}`;
  const plainSections = [summary, customer, serviceRequirements, customerDescription, shipment, submission]
    .filter((section): section is Section => Boolean(section?.fields.length));

  return {
    subject,
    text: [
      heading,
      intro,
      ...(isTest ? [testNotice] : []),
      ...plainSections.map(plainSection),
      `Reply to this notification to contact ${enquiry.name}.`,
      "Envod Kingdom Shipping Services LLC",
      "This notification was generated automatically by the Envod Kingdom website.",
    ].join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title>
    <style>@media only screen and (max-width:480px){.ek-col{display:block!important;width:100%!important;max-width:100%!important;padding-left:0!important;padding-right:0!important;}}</style></head>
    <body style="margin:0;padding:0;background:#eef1f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#eef1f5;"><tr><td align="center" style="padding:16px 8px;">
    <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;table-layout:fixed;border-collapse:collapse;background:#ffffff;border:1px solid #e4e8ed;">
    <tr><td style="padding:22px 24px;background:#101e30;border-top:4px solid #d8232a;color:#ffffff;">
      <p style="margin:0 0 10px;font-size:19px;line-height:24px;font-weight:bold;letter-spacing:.4px;color:#ffffff;">ENVOD KINGDOM</p>
      <p style="margin:0 0 17px;font-size:10px;line-height:15px;letter-spacing:1px;color:#d6dde7;">SHIPPING SERVICES LLC</p>
      <h1 style="margin:0;font-size:20px;line-height:26px;color:#ffffff;">${heading}</h1>
      <p style="margin:7px 0 0;font-size:13px;line-height:19px;color:#e0e7ef;">${intro}</p></td></tr>
    ${isTest ? `<tr><td style="padding:9px 24px;background:#fff2dd;color:#704000;font-size:12px;line-height:18px;font-weight:bold;">${testNotice}</td></tr>` : ""}
    <tr><td style="padding:16px 24px 0;"><h2 style="margin:0 0 7px;font-size:14px;line-height:19px;color:#21344b;">${summary.title}</h2>${renderGrid(summary.fields)}</td></tr>
    ${sectionHtml}
    <tr><td style="padding:19px 24px 0;"><a href="${escape(replyHref)}" style="display:inline-block;padding:10px 16px;background:#173f61;color:#ffffff;font-size:13px;line-height:18px;font-weight:bold;text-decoration:none;">Reply to enquiry</a></td></tr>
    <tr><td style="padding:13px 24px 17px;font-size:11px;line-height:17px;color:#697789;">Envod Kingdom Shipping Services LLC<br>This notification was generated automatically by the Envod Kingdom website.</td></tr>
    </table><!--[if mso]></td></tr></table><![endif]-->
    </td></tr></table></body></html>`,
  };
}
