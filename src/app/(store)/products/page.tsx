import { Suspense } from "react";

import { ProductListing } from "@/components/product-listing";
import { getCatalog, getCategories } from "@/lib/catalog";

export const metadata = {
  title: "Shop",
  description: "Browse ceramics, textiles, lighting, fragrance, and bath objects from Lumen.",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Loading the shop…</p>}>
      <Shop searchParams={searchParams} />
    </Suspense>
  );
}

async function Shop({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, products, categories] = await Promise.all([searchParams, getCatalog(), getCategories()]);
  return (
    <ProductListing
      products={products}
      categories={categories}
      searchParams={params}
      pathname="/products"
      heading="All objects"
      intro="Thirty-four pieces across the house, from the table to the bath."
    />
  );
}
