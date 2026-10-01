import { Injectable } from '@angular/core';
import { BRANDS } from '../data/brands.data';
import { PRODUCT_CATEGORIES } from '../data/categories.data';
import { PRODUCTS, PRODUCT_SLUG_ALIASES } from '../data/products.data';
import {
  Brand,
  Paginated,
  Product,
  ProductCategory,
  ProductOrderBy,
  ProductQuery,
} from '../models';
import { currentPrice, priceBounds as productPriceBounds } from '../utils/product.utils';

const DEFAULT_PER_PAGE = 9;

/** Case- and accent-insensitive A→Z, like the MySQL collation behind the original "Default sorting". */
const collator = new Intl.Collator('en', { sensitivity: 'base' });

/** The original shop `<select>` values (menu_order, date, price, title) are accepted as aliases. */
const ORDER_ALIASES: Readonly<Record<string, ProductOrderBy>> = {
  menu_order: 'default',
  date: 'latest',
  price: 'price-asc',
  title: 'title-asc',
};

const normalizeSlug = (slug: string): string => slug.trim().toLowerCase();

const defined = <T>(value: T | undefined): value is T => value !== undefined;

/** Lower-case, accent-free text for searching ("decor" finds "décor"). */
const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** True when `term` occurs at the start of a word of `haystack` (both folded): "table" ≠ "comfortable". */
const startsWord = (haystack: string, term: string): boolean => {
  for (let i = haystack.indexOf(term); i !== -1; i = haystack.indexOf(term, i + 1)) {
    if (i === 0 || !/[a-z0-9]/.test(haystack.charAt(i - 1))) {
      return true;
    }
  }
  return false;
};

const finite = (value: number | undefined | null): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/** Integer >= min (Infinity is capped); anything else (undefined, NaN, too small) falls back to `fallback`. */
const wholeNumber = (value: number | undefined | null, min: number, fallback: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  const n = Math.min(Math.floor(value), Number.MAX_SAFE_INTEGER);
  return n < min ? fallback : n;
};

/** Slug list → Set (null = no constraint). Also tolerates a single string. */
const slugSet = (values: readonly string[] | string | undefined | null): Set<string> | null => {
  const list = typeof values === 'string' ? [values] : (values ?? []);
  const set = new Set(list.map(normalizeSlug).filter(Boolean));
  return set.size > 0 ? set : null;
};

/** `limit` undefined / NaN = everything; a negative limit = nothing. */
const limited = <T>(list: T[], limit?: number): T[] =>
  typeof limit === 'number' && !Number.isNaN(limit)
    ? list.slice(0, wholeNumber(limit, 0, 0))
    : list;

/** Catalog order = alphabetical by name ("Default sorting"); the id only makes the order total. */
const byName = (a: Product, b: Product): number => collator.compare(a.name, b.name) || a.id - b.id;

const timestamp = (p: Product): number => Date.parse(p.createdAt) || 0;

/**
 * Sort comparators. All of them return 0 for ties, and `Array.sort` is stable, so equal items keep the catalog
 * (alphabetical) order. `null` = keep catalog order. Price sorts use the lowest effective price of a product.
 */
const COMPARATORS: Readonly<Record<ProductOrderBy, ((a: Product, b: Product) => number) | null>> = {
  default: null,
  'title-asc': null,
  'title-desc': (a, b) => byName(b, a),
  popularity: (a, b) => b.popularity - a.popularity,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  latest: (a, b) => timestamp(b) - timestamp(a),
  'price-asc': (a, b) => currentPrice(a) - currentPrice(b),
  'price-desc': (a, b) => currentPrice(b) - currentPrice(a),
};

/** Unknown `orderby` values fall back to the default order. */
const resolveOrder = (value: string | undefined): ProductOrderBy => {
  if (!value) {
    return 'default';
  }
  if (Object.hasOwn(ORDER_ALIASES, value)) {
    return ORDER_ALIASES[value];
  }
  return Object.hasOwn(COMPARATORS, value) ? (value as ProductOrderBy) : 'default';
};

const brandSlugsOf = (p: Product): string[] => p.brands ?? [p.brand];

/**
 * Read-only product catalog (data in `core/data/*.data.ts`).
 * Everything is synchronous and pure; lookup tables are built once. Arrays are returned as copies (safe to sort),
 * the Product objects themselves are shared and must be treated as read-only.
 *
 *   inject(ProductService).query({ category: ['bedroom'], orderby: 'price-asc', page: 1 })
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Catalog order = "Default sorting" = alphabetical by name. */
  private readonly catalog: readonly Product[] = [...PRODUCTS].sort(byName);
  private readonly idMap = new Map<number, Product>(this.catalog.map((p) => [p.id, p]));
  private readonly slugMap = new Map<string, Product>(
    this.catalog.map((p) => [normalizeSlug(p.slug), p]),
  );
  private readonly categoryMap = new Map<string, ProductCategory>(
    PRODUCT_CATEGORIES.map((c) => [normalizeSlug(c.slug), c]),
  );
  private readonly brandMap = new Map<string, Brand>(BRANDS.map((b) => [normalizeSlug(b.slug), b]));

  private readonly categoryList: (ProductCategory & { count: number })[] = PRODUCT_CATEGORIES.map(
    (c) => ({
      ...c,
      count: this.catalog.filter((p) => p.categories.includes(c.slug)).length,
    }),
  );
  private readonly brandList: (Brand & { count: number })[] = BRANDS.map((b) => ({
    ...b,
    count: this.catalog.filter((p) => brandSlugsOf(p).includes(b.slug)).length,
  }));

  private readonly bounds: { min: number; max: number } = (() => {
    const all = this.catalog.map(productPriceBounds);
    return all.length
      ? {
          min: Math.floor(Math.min(...all.map((b) => b.min))),
          max: Math.ceil(Math.max(...all.map((b) => b.max))),
        }
      : { min: 0, max: 0 };
  })();

  private readonly ratings: Record<1 | 2 | 3 | 4 | 5, number> = (() => {
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const p of this.catalog) {
      const rounded = Math.round(p.rating);
      if (rounded >= 1 && rounded <= 5) {
        counts[rounded as 1 | 2 | 3 | 4 | 5] += 1;
      }
    }
    return counts;
  })();

  /** Folded "name excerpt categories brands" text per product id, used by `query({ search })`. */
  private readonly haystacks = new Map<number, string>(
    this.catalog.map((p) => [
      p.id,
      fold(
        [
          p.name,
          p.excerpt,
          ...p.categories.map((c) => this.categoryMap.get(normalizeSlug(c))?.name ?? c),
          ...brandSlugsOf(p).map((b) => this.brandMap.get(normalizeSlug(b))?.name ?? b),
        ].join(' \n '),
      ),
    ]),
  );

  // ---------------------------------------------------------------- lookups

  /** Every product in catalog order (alphabetical by name = the original "Default sorting"). */
  all(): Product[] {
    return this.catalog.slice();
  }

  /** Also resolves the three original WordPress slugs (e.g. `multi-purpose-shelf` → Wooden Cabinet). */
  bySlug(slug: string): Product | undefined {
    const key = normalizeSlug(slug ?? '');
    const alias = Object.hasOwn(PRODUCT_SLUG_ALIASES, key) ? PRODUCT_SLUG_ALIASES[key] : '';
    return this.slugMap.get(key) ?? this.slugMap.get(alias);
  }

  byId(id: number): Product | undefined {
    return this.idMap.get(Number(id));
  }

  /** Products for these ids, in the order of `ids`; unknown ids are skipped and duplicates collapsed (wishlist/cart). */
  byIds(ids: number[]): Product[] {
    const seen = new Set<number>();
    const result: Product[] = [];
    for (const id of ids ?? []) {
      const product = this.idMap.get(Number(id));
      if (product && !seen.has(product.id)) {
        seen.add(product.id);
        result.push(product);
      }
    }
    return result;
  }

  /** The 5 categories (alphabetical, like the shop sidebar) with their number of products. */
  categories(): (ProductCategory & { count: number })[] {
    return this.categoryList.slice();
  }

  categoryBySlug(slug: string): ProductCategory | undefined {
    return this.categoryMap.get(normalizeSlug(slug ?? ''));
  }

  /** The 5 brands (alphabetical, like the shop sidebar) with their number of products. */
  brands(): (Brand & { count: number })[] {
    return this.brandList.slice();
  }

  brandBySlug(slug: string): Brand | undefined {
    return this.brandMap.get(normalizeSlug(slug ?? ''));
  }

  /** Category objects of a product, in the product's own order (for "Category: …" links). */
  categoriesOf(product: Product): ProductCategory[] {
    return product.categories
      .map((slug) => this.categoryMap.get(normalizeSlug(slug)))
      .filter(defined);
  }

  /** Brand objects of a product (the original allows several), in the product's own order. */
  brandsOf(product: Product): Brand[] {
    return brandSlugsOf(product)
      .map((slug) => this.brandMap.get(normalizeSlug(slug)))
      .filter(defined);
  }

  // ---------------------------------------------------------------- query

  /**
   * Filter → sort → paginate.
   *  - `category` / `brand`: OR inside each list, AND between the filters (a product with several brands matches any).
   *  - `minPrice` / `maxPrice` (inclusive): compared with the product's effective price range, so a variable product
   *    matches when its [lowest, highest] price overlaps the requested range.
   *  - `minRating`: rounded average rating >= n (4.5 counts as 5).
   *  - `search`: every whitespace-separated term must start a word (case/accent-insensitive) in the name, the
   *    excerpt or the names of the product's categories/brands – "wood" finds Wooden, "table" does not find
   *    "comfortable".
   *  - `orderby`: default (A→Z) | popularity | rating | latest | price-asc | price-desc | title-asc | title-desc.
   *    Ties keep the alphabetical order.
   *  - `page` (1-based) is clamped to the valid range; `perPage` defaults to 9. `pages` is always >= 1.
   */
  query(q: ProductQuery = {}): Paginated<Product> {
    const categories = slugSet(q.category);
    const brands = slugSet(q.brand);
    const minPrice = finite(q.minPrice);
    const maxPrice = finite(q.maxPrice);
    const minRating = finite(q.minRating);
    const terms = fold(q.search ?? '')
      .split(/\s+/)
      .filter(Boolean);

    const matches = this.catalog.filter((p) => {
      if (categories && !p.categories.some((c) => categories.has(normalizeSlug(c)))) {
        return false;
      }
      if (brands && !brandSlugsOf(p).some((b) => brands.has(normalizeSlug(b)))) {
        return false;
      }
      if (minPrice !== null || maxPrice !== null) {
        const { min, max } = productPriceBounds(p);
        if ((minPrice !== null && max < minPrice) || (maxPrice !== null && min > maxPrice)) {
          return false;
        }
      }
      if (minRating !== null && Math.round(p.rating) < minRating) {
        return false;
      }
      if (terms.length > 0) {
        const haystack = this.haystacks.get(p.id) ?? '';
        if (!terms.every((term) => startsWord(haystack, term))) {
          return false;
        }
      }
      return true;
    });

    const comparator = COMPARATORS[resolveOrder(q.orderby)];
    if (comparator) {
      matches.sort(comparator);
    }

    const perPage = wholeNumber(q.perPage, 1, DEFAULT_PER_PAGE);
    const total = matches.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(pages, wholeNumber(q.page, 1, 1));
    const start = (page - 1) * perPage;

    return { items: matches.slice(start, start + perPage), total, page, perPage, pages };
  }

  // ---------------------------------------------------------------- suggestions & lists

  /**
   * Related products: most shared categories first (then most shared brands), then the rest; ties keep the
   * catalog order. Never contains `product` itself.
   */
  related(product: Product, limit = 3): Product[] {
    const categories = new Set(product.categories);
    const brands = new Set(brandSlugsOf(product));
    const shared = (values: readonly string[], wanted: Set<string>) =>
      values.filter((v) => wanted.has(v)).length;

    return this.catalog
      .filter((p) => p.id !== product.id)
      .map((p) => ({ p, c: shared(p.categories, categories), b: shared(brandSlugsOf(p), brands) }))
      .sort((x, y) => y.c - x.c || y.b - x.b)
      .slice(0, wholeNumber(limit, 0, 3))
      .map((entry) => entry.p);
  }

  /**
   * Products flagged `featured` (the home page "Top Rated Product" block), in the curated order of the original:
   * ascending original product id. Without `limit` all of them are returned.
   */
  featured(limit?: number): Product[] {
    return limited(
      this.catalog.filter((p) => p.featured === true).sort((a, b) => a.id - b.id),
      limit,
    );
  }

  /** Newest first (`createdAt` descending). */
  latest(limit?: number): Product[] {
    return limited(this.sorted('latest'), limit);
  }

  /** Best average rating first, then most reviews. */
  topRated(limit?: number): Product[] {
    return limited(this.sorted('rating'), limit);
  }

  /** Highest `popularity` (sales count) first. */
  bestSellers(limit?: number): Product[] {
    return limited(this.sorted('popularity'), limit);
  }

  // ---------------------------------------------------------------- filter sidebar helpers

  /** Whole-dollar bounds of all effective prices (floor(lowest) … ceil(highest)) for the price filter. */
  priceBounds(): { min: number; max: number } {
    return { ...this.bounds };
  }

  /** Number of products per rounded average rating (4.5 → 5), for the "Product rating" filter. */
  ratingCounts(): Record<1 | 2 | 3 | 4 | 5, number> {
    return { ...this.ratings };
  }

  private sorted(order: ProductOrderBy): Product[] {
    const list = this.catalog.slice();
    const comparator = COMPARATORS[order];
    return comparator ? list.sort(comparator) : list;
  }
}
