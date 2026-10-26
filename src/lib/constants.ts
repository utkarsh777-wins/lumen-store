export const COOKIE = {
  session: "lumen_session",
  cart: "lumen_cart",
  wishlist: "lumen_wish",
  orderAccess: "lumen_order_access",
} as const;

export const BRAND = {
  name: "Lumen",
  tagline: "Objects for a quieter home.",
  description:
    "Ceramics, linen, lighting, and scent composed in small batches for rooms you actually live in.",
} as const;

export const PAGE_SIZE = 12;

export const ORDER_STATUSES = [
  "PAID",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
