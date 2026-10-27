"use client";

import { useActionState } from "react";

import { submitReview } from "@/actions/content";
import { inputClass } from "@/components/ui";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(submitReview, null);
  return (
    <form action={action} className="space-y-4 border border-line p-5">
      <input type="hidden" name="productId" value={productId} />
      <h3 className="font-serif text-2xl">Write a review</h3>
      <label className="block text-sm">
        Rating
        <select name="rating" defaultValue="5" className={`${inputClass} mt-2`}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Title
        <input name="title" required minLength={3} maxLength={80} className={`${inputClass} mt-2`} />
      </label>
      <label className="block text-sm">
        Review
        <textarea name="body" required minLength={10} maxLength={800} rows={4} className={`${inputClass} mt-2`} />
      </label>
      <button type="submit" disabled={pending} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Publishing" : "Publish review"}
      </button>
      {state?.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.message ? (
        <p className="text-sm text-ok" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
