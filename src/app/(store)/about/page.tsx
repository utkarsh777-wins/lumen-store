import Image from "next/image";

import { Container } from "@/components/ui";

export const metadata = {
  title: "The studio",
  description: "Lumen is a house studio for ceramics, linen, lighting, and scent.",
};

export default function AboutPage() {
  return (
    <Container className="grid items-start gap-10 py-14 md:grid-cols-2 md:py-20">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">About</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">A narrower palette, on purpose.</h1>
        <div className="mt-6 space-y-4 text-muted">
          <p>
            Lumen started as a table and a lamp. The brief has stayed the same: objects with a quiet hand, in colors that
            already live in most rooms.
          </p>
          <p>
            We work with small workshops. Glazes are mixed in short runs. Linen is washed before it is cut. Nothing in the
            shop is a limited drop, and nothing is made to shout from a shelf.
          </p>
          <p>
            If a piece can be used every day and still look considered in ten years, it belongs here.
          </p>
        </div>
      </div>
      <div className="relative min-h-[480px]">
        <Image src="/media/editorial.jpg" alt="A living room with a low sofa and warm afternoon light" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    </Container>
  );
}
