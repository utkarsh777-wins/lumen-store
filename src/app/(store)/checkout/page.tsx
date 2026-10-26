import { Suspense } from "react";

import { CheckoutForm, type CheckoutAddress } from "@/components/checkout-form";
import { Container, EmptyState } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";

export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Preparing checkout…</p>}>
      <Checkout />
    </Suspense>
  );
}

async function Checkout() {
  const [cart, session] = await Promise.all([getCart(), getSession()]);
  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState title="Nothing to check out" body="Your bag is empty." action={{ href: "/products", label: "Return to the shop" }} />
      </Container>
    );
  }

  const address = session
    ? await prisma.address.findFirst({ where: { userId: session.sub, isDefault: true } })
    : null;
  const initial: CheckoutAddress = {
    email: session?.email ?? "",
    fullName: address?.fullName ?? session?.name ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    city: address?.city ?? "",
    region: address?.region ?? "",
    postal: address?.postal ?? "",
    country: address?.country ?? "US",
    phone: address?.phone ?? "",
  };
  const mode = process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "stripe" : "mock";

  return (
    <Container className="py-12">
      <h1 className="font-serif text-4xl md:text-5xl">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm
          mode={mode}
          signedIn={Boolean(session)}
          initialAddress={initial}
          lines={items.map((item) => ({
            name: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            image: item.image,
          }))}
        />
      </div>
    </Container>
  );
}
