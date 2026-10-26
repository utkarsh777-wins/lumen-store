import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { getOrderForViewer } from "@/lib/orders";
import { SHIPPING_METHODS } from "@/lib/pricing";

export const metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

export default function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-muted">Loading your order…</p>}>
      <Confirmation params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Confirmation({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await getOrderForViewer(id, query.token);
  if (!order) {
    return (
      <Container className="py-16">
        <h1 className="font-serif text-4xl">We cannot show that order</h1>
        <p className="mt-3 max-w-md text-muted">The confirmation link may have expired. Signed-in orders are listed in your account.</p>
        <Link href="/account/orders" className="mt-6 inline-block underline">
          View order history
        </Link>
      </Container>
    );
  }
  const shipping = SHIPPING_METHODS.find((method) => method.id === order.shippingMethod);

  return (
    <Container className="py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Order {order.number}</p>
      <h1 className="mt-3 font-serif text-4xl md:text-6xl">Thank you. It is ours to pack.</h1>
      <p className="mt-4 max-w-xl text-muted">
        A receipt is ready below for {order.email}.{" "}
        {order.paymentMethod === "mock"
          ? "This was a demo payment. Nothing was charged."
          : "Payment was taken in Stripe test mode."}
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative h-24 w-20 bg-sand">
                {item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
              </div>
              <div className="text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted">{item.variantName}</p>
                <p className="mt-1 tabular-nums">
                  {item.quantity} × {formatMoney(item.unitPriceCents)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-6 text-sm">
          <section>
            <h2 className="font-serif text-2xl">Delivery</h2>
            <p className="mt-2">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
              <br />
              {order.shippingCity}, {order.shippingRegion} {order.shippingPostal}
              <br />
              {shipping?.label ?? order.shippingMethod}
            </p>
          </section>
          <section>
            <h2 className="font-serif text-2xl">Payment</h2>
            <p className="mt-2">
              {order.paymentMethod === "mock" ? "Demo card" : "Stripe"}
              {order.last4 ? ` · ending ${order.last4}` : ""}
            </p>
            <dl className="mt-3 space-y-1">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(order.subtotalCents)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{formatMoney(order.shippingCents)}</dd></div>
              <div className="flex justify-between"><dt>Tax</dt><dd className="tabular-nums">{formatMoney(order.taxCents)}</dd></div>
              <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.totalCents)}</dd></div>
            </dl>
          </section>
          <Link href="/account/orders" className="inline-block underline">
            Order history
          </Link>
        </div>
      </div>
    </Container>
  );
}
