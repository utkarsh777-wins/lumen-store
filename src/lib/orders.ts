import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { getSession } from "@/lib/auth";
import { COOKIE } from "@/lib/constants";
import { baseCookie } from "@/lib/cookies";
import { prisma } from "@/lib/db";
import { quoteOrder, type ShippingMethodId } from "@/lib/pricing";

export class StockConflict extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockConflict";
  }
}

export async function nextOrderNumber(tx: Pick<typeof prisma, "order">) {
  const orders = await tx.order.findMany({ select: { number: true } });
  const highest = orders.reduce((max, order) => {
    const value = Number(order.number.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 1000);
  return `LM-${highest + 1}`;
}

export function newAccessToken() {
  return randomBytes(18).toString("base64url");
}

export async function rememberOrderAccess(token: string) {
  const store = await cookies();
  store.set(COOKIE.orderAccess, token, { ...baseCookie, maxAge: 60 * 60 * 24 });
}

export async function getOrderForViewer(id: string, token?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return null;
  const session = await getSession();
  if (session?.role === "ADMIN" || (session && order.userId === session.sub)) return order;
  const store = await cookies();
  const cookieToken = store.get(COOKIE.orderAccess)?.value;
  if ((token && token === order.accessToken) || (cookieToken && cookieToken === order.accessToken)) {
    return order;
  }
  return null;
}

export function priceLines(
  lines: { unitPriceCents: number; quantity: number }[],
  shippingMethod: ShippingMethodId,
) {
  return quoteOrder({ lines, shippingMethod });
}
