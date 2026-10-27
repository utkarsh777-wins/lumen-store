"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWishlistIds, writeGuestWishlist } from "@/lib/wishlist";

export async function readWishlist() {
  return getWishlistIds();
}

export async function toggleWishlist(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { ok: false as const, error: "That object is no longer available.", saved: false, ids: [] };

  const session = await getSession();
  if (session) {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.sub, productId } },
    });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlistItem.create({ data: { userId: session.sub, productId } });
    }
    const ids = await getWishlistIds();
    return { ok: true as const, saved: !existing, ids };
  }

  const current = await getWishlistIds();
  const saved = current.includes(productId);
  const ids = saved ? current.filter((id) => id !== productId) : [productId, ...current].slice(0, 30);
  await writeGuestWishlist(ids);
  return { ok: true as const, saved: !saved, ids };
}
