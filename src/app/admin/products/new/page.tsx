import { Suspense } from "react";

import { ProductForm } from "@/components/product-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<p>Loading the form…</p>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await getSession();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl">New product</h1>
      <div className="mt-8">
        <ProductForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
      </div>
    </div>
  );
}
