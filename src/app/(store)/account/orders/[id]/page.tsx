import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { SHIPPING_METHODS } from "@/lib/pricing";

export const metadata = { title: "Order" };

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-8 py-16">Loading the order…</p>}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/account/orders");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.sub },
    include: { items: true },
  });
  if (!order) notFound();
  const shipping = SHIPPING_METHODS.find((method) => method.id === order.shippingMethod);
  const flow = ORDER_STATUSES.filter((status) => status !== "CANCELLED");

  return (
    <Container className="py-12">
      <Link href="/account/orders" className="text-sm underline">
        All orders
      </Link>
      <h1 className="mt-4 font-serif text-4xl">{order.number}</h1>
      <p className="mt-2 text-muted">{new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(order.createdAt)}</p>
      {order.status === "CANCELLED" ? (
        <p className="mt-6 border border-line bg-highlight px-4 py-3 text-sm">This order was cancelled.</p>
      ) : (
        <ol className="mt-8 grid grid-cols-2 gap-3 text-sm md:grid-cols-4" aria-label="Order progress">
          {flow.map((status) => {
            const current = flow.indexOf(order.status as (typeof flow)[number]);
            const index = flow.indexOf(status);
            const done = index <= current;
            return (
              <li key={status} aria-current={status === order.status ? "step" : undefined} className={done ? "border-b-2 border-ink pb-2" : "border-b border-line pb-2 text-muted"}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </li>
            );
          })}
        </ol>
      )}
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative h-24 w-20 bg-sand">
                {item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
              </div>
              <div className="text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted">{item.variantName}</p>
                <p className="mt-1 tabular-nums">{item.quantity} × {formatMoney(item.unitPriceCents)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-sm">
          <h2 className="font-serif text-2xl">Ships to</h2>
          <p className="mt-2">
            {order.shippingName}<br />
            {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}<br />
            {order.shippingCity}, {order.shippingRegion} {order.shippingPostal}<br />
            {shipping?.label}
          </p>
          <dl className="mt-6 space-y-1">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{formatMoney(order.shippingCents)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd className="tabular-nums">{formatMoney(order.taxCents)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.totalCents)}</dd></div>
          </dl>
        </div>
      </div>
    </Container>
  );
}
