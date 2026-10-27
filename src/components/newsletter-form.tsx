"use client";

import { useActionState } from "react";

import { subscribeNewsletter } from "@/actions/content";
import { inputClass } from "@/components/ui";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  return (
    <form action={action} className="mt-6 max-w-sm">
      <label htmlFor="newsletter-email" className="text-sm">
        Notes from the studio
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className={inputClass}
          aria-describedby={state?.error ? "newsletter-error" : undefined}
        />
        <button type="submit" disabled={pending} className="shrink-0 bg-ink px-4 text-sm text-bg disabled:opacity-50">
          {pending ? "Joining" : "Join"}
        </button>
      </div>
      {state?.error ? (
        <p id="newsletter-error" className="mt-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.message ? (
        <p className="mt-2 text-sm text-ok" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
