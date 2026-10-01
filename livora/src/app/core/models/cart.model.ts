export interface CartItem {
  /** Unique line key: `${productId}` or `${productId}:${variationId}`. */
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  /** Price actually charged per unit (sale price if on sale). */
  unitPrice: number;
  /** Struck-through regular price when the item is discounted. */
  regularPrice?: number;
  quantity: number;
  variation?: {
    id: number;
    /** Human readable, e.g. "Color: Black" */
    label: string;
    attributes: Record<string, string>;
  };
}

export interface AppliedCoupon {
  code: string;
  /** Percentage off the subtotal. */
  percent: number;
}
