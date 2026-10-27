"use client";

import Link from "next/link";
import { useRef } from "react";

import { IconClose, IconMenu } from "@/components/icons";
import type { CategoryRecord } from "@/lib/types";

export function MobileNav({ categories }: { categories: CategoryRecord[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={() => dialogRef.current?.showModal()}
      >
        <IconMenu className="h-6 w-6" />
      </button>
      <dialog
        ref={dialogRef}
        className="m-0 h-full max-h-none w-[min(100%,24rem)] bg-bg p-0 text-ink backdrop:bg-ink/40"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="font-serif text-2xl">Lumen</p>
          <form method="dialog">
            <button type="submit" aria-label="Close menu">
              <IconClose className="h-6 w-6" />
            </button>
          </form>
        </div>
        <nav className="flex flex-col gap-1 px-5 py-6 text-lg" aria-label="Mobile">
          <Link href="/products" onClick={() => dialogRef.current?.close()} className="py-2">
            Shop all
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              onClick={() => dialogRef.current?.close()}
              className="py-2"
            >
              {category.name}
            </Link>
          ))}
          <Link href="/about" onClick={() => dialogRef.current?.close()} className="py-2">
            Studio
          </Link>
          <Link href="/account" onClick={() => dialogRef.current?.close()} className="py-2">
            Account
          </Link>
          <Link href="/wishlist" onClick={() => dialogRef.current?.close()} className="py-2">
            Wishlist
          </Link>
          <form action="/products" role="search" className="mt-4">
            <label htmlFor="mobile-search" className="sr-only">
              Search
            </label>
            <input id="mobile-search" name="q" placeholder="Search objects" className="w-full border border-line bg-elev px-3 py-3 text-base" />
          </form>
        </nav>
      </dialog>
    </>
  );
}
