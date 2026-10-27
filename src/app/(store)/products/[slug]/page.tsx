import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { PurchasePanel } from "@/components/purchase-panel";
import { ReviewForm } from "@/components/review-form";
import { Container, Stars } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getCatalog, getProductBySlug } from "@/lib/catalog";
import { relatedProducts } from "@/lib/catalog-query";

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Object" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0].url, alt: product.images[0].alt }] : undefined,
    },
  };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Loading the object…</p>}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getProductBySlug(slug), getCatalog()]);
  if (!product) notFound();
  const related = relatedProducts(catalog, product, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.url),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Lumen" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/products/${product.slug}`,
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <Container className="py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/products">Shop</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/collections/${product.categorySlug}`}>{product.categoryName}</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{product.name}</span>
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} name={product.name} />
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.categoryName}</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-3">
            <Stars rating={product.rating} count={product.reviewCount} />
          </div>
          <p className="mt-5 max-w-prose text-muted">{product.description}</p>
          <div className="mt-8">
            <PurchasePanel
              productId={product.id}
              productName={product.name}
              variants={product.variants}
              compareAtCents={product.compareAtCents}
            />
          </div>
          <p className="mt-6 text-sm text-muted">Ships in 2 business days. Free standard shipping over $75.</p>
        </div>
      </div>

      <div className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
        <section>
          <h2 className="font-serif text-3xl">Details</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{product.details}</p>
        </section>
        <section>
          <h2 className="font-serif text-3xl">Reviews</h2>
          {product.reviews.length === 0 ? <p className="mt-4 text-sm text-muted">No reviews yet.</p> : null}
          <ul className="mt-4 space-y-6">
            {product.reviews.map((review) => (
              <li key={review.id}>
                <Stars rating={review.rating} />
                <h3 className="mt-1 font-medium">{review.title}</h3>
                <p className="mt-1 text-sm text-muted">{review.body}</p>
                <p className="mt-2 text-xs text-muted">
                  {review.author} · {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(review.createdAt))}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-muted">Loading reviews…</p>}>
              <ReviewAccess productId={product.id} slug={product.slug} name={product.name} />
            </Suspense>
          </div>
        </section>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}

async function ReviewAccess({ productId, slug, name }: { productId: string; slug: string; name: string }) {
  const session = await getSession();
  if (!session) {
    return (
      <p className="text-sm">
        <Link href={`/account/login?next=/products/${slug}`} className="underline">
          Sign in
        </Link>{" "}
        to review {name}.
      </p>
    );
  }
  return <ReviewForm productId={productId} />;
}
