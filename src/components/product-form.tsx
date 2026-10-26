"use client";

import { useActionState, useState } from "react";

import { saveProduct } from "@/actions/admin";
import { inputClass } from "@/components/ui";
import { slugify } from "@/lib/slug";

type VariantDraft = {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  stock: string;
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    details: string;
    price: string;
    compareAt: string;
    categoryId: string;
    featured: boolean;
    bestSeller: boolean;
    images: string;
    variants: VariantDraft[];
  };
}) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [variants, setVariants] = useState<VariantDraft[]>(
    initial?.variants ?? [{ sku: "", size: "", color: "", colorHex: "", price: "", stock: "10" }],
  );

  return (
    <form action={action} className="space-y-5">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Name
          <input name="name" value={name} onChange={(event) => setName(event.target.value)} required className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Slug
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            onBlur={() => {
              if (!slug) setSlug(slugify(name));
            }}
            required
            className={`${inputClass} mt-1.5`}
          />
        </label>
      </div>
      <label className="block text-sm">
        Description
        <textarea name="description" required defaultValue={initial?.description} rows={3} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Details
        <textarea name="details" required defaultValue={initial?.details} rows={6} className={`${inputClass} mt-1.5`} />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          Price (USD)
          <input name="price" required defaultValue={initial?.price ?? ""} inputMode="decimal" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Compare-at price
          <input name="compareAt" defaultValue={initial?.compareAt ?? ""} inputMode="decimal" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Category
          <select name="categoryId" defaultValue={initial?.categoryId ?? categories[0]?.id} className={`${inputClass} mt-1.5`}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="bestSeller" defaultChecked={initial?.bestSeller} /> Best seller
        </label>
      </div>
      <label className="block text-sm">
        Images, one path or URL per line
        <textarea name="images" required defaultValue={initial?.images} rows={3} className={`${inputClass} mt-1.5`} />
      </label>
      <fieldset className="space-y-3">
        <legend className="text-sm">Variants</legend>
        {variants.map((variant, index) => (
          <div key={index} className="grid gap-2 border border-line p-3 md:grid-cols-6">
            {(["sku", "size", "color", "colorHex", "price", "stock"] as const).map((key) => (
              <label key={key} className="text-xs">
                {key === "colorHex" ? "Hex" : key === "price" ? "Price override" : key}
                <input
                  value={variant[key]}
                  onChange={(event) =>
                    setVariants((current) => current.map((entry, i) => (i === index ? { ...entry, [key]: event.target.value } : entry)))
                  }
                  className={`${inputClass} mt-1`}
                />
              </label>
            ))}
            <button
              type="button"
              className="text-left text-sm underline md:col-span-6"
              onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}
            >
              Remove variant
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm underline"
          onClick={() => setVariants((current) => [...current, { sku: "", size: "", color: "", colorHex: "", price: "", stock: "0" }])}
        >
          Add variant
        </button>
      </fieldset>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button disabled={pending} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Saving" : "Save product"}
      </button>
    </form>
  );
}
