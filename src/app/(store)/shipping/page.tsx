import { Container } from "@/components/ui";

export const metadata = {
  title: "Shipping and returns",
  description: "How Lumen ships orders and handles returns.",
};

export default function ShippingPage() {
  return (
    <Container className="max-w-3xl py-14">
      <h1 className="font-serif text-5xl">Shipping and returns</h1>
      <div className="mt-8 space-y-6 text-muted">
        <section>
          <h2 className="font-serif text-2xl text-ink">Shipping</h2>
          <p className="mt-2">Orders leave the studio within two business days. Standard delivery is 5 to 7 business days and is free over $75. Express is 2 to 3 business days. Overnight is the next business day when placed before noon.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-ink">Returns</h2>
          <p className="mt-2">Unused items can come back within 30 days. Candles that have been burned, and opened bath products, are final sale. Write to returns@lumen.studio with your order number and we will send a label.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-ink">Tax</h2>
          <p className="mt-2">Checkout estimates tax at 8% of the merchandise subtotal. It is a demonstration rate, not a jurisdiction-by-jurisdiction calculation.</p>
        </section>
      </div>
    </Container>
  );
}
