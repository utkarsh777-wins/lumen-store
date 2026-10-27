"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, register } from "@/actions/auth";
import { inputClass } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block text-sm">
        Email
        <input name="email" type="email" autoComplete="email" required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={`${inputClass} mt-1.5`} />
      </label>
      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="w-full bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Signing in" : "Sign in"}
      </button>
      <p className="text-sm text-muted">
        New here? <Link href="/account/register" className="underline">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">
        Name
        <input name="name" autoComplete="name" required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" autoComplete="email" required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={`${inputClass} mt-1.5`} />
      </label>
      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="w-full bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Creating account" : "Create account"}
      </button>
      <p className="text-sm text-muted">
        Already have an account? <Link href="/account/login" className="underline">Sign in</Link>
      </p>
    </form>
  );
}
