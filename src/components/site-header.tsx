import Link from "next/link";
import { Suspense } from "react";

import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { getCategories } from "@/lib/catalog";
import { IconBag, IconUser } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "@/components/ui";
import { getWishlistIds } from "@/lib/wishlist";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "Studio" },
];

export async function SiteHeader() {
  const categories = await getCategories();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="bg-pine text-center text-[12px] tracking-wide text-bg">
        <p className="px-4 py-2">Complimentary standard shipping on orders over $75</p>
      </div>
      <Container className="flex h-16 items-center gap-4 md:h-20">
        <MobileNav categories={categories} />
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Lumen
        </Link>
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-6 text-sm lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
          {categories.map((category) => (
            <Link key={category.id} href={`/collections/${category.slug}`} className="hover:text-accent">
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <form action="/products" role="search" className="hidden md:block">
            <label htmlFor="site-search" className="sr-only">
              Search the shop
            </label>
            <input
              id="site-search"
              name="q"
              placeholder="Search"
              className="w-36 border-b border-line bg-transparent py-1 text-sm outline-none focus:w-48"
            />
          </form>
          <ThemeToggle />
          <Suspense fallback={<HeaderFallback />}>
            <HeaderActions />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}

function HeaderFallback() {
  return (
    <div className="flex items-center gap-4 text-sm text-muted" aria-hidden="true">
      <span>Account</span>
      <span>Saved</span>
      <span>Bag</span>
    </div>
  );
}

async function HeaderActions() {
  const [session, cart, wishlist] = await Promise.all([getSession(), getCart(), getWishlistIds()]);
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href={session ? "/account" : "/account/login"} className="hidden items-center gap-1.5 sm:inline-flex">
        <IconUser className="h-5 w-5" />
        <span>{session ? session.name.split(" ")[0] : "Account"}</span>
      </Link>
      <Link href="/wishlist" className="hidden sm:inline" aria-label={`Wishlist, ${wishlist.length} saved`}>
        Saved
        {wishlist.length > 0 ? <span className="ml-1 tabular-nums text-muted">{wishlist.length}</span> : null}
      </Link>
      <Link href="/cart" className="inline-flex items-center gap-1.5" aria-label={`Bag, ${count} items`}>
        <IconBag className="h-5 w-5" />
        <span className="tabular-nums">{count}</span>
      </Link>
    </div>
  );
}
