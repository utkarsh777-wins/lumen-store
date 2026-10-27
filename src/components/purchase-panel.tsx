"use client";

import { useActionState, useMemo, useState } from "react";

import { addToCart } from "@/actions/cart";
import { WishlistButton } from "@/components/wishlist-button";
import { Button, Price } from "@/components/ui";
import type { CatalogVariant } from "@/lib/types";

function pickVariant(variants: CatalogVariant[], color: string | null, size: string | null) {
  const matches = variants.filter(
    (variant) => (color ? variant.color === color : true) && (size ? variant.size === size : true),
  );
  const pool = matches.length ? matches : variants.filter((variant) => (color ? variant.color === color : true));
  return pool.find((variant) => variant.stock > 0) ?? pool[0] ?? variants[0];
}

export function PurchasePanel({
  productId,
  productName,
  variants,
  compareAtCents,
}: {
  productId: string;
  productName: string;
  variants: CatalogVariant[];
  compareAtCents: number | null;
}) {
  const initial = variants.find((variant) => variant.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(initial.id);
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState(addToCart, null);
  const variant = variants.find((entry) => entry.id === variantId) ?? initial;

  const colors = useMemo(
    () => [...new Set(variants.map((entry) => entry.color).filter((value): value is string => Boolean(value)))],
    [variants],
  );
  const sizes = useMemo(
    () => [...new Set(variants.map((entry) => entry.size).filter((value): value is string => Boolean(value)))],
    [variants],
  );

  function select(next: { color?: string | null; size?: string | null }) {
    const chosen = pickVariant(
      variants,
      next.color === undefined ? variant.color : next.color,
      next.size === undefined ? variant.size : next.size,
    );
    setVariantId(chosen.id);
    setQty(1);
  }

  const soldOut = variant.stock <= 0;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="variantId" value={variant.id} />
      <input type="hidden" name="quantity" value={qty} />
      <Price cents={variant.priceCents} compare={compareAtCents} className="text-lg" />
      <p className={soldOut ? "text-sm text-danger" : "text-sm text-ok"} role="status">
        {soldOut ? "Sold out" : variant.stock <= 5 ? `Low stock, ${variant.stock} left` : "In stock"}
      </p>

      {colors.length > 0 ? (
        <fieldset>
          <legend className="text-sm">Color · {variant.color}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => {
              const swatch = variants.find((entry) => entry.color === color);
              const selected = variant.color === color;
              return (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    className="peer sr-only"
                    checked={selected}
                    onChange={() => select({ color })}
                  />
                  <span
                    className="block h-9 w-9 border border-line peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-2 peer-checked:ring-offset-bg"
                    style={{ background: swatch?.colorHex ?? "#ddd" }}
                  />
                  <span className="sr-only">{color}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {sizes.length > 0 ? (
        <fieldset>
          <legend className="text-sm">Size · {variant.size}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = variants.some(
                (entry) => entry.size === size && (!variant.color || entry.color === variant.color) && entry.stock > 0,
              );
              return (
                <label key={size} className="cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    className="peer sr-only"
                    checked={variant.size === size}
                    onChange={() => select({ size })}
                  />
                  <span className="block border border-line px-3 py-2 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg">
                    {size}
                    {!available ? " · sold out" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Quantity
          <input
            type="number"
            min={1}
            max={Math.max(variant.stock, 1)}
            value={qty}
            onChange={(event) => setQty(Math.max(1, Math.min(Number(event.target.value) || 1, Math.max(variant.stock, 1))))}
            className="mt-2 w-24 border border-line bg-elev px-3 py-3"
            disabled={soldOut}
          />
        </label>
        <Button type="submit" disabled={pending || soldOut} className="min-w-40">
          {soldOut ? "Sold out" : pending ? "Adding" : "Add to bag"}
        </Button>
        <WishlistButton productId={productId} className="border border-line bg-transparent shadow-none" />
      </div>
      <p className="sr-only">Selected {productName}</p>
      <div aria-live="polite">
        {state?.ok ? (
          <p className="text-sm">
            {state.message}{" "}
            <a href="/cart" className="underline">
              View bag
            </a>
          </p>
        ) : null}
        {state && !state.ok ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
