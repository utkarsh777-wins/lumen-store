import Link from "next/link";
import { Suspense } from "react";

import { getSession } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Orders" };

export default function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  return (
    <Suspense fallback={<p>Loading orders…</p>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await getSession();
  const { status } = await searchParams;
  const active = ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) ? status : undefined;
  const orders = await prisma.order.findMany({
    where: active ? { status: active } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/orders" aria-current={!active ? "page" : undefined} className={!active ? "underline" : "text-muted"}>
          All
        </Link>
        {ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/orders?status=${value}`}
            aria-current={active === value ? "page" : undefined}
            className={active === value ? "underline" : "text-muted"}
          >
            {value.charAt(0) + value.slice(1).toLowerCase()}
          </Link>
        ))}
      </nav>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-3 font-medium">Order</th>
              <th className="font-medium">Customer</th>
              <th className="font-medium">Status</th>
              <th className="font-medium">Total</th>
              <th className="font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line">
                <td className="py-3">
                  <Link href={`/admin/orders/${order.id}`} className="underline">
                    {order.number}
                  </Link>
                </td>
                <td>{order.email}</td>
                <td>{order.status.toLowerCase()}</td>
                <td className="tabular-nums">{formatMoney(order.totalCents)}</td>
                <td>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="py-8 text-muted">No orders in this view.</p> : null}
      </div>
    </div>
  );
}
