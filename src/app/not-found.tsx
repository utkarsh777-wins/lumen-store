import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-start justify-center px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">404</p>
      <h1 className="mt-3 font-serif text-5xl">That page has left the room.</h1>
      <p className="mt-4 text-muted">The link may be old, or the object may have been retired.</p>
      <Link href="/products" className="mt-8 bg-ink px-5 py-3 text-sm text-bg">
        Browse the shop
      </Link>
    </div>
  );
}
