export type CartLineInput = {
  variantId: string;
  productId: string;
  quantity: number;
};

export function addLine(lines: CartLineInput[], line: CartLineInput): CartLineInput[] {
  const quantity = Math.max(1, Math.floor(line.quantity));
  const index = lines.findIndex((entry) => entry.variantId === line.variantId);
  if (index === -1) {
    return [...lines, { ...line, quantity }];
  }
  return lines.map((entry, i) =>
    i === index ? { ...entry, quantity: entry.quantity + quantity } : entry,
  );
}

export function setLineQuantity(
  lines: CartLineInput[],
  variantId: string,
  quantity: number,
): CartLineInput[] {
  if (quantity <= 0) {
    return lines.filter((entry) => entry.variantId !== variantId);
  }
  return lines.map((entry) =>
    entry.variantId === variantId ? { ...entry, quantity: Math.floor(quantity) } : entry,
  );
}

export function removeLine(lines: CartLineInput[], variantId: string): CartLineInput[] {
  return lines.filter((entry) => entry.variantId !== variantId);
}

export function cartCount(lines: { quantity: number }[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function assertStock(
  requested: number,
  available: number,
): { ok: true } | { ok: false; error: string } {
  if (!Number.isInteger(requested) || requested < 1) {
    return { ok: false, error: "Quantity must be at least 1." };
  }
  if (available <= 0 || requested > available) {
    return {
      ok: false,
      error: available <= 0 ? "This item is sold out." : `Only ${available} left in stock.`,
    };
  }
  return { ok: true };
}
