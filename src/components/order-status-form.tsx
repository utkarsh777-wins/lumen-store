"use client";

import { useActionState } from "react";

import { updateOrderStatus } from "@/actions/admin";
import { ORDER_STATUSES } from "@/lib/constants";

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  const [state, submit, pending] = useActionState(updateOrderStatus, null);
  const shown = state?.ok && state.status ? state.status : status;

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit(new FormData(event.currentTarget));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <label className="text-sm">
        Status
        <select
          key={shown}
          name="status"
          defaultValue={shown}
          className="mt-1.5 block border border-line bg-elev px-3 py-3"
        >
          {ORDER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <button disabled={pending} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Updating" : "Update status"}
      </button>
      {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.ok && state.message ? <p className="text-sm text-ok">{state.message}</p> : null}
    </form>
  );
}
