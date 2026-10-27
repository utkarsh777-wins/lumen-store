"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-start justify-center px-6">
      <h1 className="font-serif text-5xl">Something went wrong</h1>
      <p className="mt-4 text-muted">The page did not finish loading. You can try it again.</p>
      <button type="button" onClick={reset} className="mt-8 border border-ink px-5 py-3 text-sm">
        Try again
      </button>
    </div>
  );
}
