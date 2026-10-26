import { notFound } from "next/navigation";
import { Suspense } from "react";

import { deleteProduct } from "@/actions/admin";
import { ProductForm } from "@/components/product-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Edit product" };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p>Loading the product…</p>}>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  await getSession();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { sku: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl">Edit {product.name}</h1>
      <div className="mt-8">
        <ProductForm
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            details: product.details,
            price: (product.priceCents / 100).toFixed(2),
            compareAt: product.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : "",
            categoryId: product.categoryId,
            featured: product.featured,
            bestSeller: product.bestSeller,
            images: product.images.map((image) => image.url).join("\n"),
            variants: product.variants.map((variant) => ({
              sku: variant.sku,
              size: variant.size ?? "",
              color: variant.color ?? "",
              colorHex: variant.colorHex ?? "",
              price: (variant.priceCents / 100).toFixed(2),
              stock: String(variant.stock),
            })),
          }}
        />
      </div>
      <form action={deleteProduct} className="mt-8">
        <input type="hidden" name="id" value={product.id} />
        <button className="text-sm text-danger underline">Delete product</button>
      </form>
    </div>
  );
}
