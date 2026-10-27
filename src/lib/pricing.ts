export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

export const SHIPPING_METHODS = [
  {
    id: "standard",
    label: "Standard",
    detail: "5–7 business days",
    cents: 800,
  },
  {
    id: "express",
    label: "Express",
    detail: "2–3 business days",
    cents: 1800,
  },
  {
    id: "overnight",
    label: "Overnight",
    detail: "Next business day",
    cents: 3200,
  },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];

export type PricedLine = {
  unitPriceCents: number;
  quantity: number;
};

export function lineTotal(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

export function subtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line.unitPriceCents, line.quantity), 0);
}

export function shippingCost(method: ShippingMethodId, subtotalCents: number): number {
  const found = SHIPPING_METHODS.find((entry) => entry.id === method);
  if (!found) {
    throw new Error(`Unknown shipping method: ${method}`);
  }
  if (method === "standard" && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 0;
  }
  return found.cents;
}

export function taxCents(subtotalCents: number): number {
  return Math.round(subtotalCents * TAX_RATE);
}

export function quoteOrder(input: { lines: PricedLine[]; shippingMethod: ShippingMethodId }) {
  const subtotalCents = subtotal(input.lines);
  const shippingCents = shippingCost(input.shippingMethod, subtotalCents);
  const tax = taxCents(subtotalCents);
  return {
    subtotalCents,
    shippingCents,
    taxCents: tax,
    totalCents: subtotalCents + shippingCents + tax,
  };
}

export function isShippingMethod(value: string): value is ShippingMethodId {
  return SHIPPING_METHODS.some((method) => method.id === value);
}
