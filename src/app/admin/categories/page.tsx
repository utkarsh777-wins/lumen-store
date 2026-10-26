import { Suspense } from "react";

import { deleteCategory } from "@/actions/admin";
import { CategoryForm } from "@/components/category-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Categories" };

export default function CategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; edit?: string }> }) {
  return (
    <Suspense fallback={<p>Loading categories…</p>}>
      <Categories searchParams={searchParams} />
    </Suspense>
  );
}

async function Categories({ searchParams }: { searchParams: Promise<{ error?: string; edit?: string }> }) {
  await getSession();
  const query = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  const editing = categories.find((category) => category.id === query.edit);
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="font-serif text-4xl">Categories</h1>
        {query.error ? <p className="mt-4 text-sm text-danger">{query.error.replaceAll("+", " ")}</p> : null}
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-muted">{category._count.products} products · /{category.slug}</p>
              </div>
              <div className="flex gap-4">
                <a href={`/admin/categories?edit=${category.id}`} className="underline">
                  Edit
                </a>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button className="text-danger underline">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <CategoryForm
        key={editing?.id ?? "new"}
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                description: editing.description,
                image: editing.image,
              }
            : undefined
        }
      />
    </div>
  );
}
