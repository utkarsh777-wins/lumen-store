"use client";

import { useActionState } from "react";

import { saveCategory } from "@/actions/admin";
import { inputClass } from "@/components/ui";

export function CategoryForm({
  initial,
}: {
  initial?: { id: string; name: string; slug: string; description: string; image: string };
}) {
  const [state, action, pending] = useActionState(saveCategory, null);
  return (
    <form action={action} className="grid gap-3 border border-line p-4">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <label className="text-sm">
        Name
        <input name="name" required defaultValue={initial?.name} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Slug
        <input name="slug" defaultValue={initial?.slug} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Description
        <textarea name="description" required defaultValue={initial?.description} rows={3} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Image path
        <input name="image" required defaultValue={initial?.image} className={`${inputClass} mt-1.5`} />
      </label>
      {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button disabled={pending} className="bg-ink px-4 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Saving" : initial ? "Update category" : "Add category"}
      </button>
    </form>
  );
}
