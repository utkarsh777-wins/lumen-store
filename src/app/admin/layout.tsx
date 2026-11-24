import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AdminNav } from "@/components/admin-nav";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Studio desk",
  robots: { index: false, follow: false },
};

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
        <div className="px-4 py-3 md:px-5 md:py-6">
          <Link href="/" className="font-serif text-2xl">
            Lumen
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">Studio desk</p>
        </div>
        <AdminNav />
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line px-4 py-3 text-sm md:px-5 md:py-4">
          <p>{session.name}</p>
          <Link href="/" className="underline">
            View store
          </Link>
        </header>
        <div className="px-4 py-3 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
