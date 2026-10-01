/**
 * Checkout / order contracts (commerce agent). Same rule as every model file: ADDITIVE-ONLY – add optional fields,
 * never rename or remove existing ones.
 */

export type PaymentMethodId = 'bacs' | 'cod' | 'card';

/** `on-hold` = waiting for the bank transfer, `processing` = paid / to be paid on delivery. */
export type OrderStatus = 'on-hold' | 'processing';

/** A billing or shipping address exactly as it was entered at checkout. */
export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  /** ISO 3166-1 alpha-2 code, e.g. `US`. */
  countryCode: string;
  /** Display name, e.g. `United States (US)`. */
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
}

/** Billing address = address + the contact details of the customer. */
export interface OrderBilling extends OrderAddress {
  phone: string;
  email: string;
}

/** Snapshot of one cart line at the moment the order was placed (later catalog / price changes do not touch it). */
export interface OrderItem {
  productId: number;
  slug: string;
  name: string;
  /** Base image path (use `imageVariant(image, '300x300')` for thumbnails). */
  image: string;
  quantity: number;
  /** Price charged per unit. */
  unitPrice: number;
  /** Struck-through regular price when the line was discounted. */
  regularPrice?: number;
  /** Human readable variation, e.g. `Color: Black`. */
  variation?: string;
  /** `unitPrice × quantity`. */
  lineTotal: number;
}

export interface Order {
  /** Display id, `LV-` + number, e.g. `LV-10460`. */
  id: string;
  number: number;
  /** ISO timestamp. */
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  /** Coupon discount (positive number, 0 when none). */
  discount: number;
  coupon?: { code: string; percent: number };
  shipping: number;
  total: number;
  billing: OrderBilling;
  /** Only present when "Ship to a different address?" was ticked. */
  shippingAddress?: OrderAddress;
  /** "Order notes" of the customer. */
  notes?: string;
  payment: { id: PaymentMethodId; title: string };
}

/** What the checkout form hands to `OrderService.place()` – prices and items come from the cart itself. */
export interface NewOrder {
  billing: OrderBilling;
  shippingAddress?: OrderAddress;
  notes?: string;
  payment: { id: PaymentMethodId; title: string };
}
