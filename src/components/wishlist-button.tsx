"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toggleWishlist } from "@/actions/wishlist";
import { IconHeart } from "@/components/icons";
import { useWishlist } from "@/components/wishlist-provider";

export function WishlistButton({
  productId,
  variant = "floating",
}: {
  productId: string;
  variant?: "floating" | "inline";
}) {
  const { ids, setIds } = useWishlist();
  const saved = ids?.includes(productId) ?? false;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        disabled={pending}
        className={
          variant === "inline"
            ? "grid h-11 w-11 shrink-0 place-items-center border border-line bg-transparent text-ink hover:text-accent disabled:opacity-60"
            : "grid h-11 w-11 place-items-center rounded-full bg-elev/90 text-ink shadow-sm hover:text-accent disabled:opacity-60"
        }
        onClick={() => {
          setError(null);
          const next = saved ? (ids ?? []).filter((id) => id !== productId) : [...(ids ?? []), productId];
          setIds(next);
          start(async () => {
            const result = await toggleWishlist(productId);
            if (!result.ok) {
              setIds(ids);
              setError(result.error);
              return;
            }
            setIds(result.ids);
            router.refresh();
          });
        }}
      >
        <IconHeart filled={saved} className="h-5 w-5" />
      </button>
      {error ? <span className="sr-only">{error}</span> : null}
    </>
  );
}
