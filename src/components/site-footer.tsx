import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter-form";
import { Container } from "@/components/ui";
import { getCategories } from "@/lib/catalog";

export async function SiteFooter() {
  const categories = await getCategories();
  return (
    <footer className="mt-20 border-t border-line">
      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-serif text-3xl">Lumen</p>
          <p className="mt-3 max-w-sm text-muted">
            Objects for a quieter home. Ceramics, linen, light, and scent, made to be used every day.
          </p>
          <NewsletterForm />
        </div>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/products">All objects</Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/collections/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Studio</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/shipping">Shipping and returns</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Account</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/account/login">Sign in</Link>
            </li>
            <li>
              <Link href="/account">Orders</Link>
            </li>
            <li>
              <Link href="/wishlist">Wishlist</Link>
            </li>
            <li>
              <Link href="/admin">Studio desk</Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-muted">
          <p>© 2026 Lumen Studio. All rights reserved.</p>
          <p>Photography from Unsplash, used under the Unsplash License.</p>
        </Container>
      </div>
    </footer>
  );
}
