import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Button, Container } from "@/components/ui";
import { getCatalog, getCategories } from "@/lib/catalog";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  const featured = products.filter((product) => product.bestSeller).slice(0, 4);
  const edit = products.filter((product) => product.featured).slice(0, 3);

  return (
    <>
      <section className="grid min-h-[78vh] lg:grid-cols-12">
        <div className="flex flex-col justify-end px-5 py-14 md:px-10 lg:col-span-5 lg:px-12 lg:py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">The autumn studio edit</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] md:text-7xl">Light, held in the hand.</h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Ceramics, linen, lamps, and scent composed for rooms you actually live in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/products">Shop all</Button>
            <Button href="/collections/ceramics" variant="secondary">
              Shop ceramics
            </Button>
          </div>
        </div>
        <div className="relative min-h-[420px] lg:col-span-7">
          <Image
            src="/media/hero.jpg"
            alt="A pale living room with a low sofa, linen, and afternoon light"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <Container className="grid grid-cols-1 gap-6 border-b border-line py-8 text-sm md:grid-cols-3">
        <p>Free standard shipping over $75</p>
        <p>Small batches, honest materials</p>
        <p>30-day returns on unused pieces</p>
      </Container>

      <Container className="py-16 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-serif text-4xl md:text-5xl">Collections</h2>
          <Link href="/products" className="text-sm underline">
            View the shop
          </Link>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-2">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className={`group relative min-h-64 overflow-hidden bg-sand ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="font-serif text-3xl">{category.name}</h3>
                <p className="mt-1 max-w-xs text-sm text-white/85">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
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

      <Container className="grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="relative min-h-[420px]">
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}
