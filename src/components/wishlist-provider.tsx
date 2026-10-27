"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { readWishlist } from "@/actions/wishlist";

type WishlistContextValue = {
  ids: string[] | null;
  setIds: (ids: string[] | null) => void;
};

const WishlistContext = createContext<WishlistContextValue>({ ids: null, setIds: () => undefined });

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    readWishlist()
      .then((next) => {
        if (active) setIds(next);
      })
      .catch(() => {
        if (active) setIds([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return <WishlistContext.Provider value={{ ids, setIds }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
