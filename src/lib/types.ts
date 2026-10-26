import type { CatalogQueryItem } from "@/lib/catalog-query";

export type CatalogVariant = {
  id: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  priceCents: number;
  stock: number;
};

export type CatalogReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type CatalogProduct = CatalogQueryItem & {
  details: string;
  compareAtCents: number | null;
  categoryDescription: string;
  categoryImage: string;
  images: { url: string; alt: string }[];
  variants: CatalogVariant[];
  reviews: CatalogReview[];
  colors: { name: string; hex: string }[];
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

export type ActionState = { ok: true; message?: string } | { ok: false; error: string } | null;
