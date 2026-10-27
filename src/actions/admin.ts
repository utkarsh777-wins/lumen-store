"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { dollarsToCents } from "@/lib/money";
import { slugify } from "@/lib/slug";

type AdminResult = { ok: true; message?: string; status?: string } | { ok: false; error: string };

async function requireAdmin(): Promise<AdminResult | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "You do not have access to the studio." };
  return null;
}

function dollars(value: FormDataEntryValue | null) {
  const amount = Number(String(value ?? "").trim());
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return dollarsToCents(amount);
}

export async function saveProduct(_prev: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  const description = String(formData.get("description") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const priceCents = dollars(formData.get("price"));
  const compareRaw = String(formData.get("compareAt") ?? "").trim();
  const compareAtCents = compareRaw ? dollars(compareRaw) : null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const featured = formData.get("featured") === "on";
  const bestSeller = formData.get("bestSeller") === "on";

  if (name.length < 2) return { ok: false, error: "Enter a product name." };
  if (!slug) return { ok: false, error: "Enter a URL slug." };
  if (description.length < 10) return { ok: false, error: "Add a longer description." };
  if (details.length < 10) return { ok: false, error: "Add material and care details." };
  if (!priceCents) return { ok: false, error: "Enter a price greater than zero." };
  if (compareRaw && !compareAtCents) return { ok: false, error: "Compare-at price is not a valid amount." };
  if (!(await prisma.category.findUnique({ where: { id: categoryId } }))) {
    return { ok: false, error: "Choose a category." };
  }

  const slugTaken = await prisma.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (slugTaken) return { ok: false, error: "Another product already uses that slug." };

  let images: { url: string; alt: string }[] = [];
  const imageText = String(formData.get("images") ?? "");
  images = imageText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({ url, alt: name }));
  if (images.length === 0) return { ok: false, error: "Add at least one image path or URL." };

  let variants: {
    sku: string;
    size?: string;
    color?: string;
    colorHex?: string;
    price?: string;
    stock: string;
  }[] = [];
  try {
    variants = JSON.parse(String(formData.get("variantsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Variants could not be read." };
  }
  if (!Array.isArray(variants) || variants.length === 0) {
    return { ok: false, error: "Add at least one variant." };
  }

  const normalized: {
    sku: string;
    name: string;
    size: string | null;
    color: string | null;
    colorHex: string | null;
    priceCents: number;
    stock: number;
  }[] = [];
  const seen = new Set<string>();
  for (const variant of variants) {
    const sku = String(variant.sku ?? "").trim().toUpperCase();
    const stock = Math.floor(Number(variant.stock));
    if (sku.length < 2) return { ok: false, error: "Every variant needs a SKU." };
    if (seen.has(sku)) return { ok: false, error: `SKU ${sku} is repeated.` };
    seen.add(sku);
    if (!Number.isFinite(stock) || stock < 0) return { ok: false, error: `Stock for ${sku} must be zero or more.` };
    const override = String(variant.price ?? "").trim();
    const variantPrice = override ? dollars(override) : priceCents;
    if (!variantPrice) return { ok: false, error: `Price for ${sku} is not valid.` };
    const color = String(variant.color ?? "").trim();
    const size = String(variant.size ?? "").trim();
    const colorHex = String(variant.colorHex ?? "").trim();
    if (colorHex && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorHex)) {
      return { ok: false, error: `Color for ${sku} needs a hex value like #d9c7a6.` };
    }
    const label = [size, color].filter(Boolean).join(" / ") || "Standard";
    normalized.push({
      sku,
      name: label,
      size: size || null,
      color: color || null,
      colorHex: colorHex || null,
      priceCents: variantPrice,
      stock,
    });
  }

  const skuConflict = await prisma.variant.findFirst({
    where: { sku: { in: normalized.map((variant) => variant.sku) }, NOT: id ? { productId: id } : undefined },
  });
  if (skuConflict) return { ok: false, error: `SKU ${skuConflict.sku} belongs to another product.` };

  const listingPrice = Math.min(...normalized.map((variant) => variant.priceCents));
  const data = {
    name,
    slug,
    description,
    details,
    priceCents: listingPrice,
    compareAtCents: compareAtCents && compareAtCents > listingPrice ? compareAtCents : null,
    categoryId,
    featured,
    bestSeller,
  };

  if (id) {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: images.map((image, position) => ({ ...image, productId: id, position })),
      });
      const existing = await tx.variant.findMany({ where: { productId: id } });
      const keep = new Set(normalized.map((variant) => variant.sku));
      const removed = existing.filter((variant) => !keep.has(variant.sku));
      if (removed.length) {
        await tx.variant.deleteMany({ where: { id: { in: removed.map((variant) => variant.id) } } });
      }
      for (const variant of normalized) {
        const current = existing.find((entry) => entry.sku === variant.sku);
        if (current) {
          await tx.variant.update({ where: { id: current.id }, data: variant });
        } else {
          await tx.variant.create({ data: { ...variant, productId: id } });
        }
      }
    });
  } else {
    await prisma.product.create({
      data: {
        ...data,
        images: { create: images.map((image, position) => ({ ...image, position })) },
        variants: { create: normalized },
      },
    });
  }

  updateTag("catalog");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const denied = await requireAdmin();
  if (denied) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  await prisma.product.delete({ where: { id } });
  updateTag("catalog");
  redirect("/admin/products");
}

export async function saveCategory(_prev: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  if (name.length < 2 || !slug || description.length < 8 || !image) {
    return { ok: false, error: "Name, description, and image are required." };
  }
  const taken = await prisma.category.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (taken) return { ok: false, error: "Another category uses that slug." };
  if (id) {
    await prisma.category.update({ where: { id }, data: { name, slug, description, image } });
  } else {
    await prisma.category.create({ data: { name, slug, description, image } });
  }
  updateTag("catalog");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const denied = await requireAdmin();
  if (denied) redirect("/admin/categories?error=Not+allowed");
  const id = String(formData.get("id") ?? "");
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    redirect("/admin/categories?error=Move+or+delete+products+in+this+category+first");
  }
  await prisma.category.delete({ where: { id } });
  updateTag("catalog");
  redirect("/admin/categories");
}

export async function updateStock(formData: FormData): Promise<void> {
  const denied = await requireAdmin();
  if (denied) return;
  const id = String(formData.get("id") ?? "");
  const stock = Math.floor(Number(formData.get("stock")));
  if (!Number.isFinite(stock) || stock < 0) return;
  await prisma.variant.update({ where: { id }, data: { stock } });
  updateTag("catalog");
}

export async function updateOrderStatus(_prev: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { ok: false, error: "Choose a valid status." };
  }
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === status) return { ok: true, message: "Status unchanged.", status };

  try {
    await prisma.$transaction(async (tx) => {
      const leavingCancelled = order.status === "CANCELLED" && status !== "CANCELLED";
      const enteringCancelled = order.status !== "CANCELLED" && status === "CANCELLED";
      if (enteringCancelled || leavingCancelled) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          if (enteringCancelled) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            const updated = await tx.variant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (updated.count !== 1) {
              throw new Error(`Not enough stock to reopen ${item.name}.`);
            }
          }
        }
      }
      await tx.order.update({
        where: { id },
        data: {
          status,
          paymentStatus: status === "CANCELLED" ? "refunded" : "paid",
        },
      });
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Status could not be updated." };
  }

  updateTag("catalog");
  refresh();
  return { ok: true, message: "Order updated.", status };
}
