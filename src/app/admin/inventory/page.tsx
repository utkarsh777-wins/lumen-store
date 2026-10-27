import { Suspense } from "react";

import { updateStock } from "@/actions/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <Suspense fallback={<p>Loading inventory…</p>}>
      <Inventory />
    </Suspense>
  );
}

async function Inventory() {
  await getSession();
  const variants = await prisma.variant.findMany({
    include: { product: true },
    orderBy: [{ stock: "asc" }, { sku: "asc" }],
  });
  return (
    <div>
      <h1 className="font-serif text-4xl">Inventory</h1>
      <p className="mt-2 text-sm text-muted">{variants.length} variants. Stock updates immediately.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-3 font-medium">SKU</th>
              <th className="font-medium">Product</th>
              <th className="font-medium">Variant</th>
              <th className="font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-line">
                <td className="py-3">{variant.sku}</td>
                <td>{variant.product.name}</td>
                <td>{variant.name}</td>
                <td>
                  <form action={updateStock} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={variant.id} />
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={variant.stock}
                      aria-label={`Stock for ${variant.sku}`}
                      className="w-24 border border-line bg-elev px-2 py-2"
                    />
                    <button className="underline">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
