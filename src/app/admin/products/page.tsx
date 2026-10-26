import Link from "next/link";
import { Suspense } from "react";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Products" };

export default function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading products…</p>}>
      <Products searchParams={searchParams} />
    </Suspense>
  );
}

async function Products({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await getSession();
  const { q } = await searchParams;
  const term = q?.trim();
  const products = await prisma.product.findMany({
    where: term ? { name: { contains: term } } : undefined,
    include: { category: true, variants: true },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl">Products</h1>
        <Link href="/admin/products/new" className="bg-ink px-4 py-3 text-sm text-bg">
          New product
        </Link>
      </div>
      <form className="mt-6" action="/admin/products">
        <label className="sr-only" htmlFor="admin-product-search">
          Search products
        </label>
        <input id="admin-product-search" name="q" defaultValue={term} placeholder="Search by name" className="w-full max-w-sm border border-line bg-elev px-3 py-3 text-sm" />
      </form>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-3 font-medium">Name</th>
              <th className="font-medium">Category</th>
              <th className="font-medium">Price</th>
              <th className="font-medium">Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line">
                <td className="py-3">
                  {product.name}
                  {product.featured ? <span className="ml-2 text-xs text-muted">Featured</span> : null}
                </td>
                <td>{product.category.name}</td>
                <td className="tabular-nums">{formatMoney(product.priceCents)}</td>
                <td className="tabular-nums">{product.variants.reduce((sum, variant) => sum + variant.stock, 0)}</td>
                <td className="text-right">
                  <Link href={`/admin/products/${product.id}`} className="underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? <p className="py-8 text-muted">No products match.</p> : null}
      </div>
    </div>
  );
}
