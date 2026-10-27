"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { placeOrder } from "@/actions/checkout";
import { StripePayment } from "@/components/stripe-payment";
import { inputClass } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { SHIPPING_METHODS, quoteOrder, type ShippingMethodId } from "@/lib/pricing";

type Step = "shipping" | "delivery" | "payment" | "review";

export type CheckoutAddress = {
  email: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone: string;
};

export type CheckoutLine = {
  name: string;
  variantName: string;
  quantity: number;
  unitPriceCents: number;
  image: string | null;
};

const steps: { id: Step; label: string }[] = [
  { id: "shipping", label: "Shipping" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

const emptyAddress: CheckoutAddress = {
  email: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal: "",
  country: "US",
  phone: "",
};

export function CheckoutForm({
  lines,
  mode,
  initialAddress,
  signedIn,
}: {
  lines: CheckoutLine[];
  mode: "mock" | "stripe";
  initialAddress: CheckoutAddress;
  signedIn: boolean;
}) {
  const router = useRouter();
  const idempotencyKey = useRef(crypto.randomUUID());
  const [step, setStep] = useState<Step>("shipping");
  const [address, setAddress] = useState<CheckoutAddress>({ ...emptyAddress, ...initialAddress });
  const [method, setMethod] = useState<ShippingMethodId>("standard");
  const [saveAddress, setSaveAddress] = useState(signedIn);
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const quote = useMemo(
    () =>
      quoteOrder({
        lines: lines.map((line) => ({ unitPriceCents: line.unitPriceCents, quantity: line.quantity })),
        shippingMethod: method,
      }),
    [lines, method],
  );

  function updateAddress(key: keyof CheckoutAddress, value: string) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  function validateShipping() {
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) next.email = "Enter a valid email.";
    if (address.fullName.trim().length < 2) next.fullName = "Enter the recipient's name.";
    if (address.line1.trim().length < 3) next.line1 = "Enter a street address.";
    if (address.city.trim().length < 2) next.city = "Enter a city.";
    if (address.region.trim().length < 2) next.region = "Enter a state or region.";
    if (address.postal.trim().length < 3) next.postal = "Enter a postal code.";
    if (address.country.trim().length !== 2) next.country = "Use a 2-letter country code.";
    setFields(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    setError(null);
    if (step === "shipping") {
      if (!validateShipping()) return;
      setStep("delivery");
      return;
    }
    if (step === "delivery") {
      setStep("payment");
      return;
    }
    if (step === "payment") {
      if (mode === "stripe" && !paymentIntentId) {
        setError("Complete the card payment before reviewing the order.");
        return;
      }
      if (mode === "mock" && card.number.replace(/\D/g, "").length < 13) {
        setError("Enter the demo card before continuing.");
        return;
      }
      setStep("review");
    }
  }

  async function submit() {
    setPending(true);
    setError(null);
    const result = await placeOrder({
      ...address,
      email: address.email.trim().toLowerCase(),
      shippingMethod: method,
      paymentMode: mode,
      cardName: card.name,
      cardNumber: card.number,
      cardExp: card.exp,
      cardCvc: card.cvc,
      paymentIntentId: paymentIntentId ?? "",
      idempotencyKey: idempotencyKey.current,
      saveAddress,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      setFields(result.fields ?? {});
      if (result.fields?.email || result.fields?.line1 || result.fields?.fullName) setStep("shipping");
      if (result.fields?.cardNumber || result.fields?.cardExp || result.fields?.paymentIntentId) setStep("payment");
      return;
    }
    router.push(`/checkout/confirmation/${result.orderId}?token=${encodeURIComponent(result.token)}`);
  }

  const stepIndex = steps.findIndex((entry) => entry.id === step);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <ol aria-label="Checkout progress" className="flex flex-wrap gap-4 text-sm">
          {steps.map((entry, index) => (
            <li key={entry.id}>
              <button
                type="button"
                disabled={index > stepIndex}
                aria-current={entry.id === step ? "step" : undefined}
                className={entry.id === step ? "underline" : "text-muted disabled:opacity-50"}
                onClick={() => {
                  if (index < stepIndex) setStep(entry.id);
                }}
              >
                {index + 1}. {entry.label}
              </button>
            </li>
          ))}
        </ol>

        {error ? (
          <p role="alert" className="mt-6 border border-danger/40 bg-highlight px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {step === "shipping" ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <TextField label="Email" name="email" type="email" autoComplete="email" value={address.email} error={fields.email} onChange={(value) => updateAddress("email", value)} />
            <TextField label="Full name" name="fullName" autoComplete="name" value={address.fullName} error={fields.fullName} onChange={(value) => updateAddress("fullName", value)} />
            <TextField className="sm:col-span-2" label="Address" name="line1" autoComplete="address-line1" value={address.line1} error={fields.line1} onChange={(value) => updateAddress("line1", value)} />
            <TextField className="sm:col-span-2" label="Apartment, suite (optional)" name="line2" autoComplete="address-line2" value={address.line2} onChange={(value) => updateAddress("line2", value)} />
            <TextField label="City" name="city" autoComplete="address-level2" value={address.city} error={fields.city} onChange={(value) => updateAddress("city", value)} />
            <TextField label="State or region" name="region" autoComplete="address-level1" value={address.region} error={fields.region} onChange={(value) => updateAddress("region", value)} />
            <TextField label="Postal code" name="postal" autoComplete="postal-code" value={address.postal} error={fields.postal} onChange={(value) => updateAddress("postal", value)} />
            <TextField label="Country" name="country" autoComplete="country" value={address.country} error={fields.country} onChange={(value) => updateAddress("country", value)} />
            <TextField className="sm:col-span-2" label="Phone (optional)" name="phone" autoComplete="tel" value={address.phone} onChange={(value) => updateAddress("phone", value)} />
            {signedIn ? (
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
                Save this address to my account
              </label>
            ) : null}
          </div>
        ) : null}

        {step === "delivery" ? (
          <fieldset className="mt-8 space-y-3">
            <legend className="sr-only">Delivery method</legend>
            {SHIPPING_METHODS.map((option) => {
              const cost = option.id === "standard" && quote.subtotalCents >= 7500 ? 0 : option.cents;
              return (
                <label key={option.id} className="flex cursor-pointer items-center justify-between gap-4 border border-line px-4 py-4 has-[:checked]:border-ink">
                  <span>
                    <input
                      type="radio"
                      name="shippingMethod"
                      className="mr-3"
                      checked={method === option.id}
                      onChange={() => {
                        setMethod(option.id);
                        setPaymentIntentId(null);
                      }}
                    />
                    <span className="font-medium">{option.label}</span>
                    <span className="mt-1 block pl-6 text-sm text-muted">{option.detail}</span>
                  </span>
                  <span className="tabular-nums">{cost === 0 ? "Free" : formatMoney(cost)}</span>
                </label>
              );
            })}
          </fieldset>
        ) : null}

        {step === "payment" ? (
          <div className="mt-8">
            {mode === "mock" ? (
              <div className="space-y-4">
                <div className="border border-line bg-highlight px-4 py-3 text-sm">
                  <p className="font-medium">Demo payment. No charge will be made.</p>
                  <p className="mt-1 text-muted">
                    Use 4242 4242 4242 4242, any future expiry, and any 3-digit CVC. The number 4000 0000 0000 0002 simulates a decline.
                  </p>
                </div>
                <TextField label="Name on card" name="cardName" autoComplete="cc-name" value={card.name} error={fields.cardName} onChange={(value) => setCard((current) => ({ ...current, name: value }))} />
                <TextField label="Card number" name="cardNumber" autoComplete="cc-number" inputMode="numeric" value={card.number} error={fields.cardNumber} onChange={(value) => setCard((current) => ({ ...current, number: value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <TextField label="Expiry" name="cardExp" autoComplete="cc-exp" placeholder="MM/YY" value={card.exp} error={fields.cardExp} onChange={(value) => setCard((current) => ({ ...current, exp: value }))} />
                  <TextField label="CVC" name="cardCvc" autoComplete="cc-csc" inputMode="numeric" value={card.cvc} error={fields.cardCvc} onChange={(value) => setCard((current) => ({ ...current, cvc: value }))} />
                </div>
              </div>
            ) : (
              <StripePayment
                key={method}
                shippingMethod={method}
                onPaid={(id) => {
                  setPaymentIntentId(id);
                  setError(null);
                }}
              />
            )}
          </div>
        ) : null}

        {step === "review" ? (
          <div className="mt-8 space-y-6 text-sm">
            <section>
              <h2 className="font-serif text-2xl">Ship to</h2>
              <p className="mt-2">
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.region} {address.postal}
                <br />
                {address.country.toUpperCase()}
                <br />
                {address.email}
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Delivery</h2>
              <p className="mt-2">{SHIPPING_METHODS.find((option) => option.id === method)?.label}</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Payment</h2>
              <p className="mt-2">{mode === "stripe" ? "Card via Stripe test mode" : "Demo card, no charge"}</p>
            </section>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          {stepIndex > 0 ? (
            <button type="button" className="border border-ink px-5 py-3 text-sm" onClick={() => setStep(steps[stepIndex - 1].id)}>
              Back
            </button>
          ) : null}
          {step !== "review" ? (
            <button type="button" className="bg-ink px-5 py-3 text-sm text-bg" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button type="button" disabled={pending} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50" onClick={submit}>
              {pending ? "Placing order" : `Place order · ${formatMoney(quote.totalCents)}`}
            </button>
          )}
        </div>
      </div>
      <aside className="h-fit border border-line bg-elev p-5 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Your bag</h2>
        <ul className="mt-4 space-y-4">
          {lines.map((line) => (
            <li key={`${line.name}-${line.variantName}`} className="flex justify-between gap-4 text-sm">
              <span>
                {line.name}
                <span className="block text-muted">
                  {line.variantName} · {line.quantity}
                </span>
              </span>
              <span className="tabular-nums">{formatMoney(line.unitPriceCents * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          <Row label="Subtotal" value={formatMoney(quote.subtotalCents)} />
          <Row label="Shipping" value={quote.shippingCents === 0 ? "Free" : formatMoney(quote.shippingCents)} />
          <Row label="Tax" value={formatMoney(quote.taxCents)} />
          <div className="flex justify-between pt-2 text-base">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(quote.totalCents)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Tax is an 8% estimate on the merchandise subtotal.</p>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  className,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`} htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} mt-1.5`}
      />
      {error ? (
        <span id={`${name}-error`} className="mt-1 block text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
