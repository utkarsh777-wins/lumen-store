"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "Overview"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/inventory", "Inventory"],
  ["/admin/orders", "Orders"],
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1 overflow-x-auto px-3 pb-2 text-sm md:flex-col md:flex-nowrap md:overflow-visible md:pb-6">
      {links.map(([href, label]) => {
        const current = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded px-3 hover:bg-highlight ${current ? "desk-current" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
