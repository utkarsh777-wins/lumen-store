"use client";

import { useActionState, useState } from "react";

import { updateOrderStatus } from "@/actions/admin";
import { ORDER_STATUSES } from "@/lib/constants";

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(updateOrderStatus, null);
  const [value, setValue] = useState(status);
  const [synced, setSynced] = useState(status);
  if (status !== synced) {
    setSynced(status);
    setValue(status);
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="text-sm">
        Status
        <select
          name="status"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-1.5 block border border-line bg-elev px-3 py-3"
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
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
