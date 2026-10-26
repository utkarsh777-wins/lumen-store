"use client";

import { useActionState } from "react";

import { saveAddress, updateProfile } from "@/actions/auth";
import { inputClass } from "@/components/ui";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">
        Name
        <input name="name" defaultValue={name} required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" defaultValue={email} required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Current password
        <input name="currentPassword" type="password" autoComplete="current-password" className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        New password
        <input name="newPassword" type="password" autoComplete="new-password" className={`${inputClass} mt-1.5`} />
      </label>
      <p className="text-xs text-muted">Leave the password fields blank to keep your current password.</p>
      <Status state={state} />
      <button disabled={pending} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Saving" : "Save profile"}
      </button>
    </form>
  );
}

export function AddressForm({
  address,
}: {
  address: {
    fullName: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postal: string;
    country: string;
    phone: string;
  };
}) {
  const [state, action, pending] = useActionState(saveAddress, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">
        Full name
        <input name="fullName" defaultValue={address.fullName} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Address
        <input name="line1" defaultValue={address.line1} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Apartment
        <input name="line2" defaultValue={address.line2} className={`${inputClass} mt-1.5`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          City
          <input name="city" defaultValue={address.city} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          Region
          <input name="region" defaultValue={address.region} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          Postal code
          <input name="postal" defaultValue={address.postal} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          Country
          <input name="country" defaultValue={address.country} className={`${inputClass} mt-1.5`} />
        </label>
      </div>
      <label className="block text-sm">
        Phone
        <input name="phone" defaultValue={address.phone} className={`${inputClass} mt-1.5`} />
      </label>
      <Status state={state} />
      <button disabled={pending} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">
        {pending ? "Saving" : "Save address"}
      </button>
    </form>
  );
}

function Status({ state }: { state: { error?: string; message?: string } | null }) {
  if (state?.error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state?.message) {
    return (
      <p role="status" className="text-sm text-ok">
        {state.message}
      </p>
    );
  }
  return null;
}
