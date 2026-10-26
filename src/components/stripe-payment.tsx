"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

import { createPaymentIntent } from "@/actions/checkout";

const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishable ? loadStripe(publishable) : null;

export function StripePayment({
  shippingMethod,
  onPaid,
}: {
  shippingMethod: string;
  onPaid: (paymentIntentId: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    createPaymentIntent(shippingMethod).then((result) => {
      if (!active) return;
      if (!result.ok) setError(result.error);
      else setClientSecret(result.clientSecret);
    });
    return () => {
      active = false;
    };
  }, [shippingMethod]);

  if (!stripePromise) {
    return <p className="text-sm">Stripe keys are missing. Use the demo payment instead.</p>;
  }
  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {error}
      </p>
    );
  }
  if (!clientSecret) return <p className="text-sm text-muted">Preparing secure payment…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeConfirm onPaid={onPaid} />
    </Elements>
  );
}

function StripeConfirm({ onPaid }: { onPaid: (paymentIntentId: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function pay() {
    if (!stripe || !elements) return;
    setPending(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.href },
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Payment could not be confirmed.");
      return;
    }
    if (result.paymentIntent?.status === "succeeded") {
      setDone(true);
      onPaid(result.paymentIntent.id);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Stripe test mode. Use card 4242 4242 4242 4242.</p>
      <PaymentElement />
      <button type="button" disabled={!stripe || pending || done} className="bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50" onClick={pay}>
        {done ? "Payment received" : pending ? "Confirming" : "Pay now"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
