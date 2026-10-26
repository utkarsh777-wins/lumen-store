import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">404</p>
      <h1 className="mt-3 font-serif text-5xl">We cannot find that page.</h1>
      <p className="mt-4 text-muted">The link may be old, or the object may have been retired.</p>
      <Link href="/products" className="mt-8 inline-block bg-ink px-5 py-3 text-sm text-bg">
        Browse the shop
      </Link>
    </div>
  );
}
