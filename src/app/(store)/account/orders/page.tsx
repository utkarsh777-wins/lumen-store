import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { logout } from "@/actions/auth";
import { Container, EmptyState } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="px-8 py-16">Loading orders…</p>}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl">Orders</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/account">Profile</Link>
          <Link href="/account/orders" aria-current="page" className="underline">
            Orders
          </Link>
          <form action={logout}>
            <button className="underline">Sign out</button>
          </form>
        </nav>
      </div>
      {orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No orders yet" body="When you check out while signed in, the receipt will land here." action={{ href: "/products", label: "Shop" }} />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <Link href={`/account/orders/${order.id}`} className="font-medium underline">
                  {order.number}
                </Link>
                <p className="text-sm text-muted">
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(order.createdAt)} · {order.status.toLowerCase()}
                </p>
              </div>
              <p className="tabular-nums">{formatMoney(order.totalCents)}</p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
