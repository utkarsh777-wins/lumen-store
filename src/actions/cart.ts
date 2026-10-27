"use server";

import { refresh } from "next/cache";

import { assertStock } from "@/lib/cart-math";
import { getOrCreateCartId } from "@/lib/cart";
import { prisma } from "@/lib/db";
import type { ActionState } from "@/lib/types";

export async function addToCart(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Math.floor(Number(formData.get("quantity") ?? 1));
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) return { ok: false, error: "That option is no longer available." };

  const cartId = await getOrCreateCartId();
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });
  const nextQuantity = (existing?.quantity ?? 0) + (Number.isFinite(quantity) ? quantity : 1);
  const stock = assertStock(nextQuantity, variant.stock);
  if (!stock.ok) return { ok: false, error: stock.error };

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
  } else {
    await prisma.cartItem.create({ data: { cartId, variantId, quantity: nextQuantity } });
  }
  refresh();
  return { ok: true, message: `${variant.product.name} added to your bag.` };
}

export async function updateCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Math.floor(Number(formData.get("quantity") ?? 1));
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: true, cart: true },
  });
  if (!item) return;

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    refresh();
    return;
  }
  const allowed = Math.min(quantity, item.variant.stock);
  if (allowed < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    refresh();
    return;
  }
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: allowed } });
  refresh();
}

export async function removeCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  await prisma.cartItem.deleteMany({ where: { id: itemId } });
  refresh();
}
