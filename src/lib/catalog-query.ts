import { PAGE_SIZE } from "@/lib/constants";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export type CatalogQueryItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  categorySlug: string;
  categoryName: string;
  featured: boolean;
  bestSeller: boolean;
  createdAt: string;
  stock: number;
  rating: number;
  reviewCount: number;
};

export type CatalogQuery = {
  q?: string;
  category?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  inStock?: boolean;
};

export function parseSort(value: string | undefined): SortKey {
  if (
    value === "newest" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "rating" ||
    value === "featured"
  ) {
    return value;
  }
  return "featured";
}

export function queryCatalog<T extends CatalogQueryItem>(products: T[], query: CatalogQuery) {
  const pageSize = query.pageSize ?? PAGE_SIZE;
  let items = products.slice();

  if (query.category) {
    items = items.filter((product) => product.categorySlug === query.category);
  }

  const term = query.q?.trim().toLowerCase();
  if (term) {
    items = items.filter((product) => {
      const haystack = `${product.name} ${product.description} ${product.categoryName}`.toLowerCase();
      return haystack.includes(term);
    });
  }

  if (query.inStock) {
    items = items.filter((product) => product.stock > 0);
  }

  const sort = query.sort ?? "featured";
  items.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.priceCents - b.priceCents || a.name.localeCompare(b.name);
      case "price-desc":
        return b.priceCents - a.priceCents || a.name.localeCompare(b.name);
      case "newest":
        return b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name);
      case "rating":
        return b.rating - a.rating || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestSeller) - Number(a.bestSeller) ||
          a.name.localeCompare(b.name)
        );
    }
  });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const requested = query.page ?? 1;
  const page = Math.min(Math.max(Number.isFinite(requested) ? Math.floor(requested) : 1, 1), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageCount,
    pageSize,
  };
}

export function relatedProducts<T extends CatalogQueryItem>(products: T[], current: T, limit = 4): T[] {
  const sameCategory = products.filter(
    (product) => product.id !== current.id && product.categorySlug === current.categorySlug,
  );
  const fillers = products.filter(
    (product) =>
      product.id !== current.id &&
      product.categorySlug !== current.categorySlug &&
      (product.bestSeller || product.featured),
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}
