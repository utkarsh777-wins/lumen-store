import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Button, Container } from "@/components/ui";
import { getCatalog, getCategories } from "@/lib/catalog";
import type { CategoryRecord } from "@/lib/types";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  const featured = products.filter((product) => product.bestSeller).slice(0, 4);
  const edit = products.filter((product) => product.featured).slice(0, 3);
  const ceramics = categories.find((category) => category.slug === "ceramics") ?? categories[0];
  const side = ceramics ? categories.filter((category) => category.id !== ceramics.id) : [];

  return (
    <>
      <section className="relative flex min-h-[78vh] items-end overflow-hidden bg-[#243028] text-[#faf7f2] min-[900px]:items-center">
        <Image
          src="/media/hero.jpg"
          alt="A pale living room with a low sofa, linen, and afternoon light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_60%]"
        />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="relative z-10 w-full px-5 pb-10 pt-16 md:px-10 min-[900px]:mx-auto min-[900px]:max-w-[1440px] min-[900px]:px-12 min-[900px]:py-20">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#faf7f2]/80">The autumn studio edit</p>
            <h1 className="mt-4 font-serif text-[2.6rem] leading-[0.95] text-[#faf7f2] sm:text-5xl md:text-7xl">
              Light, held in the hand.
            </h1>
            <p className="mt-6 max-w-md text-base leading-snug text-[#faf7f2]/90 sm:text-lg">
              Ceramics, linen, lamps, and scent composed for rooms you actually live in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex min-h-11 items-center bg-[#faf7f2] px-5 text-sm text-[#1c1915] hover:bg-white">
                Shop all
              </Link>
              <Link
                href="/products?category=ceramics"
                className="inline-flex min-h-11 items-center border border-[#faf7f2] bg-[rgba(24,22,18,0.42)] px-5 text-sm text-[#faf7f2] hover:bg-[#faf7f2] hover:text-[#1c1915]"
              >
                Shop ceramics
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-bg">
        <Container className="grid grid-cols-1 gap-3 py-5 text-sm text-muted md:grid-cols-3 md:gap-0 md:py-6">
          <p>Free standard shipping over $75</p>
          <p className="md:border-l md:border-line md:px-6">Small batches, honest materials</p>
          <p className="md:border-l md:border-line md:px-6">30-day returns on unused pieces</p>
        </Container>
      </div>

      <Container className="py-16 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-serif text-4xl md:text-5xl">Collections</h2>
          <Link href="/products" className="text-sm underline">
            View the shop
          </Link>
        </div>
        {ceramics ? (
          <div className="mt-8 grid items-start gap-6 md:grid-cols-[1.15fr_1fr]">
            <CollectionPlate category={ceramics} featured />
            <div className="grid gap-6 md:grid-cols-2">
              {side.map((category) => (
                <CollectionPlate key={category.id} category={category} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>

      <section className="bg-highlight">
        <Container className="py-16 md:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Most loved</p>
              <h2 className="mt-2 font-serif text-4xl md:text-5xl">Best sellers</h2>
            </div>
            <Link href="/products?sort=rating" className="text-sm underline">
              Shop by rating
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <Container className="grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
          <Image
            src="/media/story.jpg"
            alt="A sunlit interior with a pale sofa and wood floors"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">The studio</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Made to be reached for, not displayed.</h2>
          <p className="mt-5 max-w-md text-muted">
            Lumen works with small workshops on vessels, cloth, and light. The palette stays narrow so a new piece can
            join a room you already love.
          </p>
          <div className="mt-8">
            <Button href="/about" variant="secondary">
              Read the story
            </Button>
          </div>
        </div>
      </Container>

      {edit.length > 0 ? (
        <Container className="pb-8">
          <h2 className="font-serif text-4xl">From the edit</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {edit.map((product) => (
              <ProductCard key={product.id} product={product} frame="editorial" />
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}

function CollectionPlate({ category, featured = false }: { category: CategoryRecord; featured?: boolean }) {
  return (
    <Link href={`/collections/${category.slug}`} className="group block min-w-0 text-inherit">
      <div className={`relative overflow-hidden bg-sand ${featured ? "aspect-[4/3] md:aspect-[3/4]" : "aspect-[4/3]"}`}>
        <Image
          src={category.image}
          alt=""
          fill
          sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
          className={`object-cover media-zoom ${featured ? "object-bottom" : ""}`}
        />
      </div>
      <div className="pt-3">
        <h3 className={`font-serif leading-tight ${featured ? "text-[1.65rem] md:text-[2.1rem]" : "text-[1.65rem]"}`}>
          {category.name}
        </h3>
        <p className="mt-1 max-w-md text-sm text-muted">{category.description}</p>
      </div>
    </Link>
  );
}
