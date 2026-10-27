import { cookies } from "next/headers";

import { getSession } from "@/lib/auth";
import { COOKIE } from "@/lib/constants";
import { baseCookie } from "@/lib/cookies";
import { prisma } from "@/lib/db";

function parseIds(value: string | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string").slice(0, 30);
  } catch {
    return [];
  }
}

export async function getWishlistIds() {
  const session = await getSession();
  if (session) {
    const rows = await prisma.wishlistItem.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      select: { productId: true },
    });
    return rows.map((row) => row.productId);
  }
  const store = await cookies();
  return parseIds(store.get(COOKIE.wishlist)?.value);
}

export async function mergeWishlist(userId: string) {
  const store = await cookies();
  const ids = parseIds(store.get(COOKIE.wishlist)?.value);
  for (const productId of ids) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) continue;
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
  }
  store.delete(COOKIE.wishlist);
}

export async function writeGuestWishlist(ids: string[]) {
  const store = await cookies();
  store.set(COOKIE.wishlist, JSON.stringify(ids.slice(0, 30)), {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 90,
  });
}
