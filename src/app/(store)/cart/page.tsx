import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { removeCartItem, updateCartItem } from "@/actions/cart";
import { Button, Container, EmptyState } from "@/components/ui";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD_CENTS, quoteOrder } from "@/lib/pricing";

export const metadata = { title: "Bag", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Loading your bag…</p>}>
      <CartView />
    </Suspense>
  );
}

async function CartView() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Your bag is empty"
          body="The shop is full of objects that can wait on a table for years. Start with one."
          action={{ href: "/products", label: "Browse the shop" }}
        />
      </Container>
    );
  }

  const quote = quoteOrder({
    lines: items.map((item) => ({ unitPriceCents: item.unitPriceCents, quantity: item.quantity })),
    shippingMethod: "standard",
  });

  return (
    <Container className="py-12">
      <h1 className="font-serif text-4xl md:text-5xl">Your bag</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-[6rem_1fr] gap-4 py-6 sm:grid-cols-[7.5rem_1fr_auto]">
              <Link href={`/products/${item.productSlug}`} className="relative block aspect-[3/4] bg-sand">
                {item.image ? <Image src={item.image} alt={item.imageAlt} fill sizes="120px" className="object-cover" /> : null}
              </Link>
              <div>
                <Link href={`/products/${item.productSlug}`} className="font-serif text-2xl">
                  {item.productName}
                </Link>
                <p className="mt-1 text-sm text-muted">{item.variantName}</p>
                <p className="mt-1 text-sm tabular-nums">{formatMoney(item.unitPriceCents)}</p>
                {item.quantity > item.stock ? (
                  <p className="mt-2 text-sm text-danger">Only {item.stock} left. Quantity will be reduced when you update it.</p>
                ) : null}
                <div className="mt-4 flex items-center gap-4">
                  <form action={updateCartItem} className="inline-flex items-center border border-line">
                    <input type="hidden" name="itemId" value={item.id} />
                    <button name="quantity" value={item.quantity - 1} className="inline-flex h-11 w-11 items-center justify-center" aria-label={`Decrease quantity of ${item.productName}`}>
                      −
                    </button>
                    <span className="min-w-8 text-center tabular-nums">{item.quantity}</span>
                    <button
                      name="quantity"
                      value={Math.min(item.quantity + 1, item.stock)}
                      className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-40"
                      aria-label={`Increase quantity of ${item.productName}`}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </form>
                  <form action={removeCartItem}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="text-sm underline">Remove</button>
                  </form>
                </div>
              </div>
              <p className="hidden text-right tabular-nums sm:block">{formatMoney(item.unitPriceCents * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <aside className="h-fit border border-line bg-elev p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(quote.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Standard shipping</dt>
              <dd className="tabular-nums">{quote.shippingCents === 0 ? "Free" : formatMoney(quote.shippingCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Estimated tax</dt>
              <dd className="tabular-nums">{formatMoney(quote.taxCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt>Estimated total</dt>
              <dd className="tabular-nums">{formatMoney(quote.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">Shipping is estimated with standard delivery. You can choose express at checkout.</p>
          {quote.shippingCents > 0 ? (
            <div className="mt-4">
              <p>Add {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS - quote.subtotalCents)} for free standard shipping.</p>
              <div className="mt-2 h-1 bg-line" aria-hidden="true">
                <div
                  className="h-full bg-ok"
                  style={{ width: `${Math.min(100, (quote.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
          <Button href="/checkout" className="mt-6 w-full">
            Checkout
          </Button>
        </aside>
      </div>
    </Container>
  );
}
