import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, NewOrder, Order, OrderItem } from '../models';
import { round2 } from '../utils/product.utils';
import { CartService } from './cart.service';
import { readStorage, writeStorage } from './storage.util';

const STORAGE_KEY = 'livora.orders.v1';
/** Only the newest orders are kept (localStorage is small and this is a demo). */
const MAX_ORDERS = 20;
/** Numbers start at 10460 → `LV-10460`. */
const FIRST_ORDER_NUMBER = 10460;
/** An order counts as "just placed" (checkout shows it again after a reload) for this long. */
const RECENT_MS = 60 * 60 * 1000;

const toOrderItem = (item: CartItem): OrderItem => ({
  productId: item.productId,
  slug: item.slug,
  name: item.name,
  image: item.image,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  regularPrice: item.regularPrice,
  variation: item.variation?.label,
  lineTotal: round2(item.unitPrice * item.quantity),
});

/** Drops anything in localStorage that is not shaped like an order (old schema, manual edits, corruption). */
const isOrder = (value: unknown): value is Order => {
  const o = value as Partial<Order> | null;
  return (
    !!o &&
    typeof o === 'object' &&
    typeof o.id === 'string' &&
    typeof o.number === 'number' &&
    typeof o.createdAt === 'string' &&
    typeof o.total === 'number' &&
    Array.isArray(o.items) &&
    !!o.billing &&
    !!o.payment
  );
};

const load = (): Order[] => {
  const stored = readStorage<unknown>(STORAGE_KEY, []);
  return Array.isArray(stored) ? stored.filter(isOrder).slice(0, MAX_ORDERS) : [];
};

/**
 * Demo order book. There is no server: `place()` snapshots the cart (items, totals, coupon), stores the order in
 * localStorage (`livora.orders.v1`, newest first, max 20) and empties the cart.
 *
 *   const order = inject(OrderService).place({ billing, payment: { id: 'cod', title: 'Cash on delivery' } });
 *   order?.id   // "LV-10460"
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly cart = inject(CartService);

  private readonly _orders = signal<Order[]>(load());

  /** All stored orders, newest first. */
  readonly orders = this._orders.asReadonly();
  /** The most recent order or `null`. */
  readonly last = computed(() => this._orders()[0] ?? null);

  /**
   * Creates an order from the current cart, clears the cart and returns the order.
   * Returns `null` (and does nothing) when the cart is empty.
   */
  place(details: NewOrder): Order | null {
    const items = this.cart.items();
    if (items.length === 0) {
      return null;
    }
    const number = this.nextNumber();
    const coupon = this.cart.coupon();
    const notes = details.notes?.trim();

    const order: Order = {
      id: `LV-${number}`,
      number,
      createdAt: new Date().toISOString(),
      status: details.payment.id === 'bacs' ? 'on-hold' : 'processing',
      items: items.map(toOrderItem),
      subtotal: this.cart.subtotal(),
      discount: this.cart.discount(),
      coupon: coupon ? { code: coupon.code, percent: coupon.percent } : undefined,
      shipping: this.cart.shipping(),
      total: this.cart.total(),
      billing: details.billing,
      shippingAddress: details.shippingAddress,
      notes: notes ? notes : undefined,
      payment: details.payment,
    };

    const next = [order, ...this._orders()].slice(0, MAX_ORDERS);
    this._orders.set(next);
    writeStorage(STORAGE_KEY, next); // synchronous: a reload right after "Place order" must still find it
    this.cart.clear();
    return order;
  }

  byId(id: string): Order | undefined {
    return this._orders().find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
  }

  /** The last order, but only if it was placed less than an hour ago (what `/checkout` shows after a reload). */
  recent(now = Date.now()): Order | null {
    const order = this.last();
    if (!order) {
      return null;
    }
    const age = now - Date.parse(order.createdAt);
    return Number.isFinite(age) && age < RECENT_MS ? order : null;
  }

  private nextNumber(): number {
    return Math.max(FIRST_ORDER_NUMBER - 1, ...this._orders().map((o) => o.number)) + 1;
  }
}
