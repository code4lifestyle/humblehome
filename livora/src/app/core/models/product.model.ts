/**
 * Catalog contracts. Images are paths relative to the site root, e.g. 'assets/images/product-image-10.jpg'
 * (use the '-300x300' variant for cards and '-600x600' for the main gallery image, both exist in /assets/images).
 * These interfaces are ADDITIVE-ONLY: add optional fields if you need them, never rename/remove existing ones.
 */

export interface ProductCategory {
  slug: string;
  name: string;
  /** Category tile image (e.g. assets/images/category-item-image-1.jpg). */
  image?: string;
  description?: string;
}

export interface Brand {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
}

/** A selectable option group of a variable product, e.g. Color → Black / Gray / Pink. */
export interface ProductAttribute {
  name: string; // 'Color'
  slug: string; // 'color'
  options: string[]; // ['Accent', 'Black', ...]
  /** Colour swatch per option (CSS colour), e.g. { Black: '#161616' }. Present for colour attributes. */
  swatches?: Record<string, string>;
}

/** One purchasable combination of a variable product. */
export interface ProductVariation {
  id: number;
  /** keys = attribute slug, values = chosen option, e.g. { color: 'Black' } */
  attributes: Record<string, string>;
  price: number; // regular price
  salePrice?: number;
  image?: string;
  sku?: string;
  inStock: boolean;
}

export interface ProductReview {
  id: number;
  author: string;
  rating: number; // 1–5
  date: string; // ISO date
  content: string;
  avatar?: string;
  /** Shows the "verified owner" label next to the author name (WooCommerce). */
  verified?: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  /** Short intro paragraph shown next to the price and in list views. */
  excerpt: string;
  /** Bullet highlights shown under the excerpt on the product page. */
  highlights: string[];
  /** Long description paragraphs for the "Description" tab. */
  description: string[];
  /** Bullet features listed in the Description tab. */
  features: string[];
  /** Gallery image paths; [0] is the main image. */
  images: string[];
  /** Category slugs (see ProductCategory.slug). */
  categories: string[];
  /** Brand slug (see Brand.slug). Primary brand = `brands[0]`. */
  brand: string;
  /**
   * ALL brand slugs, in the order the original shows them ("Brand: Livora Home, Nordic Living"). WooCommerce allows
   * several brands per product; the catalog always fills it. Prefer `brands ?? [brand]` when listing brands.
   */
  brands?: string[];
  tags?: string[];
  /** Regular price. For variable products this is the lowest variation price. */
  price: number;
  /** Current sale price (simple products). For variable products the sale prices live on the variations. */
  salePrice?: number;
  attributes?: ProductAttribute[];
  /** Present ⇒ variable product (shows "Select options" in lists and option pickers on the product page). */
  variations?: ProductVariation[];
  sku?: string;
  /** Average rating 0–5 and number of ratings. */
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  /** Sales count → "Sort by popularity". */
  popularity: number;
  /** ISO date → "Sort by latest". */
  createdAt: string;
  featured?: boolean;
}

/** Query used by ProductService.query() – everything optional. */
export interface ProductQuery {
  category?: string[]; // category slugs (OR)
  brand?: string[]; // brand slugs (OR)
  minPrice?: number;
  maxPrice?: number;
  /** Minimum average rating (1–5). */
  minRating?: number;
  search?: string;
  orderby?: ProductOrderBy;
  page?: number; // 1-based
  perPage?: number;
}

export type ProductOrderBy =
  | 'default'
  | 'popularity'
  | 'rating'
  | 'latest'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc'
  | 'title-desc';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}
