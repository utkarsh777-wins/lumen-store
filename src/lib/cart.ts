import { cookies } from "next/headers";

import { COOKIE } from "@/lib/constants";
import { baseCookie } from "@/lib/cookies";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const cartCookie = { ...baseCookie, maxAge: 60 * 60 * 24 * 30 };

const include = {
  items: {
    orderBy: { id: "asc" as const },
    include: {
      variant: {
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" as const }, take: 1 } },
          },
        },
      },
    },
  },
};

export type CartLineView = {
  id: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  stock: number;
  sku: string;
  variantName: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  imageAlt: string;
};

export type CartView = {
  id: string;
  items: CartLineView[];
};

type CartRecord = Awaited<ReturnType<typeof loadCart>>;

async function loadCart(id: string) {
  return prisma.cart.findUnique({ where: { id }, include });
}

function present(cart: NonNullable<CartRecord>): CartView {
  return {
    id: cart.id,
    items: cart.items.flatMap((item) => {
      if (!item.variant?.product) return [];
      const image = item.variant.product.images[0];
      return [
        {
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceCents: item.variant.priceCents,
          stock: item.variant.stock,
          sku: item.variant.sku,
          variantName: item.variant.name,
          productId: item.variant.productId,
          productName: item.variant.product.name,
          productSlug: item.variant.product.slug,
          image: image?.url ?? null,
          imageAlt: image?.alt ?? item.variant.product.name,
        },
      ];
    }),
  };
}

export async function getCart(): Promise<CartView | null> {
  const store = await cookies();
  const session = await getSession();
  if (session) {
    const owned = await prisma.cart.findUnique({ where: { userId: session.sub }, include });
    if (owned) return present(owned);
  }
  const cartId = store.get(COOKIE.cart)?.value;
  if (!cartId) return null;
  const cart = await loadCart(cartId);
  if (!cart || (cart.userId && cart.userId !== session?.sub)) return null;
  return present(cart);
}

export async function getOrCreateCartId() {
  const store = await cookies();
  const token = store.get(COOKIE.session)?.value;
  const session = await getSession();
  if (token && !session) store.delete(COOKIE.session);
  if (session) {
    await attachCartToUser(session.sub);
    const cart = await prisma.cart.findUnique({ where: { userId: session.sub } });
    if (cart) return cart.id;
  }

  const existingId = store.get(COOKIE.cart)?.value;
  if (existingId) {
    const existing = await prisma.cart.findUnique({ where: { id: existingId } });
    if (existing && !existing.userId) return existing.id;
  }
  const created = await prisma.cart.create({ data: {} });
  store.set(COOKIE.cart, created.id, cartCookie);
  return created.id;
}

export async function attachCartToUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return;
  const store = await cookies();
  const guestId = store.get(COOKIE.cart)?.value;
  let userCart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  const guest = guestId
    ? await prisma.cart.findUnique({ where: { id: guestId }, include: { items: true } })
    : null;

  if (!userCart && guest && !guest.userId) {
    userCart = await prisma.cart.update({
      where: { id: guest.id },
      data: { userId },
      include: { items: true },
    });
  } else if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId }, include: { items: true } });
  } else if (guest && guest.id !== userCart.id && !guest.userId) {
    for (const item of guest.items) {
      const current = await prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      });
      if (current) {
        await prisma.cartItem.update({
          where: { id: current.id },
          data: { quantity: current.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: userCart.id, variantId: item.variantId, quantity: item.quantity },
        });
      }
    }
    await prisma.cart.delete({ where: { id: guest.id } });
  }

  store.set(COOKIE.cart, userCart.id, cartCookie);
}
