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
  const quietWeek = series.every((day) => day.cents === 0);
  const max = Math.max(...series.map((day) => day.cents), 1);

  const units = new Map<string, number>();
  for (const order of paid) {
    for (const item of order.items) {
      units.set(item.name, (units.get(item.name) ?? 0) + item.quantity);
    }
  }
  const top = [...units.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-10">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-muted">Paid orders only. Cancelled orders are excluded.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Stat label="Revenue" value={formatMoney(revenue)} />
        <Stat label="Paid orders" value={String(paid.length)} />
        <Stat label="Average order" value={formatMoney(average)} />
      </div>
      <section>
        <h2 className="font-serif text-2xl max-sm:text-xl">Last 7 days</h2>
        {quietWeek ? (
          <div className="mt-4 flex min-h-40 flex-col justify-center border border-dashed border-line px-5 py-6 sm:min-h-48">
            <h3 className="font-medium">No paid orders in the last 7 days.</h3>
            <p className="mt-2 max-w-md text-sm text-muted">
              Paid revenue will appear here once an order is marked paid. Cancelled orders stay excluded.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <div
              className="desk-plot border-b border-line"
              role="img"
              aria-label={series.map((day) => `${day.label} ${formatMoney(day.cents)}`).join(", ")}
            >
              {series.map((day) => {
                const height = day.cents <= 0 ? undefined : Math.max(8, Math.round((day.cents / max) * 168));
                return (
                  <div key={day.key} className="desk-col">
                    <div className={day.cents <= 0 ? "desk-bar is-zero" : "desk-bar"} style={height ? { height } : undefined}>
                      {day.cents > 0 ? <span className="desk-bar-label">{formatMoney(day.cents)}</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-1.5 flex gap-1">
              {series.map((day) => (
                <span key={day.key} className="flex-1 text-center text-[11px] text-muted sm:text-xs">
                  {day.label}
                </span>
              ))}
            </div>
          </div>
        )}
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
              <li key={order.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
                <Link href={`/admin/orders/${order.id}`} className="underline">
                  {order.number}
                </Link>
                <StatusPill status={order.status} />
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
                <span className={`tabular-nums ${variant.stock === 0 ? "text-danger" : ""}`}>{variant.stock}</span>
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
    <div className="border border-line bg-elev p-2.5 sm:p-5">
      <p className="text-[10px] uppercase leading-tight tracking-[0.12em] text-muted sm:text-xs sm:tracking-[0.16em]">{label}</p>
      <p className="mt-1 font-serif text-lg tabular-nums sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  const tone =
    key === "cancelled"
      ? "border-danger/40 text-danger"
      : key === "paid" || key === "delivered" || key === "fulfilled"
        ? "border-ok/40 text-ok"
        : "border-line text-ink";
  return <span className={`inline-flex w-fit border px-1.5 py-0.5 text-xs lowercase ${tone}`}>{key}</span>;
}
