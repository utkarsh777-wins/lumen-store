import { z } from "zod";

import { assessMockCard } from "@/lib/payments";
import { isShippingMethod } from "@/lib/pricing";

export const addressSchema = z.object({
  email: z.email("Enter a valid email."),
  fullName: z.string().trim().min(2, "Enter the recipient's name."),
  line1: z.string().trim().min(3, "Enter a street address."),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city."),
  region: z.string().trim().min(2, "Enter a state or region."),
  postal: z.string().trim().min(3, "Enter a postal code.").max(12, "That postal code is too long."),
  country: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code.")
    .transform((value) => value.toUpperCase()),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  title: z.string().trim().min(3, "Add a short title.").max(80),
  body: z.string().trim().min(10, "Tell us a little more.").max(800),
});

const checkoutBase = addressSchema.extend({
  shippingMethod: z.string(),
  paymentMode: z.enum(["mock", "stripe"]),
  cardName: z.string().optional().or(z.literal("")),
  cardNumber: z.string().optional().or(z.literal("")),
  cardExp: z.string().optional().or(z.literal("")),
  cardCvc: z.string().optional().or(z.literal("")),
  paymentIntentId: z.string().optional().or(z.literal("")),
  idempotencyKey: z.string().min(8, "Missing checkout reference."),
  saveAddress: z.boolean().optional(),
});

export function parseCheckout(input: unknown, now = new Date()) {
  return checkoutBase.superRefine((value, ctx) => {
    if (!isShippingMethod(value.shippingMethod)) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingMethod"],
        message: "Choose a delivery method.",
      });
    }
    if (value.paymentMode === "stripe") {
      if (!value.paymentIntentId) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentIntentId"],
          message: "Payment has not completed.",
        });
      }
      return;
    }
    const card = assessMockCard(
      {
        name: value.cardName ?? "",
        number: value.cardNumber ?? "",
        exp: value.cardExp ?? "",
        cvc: value.cardCvc ?? "",
      },
      now,
    );
    if (!card.ok) {
      ctx.addIssue({ code: "custom", path: [card.field], message: card.error });
    }
  }).safeParse(input);
}

export function issueMap(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
