import { Product, ProductVariation } from '../models';

/** Effective (charged) price of one variation. */
export function variationPrice(v: ProductVariation): number {
  return v.salePrice != null && v.salePrice < v.price ? v.salePrice : v.price;
}

export function isVariable(p: Product): boolean {
  return !!p.variations && p.variations.length > 0;
}

/** Lowest & highest effective price of a product (equal for simple products / uniform variations). */
export function priceBounds(p: Product): { min: number; max: number } {
  if (isVariable(p)) {
    const prices = p.variations!.map(variationPrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }
  const price = p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
  return { min: price, max: price };
}

/** Price to charge / sort by (lowest effective price). */
export function currentPrice(p: Product): number {
  return priceBounds(p).min;
}

/** Regular (non-sale) price – lowest regular price for variable products. */
export function regularPrice(p: Product): number {
  return isVariable(p) ? Math.min(...p.variations!.map((v) => v.price)) : p.price;
}

/** Returns the range only when a variable product's prices differ, e.g. { min: 39, max: 89 }. */
export function priceRange(p: Product): { min: number; max: number } | null {
  const { min, max } = priceBounds(p);
  return max > min ? { min, max } : null;
}

export function isOnSale(p: Product): boolean {
  if (isVariable(p)) {
    return p.variations!.some((v) => v.salePrice != null && v.salePrice < v.price);
  }
  return p.salePrice != null && p.salePrice < p.price;
}

/** Whole-number discount percentage (largest one across variations); 0 when not on sale. */
export function discountPercent(p: Product): number {
  const pct = (regular: number, sale: number) => Math.round(((regular - sale) / regular) * 100);
  if (isVariable(p)) {
    return p.variations!.reduce(
      (best, v) => (v.salePrice != null && v.salePrice < v.price ? Math.max(best, pct(v.price, v.salePrice)) : best),
      0,
    );
  }
  return p.salePrice != null && p.salePrice < p.price ? pct(p.price, p.salePrice) : 0;
}

/** Find the variation matching the chosen attribute options (all attributes must match). */
export function findVariation(p: Product, chosen: Record<string, string>): ProductVariation | undefined {
  return p.variations?.find((v) => Object.entries(v.attributes).every(([slug, option]) => chosen[slug] === option));
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
