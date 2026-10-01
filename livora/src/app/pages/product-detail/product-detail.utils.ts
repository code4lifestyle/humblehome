import { Product, ProductVariation } from '@core/models';

/** Whole-number discount of one variation (17 for $59 → $49), 0 when it is not on sale. */
export function variationDiscount(variation: ProductVariation | null | undefined): number {
  if (!variation || variation.salePrice == null || variation.salePrice >= variation.price) {
    return 0;
  }
  return Math.round(((variation.price - variation.salePrice) / variation.price) * 100);
}

/**
 * The category shown in the breadcrumb. WooCommerce picks one "main" category per product; in the original it is the
 * first listed one except for these two products (Contemporary Leather Sofa: Luxury Collection + Office Furniture,
 * Luxury Tufted Velvet Sofa: Dining Room + Living Room + Office Furniture).
 */
const BREADCRUMB_CATEGORY: Readonly<Record<string, string>> = {
  'contemporary-leather-sofa': 'office-furniture',
  'luxury-tufted-velvet-sofa': 'living-room',
};

export function breadcrumbCategorySlug(product: Product): string | undefined {
  const preferred = BREADCRUMB_CATEGORY[product.slug];
  return preferred && product.categories.includes(preferred) ? preferred : product.categories[0];
}

/** Relative luminance (WCAG) of a `#rgb` / `#rrggbb` colour; 0 when the value cannot be parsed. */
export function luminance(colour: string | undefined): number {
  const hex = (colour ?? '').trim().replace(/^#/, '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    return 0;
  }
  const channel = (offset: number): number => {
    const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * A white check mark needs at least 3:1 against the swatch (WCAG 1.4.11), i.e. luminance ≤ ~0.35 – lighter swatches
 * (Gray, Light, Pink) get a dark check instead.
 */
export function needsDarkCheck(colour: string | undefined): boolean {
  return luminance(colour) > 0.35;
}

/** `smooth` unless the visitor asked for reduced motion (JS-driven scrolling ignores the CSS media query). */
export function scrollBehavior(): ScrollBehavior {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}
