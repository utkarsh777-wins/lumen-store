import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductListing } from "@/components/product-listing";
import { getCatalog, getCategories } from "@/lib/catalog";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) return { title: "Collection" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/collections/${category.slug}` },
    openGraph: { images: [{ url: category.image, alt: category.name }] },
  };
}

export default function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Loading the collection…</p>}>
      <Collection params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Collection({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query, products, categories] = await Promise.all([
    params,
    searchParams,
    getCatalog(),
    getCategories(),
  ]);
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  return (
    <>
      <section className="relative min-h-[320px] bg-sand">
        <Image src={category.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 mx-auto w-full max-w-[1440px] px-5 py-10 text-white md:px-8">
          <p className="text-xs uppercase tracking-[0.18em]">Collection</p>
          <h1 className="mt-2 font-serif text-5xl md:text-6xl">{category.name}</h1>
          <p className="mt-3 max-w-lg text-white/85">{category.description}</p>
        </div>
      </section>
      <ProductListing
        products={products}
        categories={categories}
        searchParams={query}
        pathname={`/collections/${category.slug}`}
        lockedCategory={category.slug}
        heading={category.name}
        intro={category.description}
        showHeading={false}
      />
    </>
  );
}
