import Link from "next/link";
import { Suspense } from "react";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Overview" };

export default function AdminHome() {
  return (
    <Suspense fallback={<p>Loading numbers…</p>}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await getSession();
  const paid = await prisma.order.findMany({
    where: { paymentStatus: "paid" },
    include: { items: true },
  });
  const revenue = paid.reduce((sum, order) => sum + order.totalCents, 0);
  const average = paid.length ? Math.round(revenue / paid.length) : 0;
  const open = await prisma.order.count({ where: { status: { in: ["PAID", "FULFILLED", "SHIPPED"] } } });
  const low = await prisma.variant.findMany({
    where: { stock: { lte: 5 } },
    include: { product: true },
    orderBy: { stock: "asc" },
    take: 6,
  });
  const recent = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return date;
  });
  const series = days.map((day) => {
    const key = day.toISOString().slice(0, 10);
    const cents = paid
      .filter((order) => order.createdAt.toISOString().slice(0, 10) === key)
      .reduce((sum, order) => sum + order.totalCents, 0);
    return { key, label: day.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }), cents };
  });
  const max = Math.max(...series.map((day) => day.cents), 1);

  const units = new Map<string, number>();
  for (const order of paid) {
    for (const item of order.items) {
      units.set(item.name, (units.get(item.name) ?? 0) + item.quantity);
    }
  }
  const top = [...units.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-muted">Paid orders only. Cancelled orders are excluded.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Revenue" value={formatMoney(revenue)} />
        <Stat label="Paid orders" value={String(paid.length)} />
        <Stat label="Average order" value={formatMoney(average)} />
      </div>
      <section>
        <h2 className="font-serif text-2xl">Last 7 days</h2>
        <div className="mt-4 flex h-40 items-end gap-3">
          {series.map((day) => (
            <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div className="w-full bg-accent" style={{ height: `${Math.max(4, (day.cents / max) * 100)}%` }} />
              </div>
              <span className="text-xs text-muted">{day.label}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm underline">
              All orders
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {recent.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3">
                <Link href={`/admin/orders/${order.id}`} className="underline">
                  {order.number}
                </Link>
                <span className="text-muted">{order.status.toLowerCase()}</span>
                <span className="tabular-nums">{formatMoney(order.totalCents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{open} orders still moving.</p>
        </section>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Low stock</h2>
            <Link href="/admin/inventory" className="text-sm underline">
              Inventory
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {low.map((variant) => (
              <li key={variant.id} className="flex justify-between border-b border-line py-2">
                <span>
                  {variant.product.name}
                  <span className="text-muted"> · {variant.name}</span>
                </span>
                <span className="tabular-nums">{variant.stock}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm uppercase tracking-[0.14em] text-muted">Top pieces</h3>
          <ul className="mt-2 text-sm">
            {top.map(([name, quantity]) => (
              <li key={name} className="flex justify-between py-1">
                <span>{name}</span>
                <span className="tabular-nums">{quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-elev p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl tabular-nums">{value}</p>
    </div>
  );
}
