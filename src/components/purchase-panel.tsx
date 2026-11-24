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
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-3">
            {colors.map((color) => {
              const swatch = variants.find((entry) => entry.color === color);
              const available = variants.some((entry) => entry.color === color && entry.stock > 0);
              const selected = variant.color === color;
              return (
                <label
                  key={color}
                  className={`grid min-h-11 min-w-11 justify-items-center gap-1.5 text-xs text-muted ${available ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <input
                    type="radio"
                    name="color"
                    className="peer sr-only"
                    checked={selected}
                    disabled={!available}
                    onChange={() => {
                      if (available) select({ color });
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className={`relative block h-10 w-10 border border-line peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-2 peer-checked:ring-offset-bg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-accent ${available ? "" : "color-soldout"}`}
                    style={{ background: swatch?.colorHex ?? "#ddd" }}
                  />
                  <span>
                    {color}
                    {available ? null : <span className="sr-only">, sold out</span>}
                  </span>
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
                  <span className="inline-flex min-h-11 items-center border border-line px-3 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg">
                    {size}
                    {!available ? " · sold out" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center border border-line" role="group" aria-label="Quantity">
          <button
            type="button"
            className="h-11 w-11 text-lg disabled:opacity-40"
            aria-label="Decrease quantity"
            disabled={soldOut || qty <= 1}
            onClick={() => setQty((current) => Math.max(1, current - 1))}
          >
            −
          </button>
          <span className="min-w-8 text-center tabular-nums">{qty}</span>
          <button
            type="button"
            className="h-11 w-11 text-lg disabled:opacity-40"
            aria-label="Increase quantity"
            disabled={soldOut || qty >= Math.max(variant.stock, 1)}
            onClick={() => setQty((current) => Math.min(Math.max(variant.stock, 1), current + 1))}
          >
            +
          </button>
        </div>
        <div className="flex min-w-0 flex-1 items-stretch gap-3">
          <Button type="submit" disabled={pending || soldOut} className="min-w-0 flex-1">
            {soldOut ? "Sold out" : pending ? "Adding" : "Add to bag"}
          </Button>
          <WishlistButton productId={productId} variant="inline" />
        </div>
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
