import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AppliedCoupon, CartItem, Product, ProductVariation } from '../models';
import { isVariable, round2 } from '../utils/product.utils';
import { readStorage, writeStorage } from './storage.util';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'livora.cart.v1';
const COUPON_STORAGE_KEY = 'livora.cart.coupon.v1';

/** Demo coupon codes → percentage off. */
const COUPONS: Record<string, number> = { LIVORA10: 10, WELCOME15: 15, SAVE20: 20 };

/** Restores the applied coupon (only if it is still a known code, so tampered storage can't invent discounts). */
function readStoredCoupon(): AppliedCoupon | null {
  const stored = readStorage<AppliedCoupon | null>(COUPON_STORAGE_KEY, null);
  const percent = stored ? COUPONS[stored.code] : undefined;
  return stored && percent ? { code: stored.code, percent } : null;
}

/** Signal-based shopping cart (items and applied coupon), persisted in localStorage. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly toast = inject(ToastService);

  private readonly _items = signal<CartItem[]>(readStorage<CartItem[]>(STORAGE_KEY, []));
  private readonly _coupon = signal<AppliedCoupon | null>(readStoredCoupon());

  readonly items = this._items.asReadonly();
  readonly coupon = this._coupon.asReadonly();
  readonly isEmpty = computed(() => this._items().length === 0);
  /** Total number of units (drives the header badge). */
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() => round2(this._items().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)));
  readonly discount = computed(() => {
    const c = this._coupon();
    return c ? round2((this.subtotal() * c.percent) / 100) : 0;
  });
  /** Flat demo shipping: free above AED 15,000, otherwise AED 150 (0 for an empty cart). */
  readonly shipping = computed(() => (this.isEmpty() || this.subtotal() - this.discount() >= 15000 ? 0 : 150));
  readonly total = computed(() => round2(this.subtotal() - this.discount() + this.shipping()));

  constructor() {
    effect(() => writeStorage(STORAGE_KEY, this._items()));
    effect(() => writeStorage(COUPON_STORAGE_KEY, this._coupon()));
  }

  /**
   * Adds a product (or one variation of a variable product). Returns false when a variable product is added
   * without choosing a variation – callers should send the user to the product page instead.
   */
  add(product: Product, quantity = 1, variation?: ProductVariation): boolean {
    if (isVariable(product) && !variation) {
      this.toast.show('Please choose the product options first.', {
        type: 'info',
        action: { label: 'Choose options', link: ['/product', product.slug] },
      });
      return false;
    }
    const key = variation ? `${product.id}:${variation.id}` : `${product.id}`;
    const qty = Math.max(1, Math.floor(quantity));

    this._items.update((items) => {
      const existing = items.find((i) => i.key === key);
      if (existing) {
        return items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i));
      }
      const regular = variation ? variation.price : product.price;
      const unit = variation
        ? (variation.salePrice != null && variation.salePrice < variation.price ? variation.salePrice : variation.price)
        : (product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price);
      const item: CartItem = {
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: variation?.image ?? product.images[0],
        unitPrice: unit,
        regularPrice: regular > unit ? regular : undefined,
        quantity: qty,
        variation: variation
          ? {
              id: variation.id,
              attributes: variation.attributes,
              label: Object.entries(variation.attributes)
                .map(([slug, option]) => `${this.attributeName(product, slug)}: ${option}`)
                .join(', '),
            }
          : undefined,
      };
      return [...items, item];
    });
    this.toast.show(`“${product.name}” has been added to your cart.`, {
      action: { label: 'View cart', link: '/cart' },
    });
    return true;
  }

  setQuantity(key: string, quantity: number): void {
    const qty = Math.floor(quantity);
    if (qty < 1) {
      this.remove(key);
      return;
    }
    this._items.update((items) => items.map((i) => (i.key === key ? { ...i, quantity: qty } : i)));
  }

  remove(key: string): void {
    this._items.update((items) => items.filter((i) => i.key !== key));
  }

  clear(): void {
    this._items.set([]);
    this._coupon.set(null);
  }

  applyCoupon(code: string): { ok: boolean; message: string } {
    const normalized = code.trim().toUpperCase();
    const percent = COUPONS[normalized];
    if (!percent) {
      return { ok: false, message: `Coupon “${code.trim()}” does not exist!` };
    }
    this._coupon.set({ code: normalized, percent });
    return { ok: true, message: 'Coupon code applied successfully.' };
  }

  removeCoupon(): void {
    this._coupon.set(null);
  }

  private attributeName(product: Product, slug: string): string {
    return product.attributes?.find((a) => a.slug === slug)?.name ?? slug;
  }
}
