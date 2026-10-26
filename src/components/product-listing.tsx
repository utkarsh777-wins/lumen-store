import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Container, EmptyState } from "@/components/ui";
import { parseSort, queryCatalog } from "@/lib/catalog-query";
import type { CatalogProduct, CategoryRecord } from "@/lib/types";

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hrefFor(pathname: string, current: Record<string, string | undefined>, updates: Record<string, string | null>) {
  const merged = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (!value) delete merged[key];
    else merged[key] = value;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ProductListing({
  products,
  categories,
  searchParams,
  pathname,
  lockedCategory,
  heading,
  intro,
  showHeading = true,
}: {
  products: CatalogProduct[];
  categories: CategoryRecord[];
  searchParams: RawParams;
  pathname: string;
  lockedCategory?: string;
  heading: string;
  intro?: string;
  showHeading?: boolean;
}) {
  const q = first(searchParams.q)?.trim() ?? "";
  const sort = parseSort(first(searchParams.sort));
  const page = Number(first(searchParams.page) ?? "1");
  const inStock = first(searchParams.stock) === "1";
  const category = lockedCategory ?? first(searchParams.category);
  const current = {
    q: q || undefined,
    sort: sort === "featured" ? undefined : sort,
    stock: inStock ? "1" : undefined,
    category: lockedCategory ? undefined : category,
  };

  const result = queryCatalog(products, {
    q,
    category,
    sort,
    page: Number.isFinite(page) ? page : 1,
    inStock,
  });
  const counted = queryCatalog(products, { q, sort: "featured", page: 1, pageSize: products.length || 1, inStock });
  const counts = new Map<string, number>();
  for (const product of counted.items) {
    counts.set(product.categorySlug, (counts.get(product.categorySlug) ?? 0) + 1);
  }

  const sorts = [
    ["featured", "Featured"],
    ["newest", "Newest"],
    ["price-asc", "Price, low to high"],
    ["price-desc", "Price, high to low"],
    ["rating", "Top rated"],
  ] as const;

  return (
    <Container className="py-10 md:py-14">
      {showHeading ? (
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">The shop</p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl">{heading}</h1>
          {intro ? <p className="mt-4 text-lg text-muted">{intro}</p> : null}
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-8">
          <form action={pathname} role="search">
            {lockedCategory ? null : category ? <input type="hidden" name="category" value={category} /> : null}
            <label htmlFor="listing-search" className="text-sm">
              Search
            </label>
            <input
              id="listing-search"
              name="q"
              defaultValue={q}
              placeholder="Bowls, linen, cedar"
              className="mt-2 w-full border border-line bg-elev px-3 py-3 text-sm"
            />
          </form>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Category</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={hrefFor("/products", { q: current.q, stock: current.stock, sort: current.sort }, {})} aria-current={!category ? "page" : undefined} className={!category ? "underline" : ""}>
                  All objects
                  <span className="ml-2 text-muted">{products.length}</span>
                </Link>
              </li>
              {categories.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/collections/${item.slug}${q || inStock || sort !== "featured" ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(inStock ? { stock: "1" } : {}), ...(sort !== "featured" ? { sort } : {}) }).toString()}` : ""}`}
                    aria-current={category === item.slug ? "page" : undefined}
                    className={category === item.slug ? "underline" : ""}
                  >
                    {item.name}
                    <span className="ml-2 text-muted">{counts.get(item.slug) ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p>
            <Link
              href={hrefFor(pathname, current, { stock: inStock ? null : "1", page: null })}
              className="text-sm underline"
              aria-current={inStock ? "true" : undefined}
            >
              {inStock ? "Showing in-stock only" : "Hide sold-out objects"}
            </Link>
          </p>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <p className="text-sm text-muted">
              {result.total} {result.total === 1 ? "object" : "objects"}
            </p>
            <nav aria-label="Sort" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {sorts.map(([value, label]) => (
                <Link
                  key={value}
                  href={hrefFor(pathname, current, { sort: value === "featured" ? null : value, page: null })}
                  aria-current={sort === value ? "page" : undefined}
                  className={sort === value ? "underline" : "text-muted"}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {result.items.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="Nothing matches"
                body="Try a different word, or clear the filters and look through the whole shop."
                action={{ href: "/products", label: "Clear filters" }}
              />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {result.pageCount > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-between text-sm">
              {result.page > 1 ? (
                <Link href={hrefFor(pathname, current, { page: String(result.page - 1) })}>Previous</Link>
              ) : (
                <span className="text-muted">Previous</span>
              )}
              <p>
                Page {result.page} of {result.pageCount}
              </p>
              {result.page < result.pageCount ? (
                <Link href={hrefFor(pathname, current, { page: String(result.page + 1) })}>Next</Link>
              ) : (
                <span className="text-muted">Next</span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
