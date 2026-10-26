import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { OrderStatusForm } from "@/components/order-status-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { SHIPPING_METHODS } from "@/lib/pricing";

export const metadata = { title: "Order" };

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p>Loading the order…</p>}>
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: { params: Promise<{ id: string }> }) {
  await getSession();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const shipping = SHIPPING_METHODS.find((method) => method.id === order.shippingMethod);
  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm underline">
        All orders
      </Link>
      <h1 className="mt-3 font-serif text-4xl">{order.number}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.email} · {order.paymentMethod} · {order.paymentStatus}
        {order.last4 ? ` · card ${order.last4}` : ""}
      </p>
      <div className="mt-6">
        <OrderStatusForm id={order.id} status={order.status} />
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-3 text-sm">
              <div className="relative h-16 w-14 bg-sand">
                {item.image ? <Image src={item.image} alt="" fill sizes="56px" className="object-cover" /> : null}
              </div>
              <div>
                <p>{item.name}</p>
                <p className="text-muted">{item.variantName} · {item.sku}</p>
                <p className="tabular-nums">{item.quantity} × {formatMoney(item.unitPriceCents)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-sm">
          <h2 className="font-serif text-2xl">Ship to</h2>
          <p className="mt-2">
            {order.shippingName}<br />
            {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}<br />
            {order.shippingCity}, {order.shippingRegion} {order.shippingPostal} {order.shippingCountry}<br />
            {shipping?.label} · {shipping?.detail}
          </p>
          <dl className="mt-4 space-y-1">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{formatMoney(order.shippingCents)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd className="tabular-nums">{formatMoney(order.taxCents)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.totalCents)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
