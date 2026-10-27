import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { Container, EmptyState } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getWishlistIds } from "@/lib/wishlist";

export const metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default function WishlistPage() {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Loading saved objects…</p>}>
      <Saved />
    </Suspense>
  );
}

async function Saved() {
  const [ids, catalog] = await Promise.all([getWishlistIds(), getCatalog()]);
  const products = ids.flatMap((id) => catalog.filter((product) => product.id === id));
  return (
    <Container className="py-12">
      <h1 className="font-serif text-4xl md:text-5xl">Saved</h1>
      <p className="mt-3 max-w-lg text-muted">A private list. Guests keep it in this browser. Signing in keeps it with the account.</p>
      {products.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing saved yet"
            body="Tap the heart on an object to keep it here."
            action={{ href: "/products", label: "Browse the shop" }}
          />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
