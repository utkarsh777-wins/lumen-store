import { describe, expect, it } from "vitest";

import { addLine, assertStock, cartCount, removeLine, setLineQuantity } from "@/lib/cart-math";
import { queryCatalog, relatedProducts } from "@/lib/catalog-query";
import { dollarsToCents, formatMoney } from "@/lib/money";
import { assessMockCard } from "@/lib/payments";
import { quoteOrder, shippingCost } from "@/lib/pricing";
import { slugify } from "@/lib/slug";
import { parseCheckout } from "@/lib/validation";

const NOW = new Date("2026-10-26T12:00:00Z");

const sample = [
  item("a", "Arc Pourer", 6800, "ceramics", true, false, "2026-01-01", 12, 4.8),
  item("b", "Hearth Mug", 4200, "ceramics", false, true, "2026-02-01", 0, 4.2),
  item("c", "Oat Throw", 12800, "textiles", true, true, "2026-03-01", 4, 5),
  item("d", "Night Oil", 7800, "fragrance", false, false, "2026-08-01", 9, 3.5),
];

function item(
  id: string,
  name: string,
  priceCents: number,
  categorySlug: string,
  featured: boolean,
  bestSeller: boolean,
  createdAt: string,
  stock: number,
  rating: number,
) {
  return {
    id,
    name,
    slug: id,
    description: `${name} for the table`,
    priceCents,
    categorySlug,
    categoryName: categorySlug,
    featured,
    bestSeller,
    createdAt,
    stock,
    rating,
    reviewCount: 2,
  };
}

describe("pricing", () => {
  it("formats cents as USD", () => {
    expect(formatMoney(6800)).toBe("$68.00");
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("rounds dollar inputs to cents", () => {
    expect(dollarsToCents(18.5)).toBe(1850);
    expect(dollarsToCents(0.1 + 0.2)).toBe(30);
  });

  it("compounds subtotal, shipping, and tax", () => {
    const quote = quoteOrder({
      lines: [
        { unitPriceCents: 4200, quantity: 2 },
        { unitPriceCents: 1800, quantity: 1 },
      ],
      shippingMethod: "express",
    });
    expect(quote.subtotalCents).toBe(10200);
    expect(quote.shippingCents).toBe(1800);
    expect(quote.taxCents).toBe(816);
    expect(quote.totalCents).toBe(12816);
  });

  it("waives standard shipping at $75 and keeps express paid", () => {
    expect(shippingCost("standard", 7500)).toBe(0);
    expect(shippingCost("standard", 7499)).toBe(800);
    expect(shippingCost("express", 20000)).toBe(1800);
    expect(shippingCost("overnight", 20000)).toBe(3200);
  });
});

describe("cart math", () => {
  const base = [{ variantId: "v1", productId: "p1", quantity: 1 }];

  it("merges quantities for the same variant", () => {
    const next = addLine(base, { variantId: "v1", productId: "p1", quantity: 2 });
    expect(next).toEqual([{ variantId: "v1", productId: "p1", quantity: 3 }]);
    expect(cartCount(next)).toBe(3);
  });

  it("adds a distinct variant and drops zero quantities", () => {
    const added = addLine(base, { variantId: "v2", productId: "p2", quantity: 1 });
    expect(added).toHaveLength(2);
    expect(setLineQuantity(added, "v2", 0)).toEqual(base);
    expect(removeLine(added, "v1")).toEqual([{ variantId: "v2", productId: "p2", quantity: 1 }]);
  });

  it("rejects quantities the shelf cannot cover", () => {
    expect(assertStock(2, 2)).toEqual({ ok: true });
    expect(assertStock(3, 2).ok).toBe(false);
    expect(assertStock(1, 0)).toEqual({ ok: false, error: "This item is sold out." });
    expect(assertStock(0, 4).ok).toBe(false);
  });
});

describe("mock payment", () => {
  const valid = {
    name: "Ada Lovelace",
    number: "4242 4242 4242 4242",
    exp: "10/28",
    cvc: "123",
  };

  it("accepts a luhn-valid future card", () => {
    expect(assessMockCard(valid, NOW)).toEqual({ ok: true, last4: "4242" });
  });

  it("declines the dedicated test card and rejects bad input", () => {
    expect(assessMockCard({ ...valid, number: "4000 0000 0000 0002" }, NOW)).toMatchObject({
      ok: false,
      field: "cardNumber",
      error: "Your card was declined.",
    });
    expect(assessMockCard({ ...valid, number: "4242424242424241" }, NOW).ok).toBe(false);
    expect(assessMockCard({ ...valid, exp: "09/26" }, NOW)).toMatchObject({
      ok: false,
      field: "cardExp",
    });
    expect(assessMockCard({ ...valid, cvc: "12" }, NOW)).toMatchObject({ ok: false, field: "cardCvc" });
  });
});

describe("checkout schema", () => {
  const payload = {
    email: "ada@example.com",
    fullName: "Ada Lovelace",
    line1: "12 Lamp Row",
    line2: "",
    city: "Portland",
    region: "OR",
    postal: "97205",
    country: "us",
    phone: "",
    shippingMethod: "standard",
    paymentMode: "mock" as const,
    cardName: "Ada Lovelace",
    cardNumber: "4242424242424242",
    cardExp: "12/28",
    cardCvc: "123",
    idempotencyKey: "checkout-key-1",
  };

  it("accepts a complete mock checkout and uppercases the country", () => {
    const parsed = parseCheckout(payload, NOW);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.country).toBe("US");
  });

  it("reports the first problem on each field", () => {
    const parsed = parseCheckout(
      { ...payload, email: "not-an-email", shippingMethod: "pigeon", cardNumber: "4000000000000002" },
      NOW,
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.issues.map((issue) => String(issue.path[0]));
      expect(fields).toContain("email");
      expect(fields).toContain("shippingMethod");
      expect(fields).toContain("cardNumber");
    }
  });

  it("requires a payment intent for Stripe", () => {
    const parsed = parseCheckout({ ...payload, paymentMode: "stripe", paymentIntentId: "" }, NOW);
    expect(parsed.success).toBe(false);
  });
});

describe("catalog query", () => {
  it("filters, sorts, and paginates", () => {
    const ceramics = queryCatalog(sample, { category: "ceramics", sort: "price-asc", pageSize: 1, page: 2 });
    expect(ceramics.total).toBe(2);
    expect(ceramics.pageCount).toBe(2);
    expect(ceramics.items.map((product) => product.id)).toEqual(["a"]);

    const searched = queryCatalog(sample, { q: "oil" });
    expect(searched.items.map((product) => product.id)).toEqual(["d"]);

    const available = queryCatalog(sample, { inStock: true, sort: "rating" });
    expect(available.items.map((product) => product.id)).toEqual(["c", "a", "d"]);
  });

  it("clamps an out-of-range page and finds related objects", () => {
    const result = queryCatalog(sample, { page: 99, pageSize: 2 });
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(relatedProducts(sample, sample[0]).map((product) => product.id)).toEqual(["b", "c"]);
  });

  it("slugifies names", () => {
    expect(slugify(" Fig Leaf Candle! ")).toBe("fig-leaf-candle");
  });
});
