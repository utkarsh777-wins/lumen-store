import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

import { categories, products, reviewAuthors, reviewPool } from "./catalog";
import { quoteOrder, type ShippingMethodId } from "../src/lib/pricing";

const prisma = new PrismaClient();

function variantName(size?: string, color?: string) {
  const parts = [size, color].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 30, 0, 0);
  return date;
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  const categoryRecords = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: { ...category } });
    categoryRecords.set(category.slug, created.id);
  }

  for (const [index, product] of products.entries()) {
    const categoryId = categoryRecords.get(product.category);
    if (!categoryId) throw new Error(`Missing category ${product.category}`);
    const variantPrices = product.variants.map((variant) => variant.priceCents ?? product.priceCents);
    const priceCents = Math.min(...variantPrices);
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        details: product.details,
        priceCents,
        compareAtCents: product.compareAtCents ?? null,
        categoryId,
        featured: product.featured ?? false,
        bestSeller: product.bestSeller ?? false,
        createdAt: daysAgo(products.length - index + 12),
        images: {
          create: product.images.map((image, position) => ({
            url: image.file,
            alt: image.alt,
            position,
          })),
        },
        variants: {
          create: product.variants.map((variant) => ({
            sku: variant.sku,
            name: variantName(variant.size, variant.color),
            size: variant.size ?? null,
            color: variant.color ?? null,
            colorHex: variant.hex ?? null,
            priceCents: variant.priceCents ?? product.priceCents,
            stock: variant.stock,
          })),
        },
      },
    });

    const reviewCount = product.bestSeller ? 3 : 1;
    for (let i = 0; i < reviewCount; i += 1) {
      const snippet = reviewPool[(index + i) % reviewPool.length];
      await prisma.review.create({
        data: {
          productId: created.id,
          author: reviewAuthors[(index + i) % reviewAuthors.length],
          rating: snippet.rating,
          title: snippet.title,
          body: snippet.body,
          createdAt: daysAgo(6 + index + i * 3),
        },
      });
    }
  }

  const adminHash = await bcrypt.hash("lumen-admin", 12);
  const guestHash = await bcrypt.hash("lumen-guest", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Mira Chen",
      email: "admin@lumen.studio",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const jonah = await prisma.user.create({
    data: {
      name: "Jonah Hale",
      email: "jonah@example.com",
      passwordHash: guestHash,
      role: "CUSTOMER",
      addresses: {
        create: {
          fullName: "Jonah Hale",
          line1: "418 SE Ankeny Street",
          line2: "Apt 2",
          city: "Portland",
          region: "OR",
          postal: "97214",
          country: "US",
          phone: "503-555-0148",
          isDefault: true,
        },
      },
    },
  });

  await prisma.wishlistItem.create({
    data: {
      userId: jonah.id,
      productId: (await prisma.product.findUniqueOrThrow({ where: { slug: "oat-linen-throw" } })).id,
    },
  });

  const variantBySku = new Map(
    (await prisma.variant.findMany({ include: { product: { include: { images: true } } } })).map((variant) => [
      variant.sku,
      variant,
    ]),
  );

  async function createOrder(input: {
    number: string;
    email: string;
    userId?: string;
    status: string;
    shippingMethod: ShippingMethodId;
    days: number;
    lines: { sku: string; quantity: number }[];
    address: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postal: string;
    };
  }) {
    const lines = input.lines.map((line) => {
      const variant = variantBySku.get(line.sku);
      if (!variant) throw new Error(`Missing sku ${line.sku}`);
      return {
        productId: variant.productId,
        variantId: variant.id,
        name: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        image: variant.product.images[0]?.url ?? null,
        unitPriceCents: variant.priceCents,
        quantity: line.quantity,
      };
    });
    const quote = quoteOrder({
      lines: lines.map((line) => ({ unitPriceCents: line.unitPriceCents, quantity: line.quantity })),
      shippingMethod: input.shippingMethod,
    });
    await prisma.order.create({
      data: {
        number: input.number,
        userId: input.userId,
        email: input.email,
        status: input.status,
        paymentStatus: input.status === "CANCELLED" ? "refunded" : "paid",
        paymentMethod: "mock",
        last4: "4242",
        subtotalCents: quote.subtotalCents,
        shippingCents: quote.shippingCents,
        taxCents: quote.taxCents,
        totalCents: quote.totalCents,
        shippingMethod: input.shippingMethod,
        accessToken: randomBytes(18).toString("base64url"),
        idempotencyKey: `seed-${input.number}`,
        shippingName: input.address.name,
        shippingLine1: input.address.line1,
        shippingLine2: input.address.line2,
        shippingCity: input.address.city,
        shippingRegion: input.address.region,
        shippingPostal: input.address.postal,
        shippingCountry: "US",
        createdAt: daysAgo(input.days),
        items: { create: lines },
      },
    });
  }

  const portland = {
    name: "Jonah Hale",
    line1: "418 SE Ankeny Street",
    line2: "Apt 2",
    city: "Portland",
    region: "OR",
    postal: "97214",
  };

  await createOrder({
    number: "LM-1001",
    email: jonah.email,
    userId: jonah.id,
    status: "DELIVERED",
    shippingMethod: "standard",
    days: 46,
    lines: [
      { sku: "MUG-SAND", quantity: 1 },
      { sku: "FIG-8", quantity: 2 },
    ],
    address: portland,
  });

  await createOrder({
    number: "LM-1008",
    email: jonah.email,
    userId: jonah.id,
    status: "SHIPPED",
    shippingMethod: "express",
    days: 4,
    lines: [
      { sku: "THR-OAT", quantity: 1 },
      { sku: "BALM-50", quantity: 1 },
    ],
    address: portland,
  });

  await createOrder({
    number: "LM-1004",
    email: "leah.ortiz@example.com",
    status: "FULFILLED",
    shippingMethod: "standard",
    days: 18,
    lines: [
      { sku: "COL-BONE", quantity: 1 },
      { sku: "CDR-100", quantity: 1 },
    ],
    address: {
      name: "Leah Ortiz",
      line1: "88 Grove Street",
      city: "Hudson",
      region: "NY",
      postal: "12534",
    },
  });

  await createOrder({
    number: "LM-1012",
    email: "evan.brooks@example.com",
    status: "PAID",
    shippingMethod: "overnight",
    days: 1,
    lines: [{ sku: "NGT-15", quantity: 1 }],
    address: {
      name: "Evan Brooks",
      line1: "19 Oak Park Ave",
      city: "Chicago",
      region: "IL",
      postal: "60302",
    },
  });

  await createOrder({
    number: "LM-1006",
    email: "sofia.marin@example.com",
    status: "CANCELLED",
    shippingMethod: "standard",
    days: 12,
    lines: [{ sku: "DUN-Q", quantity: 1 }],
    address: {
      name: "Sofia Marin",
      line1: "640 Alvarado Street",
      city: "Los Angeles",
      region: "CA",
      postal: "90026",
    },
  });

  await createOrder({
    number: "LM-1002",
    email: "priya.raman@example.com",
    status: "DELIVERED",
    shippingMethod: "standard",
    days: 33,
    lines: [
      { sku: "SOK-16", quantity: 1 },
      { sku: "OIL-50", quantity: 1 },
      { sku: "CLTH-6", quantity: 1 },
    ],
    address: {
      name: "Priya Raman",
      line1: "220 Beacon Street",
      city: "Boston",
      region: "MA",
      postal: "02116",
    },
  });

  await prisma.newsletterSubscriber.create({
    data: { email: "studio-list@lumen.studio" },
  });

  const productCount = await prisma.product.count();
  const variantCount = await prisma.variant.count();
  console.log(`Seeded ${productCount} products, ${variantCount} variants, and demo orders.`);
  console.log("Admin  admin@lumen.studio  /  lumen-admin");
  console.log("Customer  jonah@example.com  /  lumen-guest");
  void admin;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
