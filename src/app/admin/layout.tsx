import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Studio desk",
  robots: { index: false, follow: false },
};

const links = [
  ["/admin", "Overview"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/inventory", "Inventory"],
  ["/admin/orders", "Orders"],
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Opening the studio desk…</p>}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}

async function Frame({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/?notice=admin");
  return (
    <div className="min-h-screen bg-bg text-ink md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line md:border-b-0 md:border-r">
        <div className="px-5 py-6">
          <Link href="/" className="font-serif text-2xl">
            Lumen
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">Studio desk</p>
        </div>
        <nav aria-label="Admin" className="flex gap-4 overflow-x-auto px-5 pb-4 text-sm md:flex-col md:gap-1 md:px-3">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded px-2 py-2 hover:bg-highlight">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line px-5 py-4 text-sm">
          <p>{session.name}</p>
          <Link href="/" className="underline">
            View store
          </Link>
        </header>
        <div className="px-5 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
