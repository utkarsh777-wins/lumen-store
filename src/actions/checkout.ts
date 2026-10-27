"use server";

import { updateTag } from "next/cache";

import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { newAccessToken, nextOrderNumber, priceLines, rememberOrderAccess, StockConflict } from "@/lib/orders";
import { assessMockCard } from "@/lib/payments";
import { isShippingMethod } from "@/lib/pricing";
import { issueMap, parseCheckout } from "@/lib/validation";

export type PlaceOrderResult =
  | { ok: true; orderId: string; number: string; token: string }
  | { ok: false; error: string; fields?: Record<string, string> };

function paymentMode() {
  return process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "stripe" : "mock";
}

async function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(key);
}

async function loadLines() {
  const cart = await getCart();
  if (!cart || cart.items.length === 0) return { cart: null, lines: [] };
  const variants = await prisma.variant.findMany({
    where: { id: { in: cart.items.map((item) => item.variantId) } },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  const lines = [];
  for (const item of cart.items) {
    const variant = variants.find((entry) => entry.id === item.variantId);
    if (!variant) {
      return { cart, lines: [], error: "Something in your bag is no longer available." };
    }
    if (variant.stock < item.quantity) {
      return {
        cart,
        lines: [],
        error:
          variant.stock <= 0
            ? `${variant.product.name} is sold out.`
            : `Only ${variant.stock} of ${variant.product.name} left.`,
      };
    }
    lines.push({
      productId: variant.productId,
      variantId: variant.id,
      name: variant.product.name,
      variantName: variant.name,
      sku: variant.sku,
      image: variant.product.images[0]?.url ?? null,
      unitPriceCents: variant.priceCents,
      quantity: item.quantity,
    });
  }
  return { cart, lines };
}

export async function createPaymentIntent(shippingMethod: string) {
  if (paymentMode() !== "stripe") {
    return { ok: false as const, error: "Stripe is not configured." };
  }
  if (!isShippingMethod(shippingMethod)) {
    return { ok: false as const, error: "Choose a delivery method." };
  }
  const loaded = await loadLines();
  if (loaded.error || !loaded.cart) return { ok: false as const, error: loaded.error ?? "Your bag is empty." };
  const quote = priceLines(loaded.lines, shippingMethod);
  const stripe = await stripeClient();
  if (!stripe) return { ok: false as const, error: "Stripe is not configured." };
  const intent = await stripe.paymentIntents.create({
    amount: quote.totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { cartId: loaded.cart.id },
  });
  if (!intent.client_secret) return { ok: false as const, error: "Payment could not be started." };
  return {
    ok: true as const,
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount: quote.totalCents,
  };
}

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = parseCheckout(input);
  if (!parsed.success) {
    const fields = issueMap(parsed.error.issues);
    return { ok: false, error: "Check the highlighted fields.", fields };
  }
  const data = parsed.data;
  if (!isShippingMethod(data.shippingMethod)) {
    return { ok: false, error: "Choose a delivery method.", fields: { shippingMethod: "Choose a delivery method." } };
  }
  if (data.paymentMode !== paymentMode()) {
    return { ok: false, error: "Payment method changed. Refresh checkout and try again." };
  }

  const existing = await prisma.order.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
  if (existing) {
    await rememberOrderAccess(existing.accessToken);
    return { ok: true, orderId: existing.id, number: existing.number, token: existing.accessToken };
  }

  const loaded = await loadLines();
  if (loaded.error || !loaded.cart) return { ok: false, error: loaded.error ?? "Your bag is empty." };
  const quote = priceLines(loaded.lines, data.shippingMethod);

  let stripePaymentId: string | null = null;
  let last4: string | null = null;
  if (data.paymentMode === "mock") {
    const card = assessMockCard({
      name: data.cardName ?? "",
      number: data.cardNumber ?? "",
      exp: data.cardExp ?? "",
      cvc: data.cardCvc ?? "",
    });
    if (!card.ok) return { ok: false, error: card.error, fields: { [card.field]: card.error } };
    last4 = card.last4;
  } else {
    const stripe = await stripeClient();
    if (!stripe || !data.paymentIntentId) {
      return { ok: false, error: "Payment has not completed.", fields: { paymentIntentId: "Payment has not completed." } };
    }
    const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
    if (intent.status !== "succeeded") {
      return { ok: false, error: "Payment has not completed.", fields: { paymentIntentId: "Payment has not completed." } };
    }
    if (intent.amount !== quote.totalCents || intent.currency !== "usd") {
      return { ok: false, error: "The paid amount does not match this order. Please pay again." };
    }
    stripePaymentId = intent.id;
    const charge = intent.latest_charge;
    if (typeof charge === "object" && charge && "payment_method_details" in charge) {
      const details = charge.payment_method_details?.card?.last4;
      if (details) last4 = details;
    }
  }

  const session = await getSession();
  const accessToken = newAccessToken();

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const line of loaded.lines) {
        const updated = await tx.variant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count !== 1) {
          throw new StockConflict(`${line.name} just sold out. Review your bag and try again.`);
        }
      }
      return tx.order.create({
        data: {
          number: await nextOrderNumber(tx),
          userId: session?.sub,
          email: data.email.toLowerCase(),
          status: "PAID",
          paymentStatus: "paid",
          paymentMethod: data.paymentMode,
          stripePaymentId,
          last4,
          subtotalCents: quote.subtotalCents,
          shippingCents: quote.shippingCents,
          taxCents: quote.taxCents,
          totalCents: quote.totalCents,
          shippingMethod: data.shippingMethod,
          accessToken,
          idempotencyKey: data.idempotencyKey,
          shippingName: data.fullName,
          shippingLine1: data.line1,
          shippingLine2: data.line2 || null,
          shippingCity: data.city,
          shippingRegion: data.region,
          shippingPostal: data.postal,
          shippingCountry: data.country,
          shippingPhone: data.phone || null,
          items: {
            create: loaded.lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              name: line.name,
              variantName: line.variantName,
              sku: line.sku,
              image: line.image,
              unitPriceCents: line.unitPriceCents,
              quantity: line.quantity,
            })),
          },
        },
      });
    });

    await prisma.cartItem.deleteMany({ where: { cartId: loaded.cart.id } });
    if (session && data.saveAddress) {
      await prisma.address.updateMany({ where: { userId: session.sub }, data: { isDefault: false } });
      await prisma.address.create({
        data: {
          userId: session.sub,
          fullName: data.fullName,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          region: data.region,
          postal: data.postal,
          country: data.country,
          phone: data.phone || null,
          isDefault: true,
        },
      });
    }
    updateTag("catalog");
    await rememberOrderAccess(order.accessToken);
    return { ok: true, orderId: order.id, number: order.number, token: order.accessToken };
  } catch (error) {
    if (error instanceof StockConflict) return { ok: false, error: error.message };
    throw error;
  }
}
