import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/components/wishlist-button";
import { Badge, Price } from "@/components/ui";
import type { CatalogProduct } from "@/lib/types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const prices = product.variants.map((variant) => variant.priceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const image = product.images[0];
  const hover = product.images[1];

  return (
    <article className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-sand">
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : null}
          {hover ? (
            <Image
              src={hover.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover opacity-0 transition duration-700 group-hover:opacity-100"
            />
          ) : null}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.compareAtCents ? <Badge tone="sale">Sale</Badge> : null}
            {product.stock === 0 ? <Badge>Sold out</Badge> : null}
            {product.stock > 0 && product.stock <= 5 ? <Badge tone="warn">Low stock</Badge> : null}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{product.categoryName}</p>
          <h3 className="font-serif text-xl leading-tight">{product.name}</h3>
          <Price cents={min} compare={min === max ? product.compareAtCents : null} from={min !== max} />
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <WishlistButton productId={product.id} />
      </div>
    </article>
  );
}
