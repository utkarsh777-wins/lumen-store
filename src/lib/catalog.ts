import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/db";
import type { CatalogProduct, CategoryRecord } from "@/lib/types";

const CATEGORY_ORDER = ["ceramics", "textiles", "lighting", "fragrance", "bath"];

export async function getCatalog(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife({ revalidate: 60, expire: 60 * 60 });

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { sku: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  return products
    .map((product) => {
      const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const reviewCount = product.reviews.length;
      const rating = reviewCount
        ? Math.round((product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10
        : 0;
      const colors: { name: string; hex: string }[] = [];
      for (const variant of product.variants) {
        if (variant.color && variant.colorHex && !colors.some((color) => color.name === variant.color)) {
          colors.push({ name: variant.color, hex: variant.colorHex });
        }
      }
      const compareAt =
        product.compareAtCents && product.compareAtCents > product.priceCents ? product.compareAtCents : null;
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        details: product.details,
        priceCents: product.priceCents,
        compareAtCents: compareAt,
        categorySlug: product.category.slug,
        categoryName: product.category.name,
        categoryDescription: product.category.description,
        categoryImage: product.category.image,
        featured: product.featured,
        bestSeller: product.bestSeller,
        createdAt: product.createdAt.toISOString(),
        stock,
        rating,
        reviewCount,
        images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          priceCents: variant.priceCents,
          stock: variant.stock,
        })),
        reviews: product.reviews.map((review) => ({
          id: review.id,
          author: review.author,
          rating: review.rating,
          title: review.title,
          body: review.body,
          createdAt: review.createdAt.toISOString(),
        })),
        colors,
      } satisfies CatalogProduct;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategories(): Promise<CategoryRecord[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife({ revalidate: 60, expire: 60 * 60 });

  const categories = await prisma.category.findMany();
  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
    }))
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.slug);
      const bi = CATEGORY_ORDER.indexOf(b.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.name.localeCompare(b.name);
    });
}

export async function getProductBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.find((product) => product.slug === slug) ?? null;
}
