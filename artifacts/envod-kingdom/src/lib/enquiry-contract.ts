import { z } from "zod";
import { CARGO_FIELD_LIMITS, isValidCargoWeight, isValidShippingDate } from "./enquiry-cargo-validation.js";
import { getEnquiryServiceByValue, validServiceDetails } from "./enquiry-services.js";

const boundedText = (max: number) => z.string().trim().max(max);

export const QuoteCargoSchema = z.object({
  dimensions: boundedText(CARGO_FIELD_LIMITS.dimensions).optional().default(""),
  packageCount: boundedText(CARGO_FIELD_LIMITS.packageCount).optional().default(""),
  weightKg: boundedText(CARGO_FIELD_LIMITS.weightKg).optional().default("").refine(
    isValidCargoWeight,
    "Enter a positive weight in kg with up to three decimal places.",
  ),
  preferredShippingDate: boundedText(CARGO_FIELD_LIMITS.preferredShippingDate).optional().default("").refine(
    isValidShippingDate, "Enter a valid shipping date."),
  eventDetails: boundedText(CARGO_FIELD_LIMITS.eventDetails).optional().default(""),
});

export const EnquirySubmissionSchema = z
  .object({
    ...QuoteCargoSchema.shape,
    formType: z.enum(["contact", "quote"]),
    submissionId: z.string().uuid().optional(),
    language: z.enum(["en", "ar"]),
    name: z.string().trim().min(2).max(120),
    company: boundedText(160).optional().default(""),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(6).max(40),
    service: z.string().trim().min(2).max(160),
    origin: boundedText(160).optional().default(""),
    destination: boundedText(160).optional().default(""),
    cargoDescription: boundedText(1200).optional().default(""),
    requirementsText: boundedText(4000).optional().default(""),
    serviceDetails: z.record(
      z.string().regex(/^[a-z][A-Za-z0-9]{0,47}$/),
      boundedText(1200),
    ).optional().default({}),
    message: boundedText(4000).optional().default(""),
    privacyConsent: z.literal(true),
    website: boundedText(200).optional().default(""),
  })
  .strict()
  .superRefine((submission, context) => {
    if (!validServiceDetails(submission.service, submission.serviceDetails)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceDetails"],
        message: "Service requirements must match the selected service.",
      });
    }
    if (getEnquiryServiceByValue(submission.service)?.id === "other" && !submission.requirementsText.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requirementsText"],
        message: "Please describe the logistics service you need.",
      });
    }
    if (Object.values(submission.serviceDetails).reduce((total, value) => total + value.length, 0) > 6000) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceDetails"],
        message: "Combined service requirements must be 6000 characters or fewer.",
      });
    }
  });

export type EnquirySubmission = z.infer<typeof EnquirySubmissionSchema>;
