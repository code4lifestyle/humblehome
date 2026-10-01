import { ProductOrderBy } from '@core/models';

/** The three routes served by the shop page (`data.mode` in app.routes.ts). */
export type ShopMode = 'shop' | 'category' | 'brand';

/** A raw router value: query params may be missing, single or repeated. */
export type RawParam = string | string[] | null | undefined;

export interface PriceRange {
  /** `null` = no lower / upper limit (the slider bound). */
  min: number | null;
  max: number | null;
}

/** Everything the URL says about the listing (already validated and normalised). */
export interface ShopParams {
  search: string;
  page: number;
  orderby: ProductOrderBy;
  perPage: number;
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
  /** `?category=a,b` – only read on /shop and /brand/:slug. */
  categories: string[];
  /** `?brand=a,b` – only read on /shop and /product-category/:slug. */
  brands: string[];
}

export const PER_PAGE_OPTIONS: readonly number[] = [6, 9, 12];
export const DEFAULT_PER_PAGE = 9;

/** The original "Default sorting" select, in the original order. */
export const SORT_OPTIONS: readonly { value: ProductOrderBy; label: string }[] = [
  { value: 'default', label: 'Default sorting' },
  { value: 'popularity', label: 'Sort by popularity' },
  { value: 'rating', label: 'Sort by average rating' },
  { value: 'latest', label: 'Sort by latest' },
  { value: 'price-asc', label: 'Sort by price: low to high' },
  { value: 'price-desc', label: 'Sort by price: high to low' },
  { value: 'title-asc', label: 'Sort by title: a to z' },
  { value: 'title-desc', label: 'Sort by title: z to a' },
];

/** WooCommerce's own `orderby` values (menu_order, date, price, title) are accepted as aliases. */
const ORDER_ALIASES: Readonly<Record<string, ProductOrderBy>> = {
  menu_order: 'default',
  date: 'latest',
  price: 'price-asc',
  title: 'title-asc',
};

/** First value of a possibly repeated param, trimmed. */
function firstValue(value: RawParam): string {
  const single = Array.isArray(value) ? value[0] : value;
  return (single ?? '').toString().trim();
}

export function parseSearch(value: RawParam): string {
  return firstValue(value).replace(/\s+/g, ' ');
}

/** Whole number >= 1, otherwise `fallback`. */
export function parsePage(value: RawParam, fallback = 1): number {
  const n = Number(firstValue(value));
  return Number.isInteger(n) && n >= 1 ? n : fallback;
}

export function parsePerPage(value: RawParam): number {
  const n = Number(firstValue(value));
  return PER_PAGE_OPTIONS.includes(n) ? n : DEFAULT_PER_PAGE;
}

export function parseOrderBy(value: RawParam): ProductOrderBy {
  const raw = firstValue(value);
  if (Object.hasOwn(ORDER_ALIASES, raw)) {
    return ORDER_ALIASES[raw];
  }
  return SORT_OPTIONS.find((option) => option.value === raw)?.value ?? 'default';
}

/** 1–5, otherwise `null`. */
export function parseRating(value: RawParam): number | null {
  const n = Number(firstValue(value));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

/** A finite price >= 0, otherwise `null`. */
export function parsePrice(value: RawParam): number | null {
  const raw = firstValue(value);
  if (raw === '') {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** `a,b` and `?x=a&x=b` both become `['a', 'b']` (lower-case, unique, no blanks). */
export function parseList(value: RawParam): string[] {
  const parts = (Array.isArray(value) ? value : [value ?? '']).flatMap((v) =>
    v.toString().split(','),
  );
  return [...new Set(parts.map((part) => part.trim().toLowerCase()).filter(Boolean))];
}

/**
 * The URL price range against the catalog bounds: values are clamped, a limit sitting on the bound is dropped (it filters
 * nothing) and a reversed pair is swapped.
 */
export function normalisePrice(
  min: number | null,
  max: number | null,
  bounds: { min: number; max: number },
): PriceRange {
  const clamp = (n: number) => Math.min(bounds.max, Math.max(bounds.min, n));
  let lo = min === null ? null : clamp(min);
  let hi = max === null ? null : clamp(max);
  if (lo !== null && hi !== null && lo > hi) {
    [lo, hi] = [hi, lo];
  }
  return {
    min: lo !== null && lo > bounds.min ? lo : null,
    max: hi !== null && hi < bounds.max ? hi : null,
  };
}

/** WooCommerce wording: "Showing all 7 results" · "Showing the single result" · "Showing 1–9 of 12 results". */
export function resultCountText(total: number, first: number, last: number): string {
  if (total <= 0) {
    return '';
  }
  if (total === 1) {
    return 'Showing the single result';
  }
  return first <= 1 && last >= total
    ? `Showing all ${total} results`
    : `Showing ${first}–${last} of ${total} results`;
}
