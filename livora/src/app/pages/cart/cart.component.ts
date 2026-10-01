import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem, Product } from '@core/models';
import { CartService } from '@core/services/cart.service';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { imageVariant } from '@core/utils/image.utils';
import { round2 } from '@core/utils/product.utils';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { QuantityInputComponent } from '@shared/components/quantity-input/quantity-input.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/** Demo coupon codes that `CartService` accepts – shown as one-click hints under the coupon field. */
const DEMO_COUPONS = ['LIVORA10', 'WELCOME15', 'SAVE20'];

/**
 * `/cart` – empty state exactly like the original mirror ("Nothing In Here!"), otherwise a WooCommerce style cart:
 * table (thumbnail, name + variation, price, quantity, subtotal, remove), coupon form, cart totals card with
 * "Proceed to checkout", and a "You may be interested in…" row. All state comes from `CartService` (signals).
 */
@Component({
  selector: 'app-cart-page',
  imports: [
    CurrencyPipe,
    RouterLink,
    PageHeaderComponent,
    SectionTitleComponent,
    QuantityInputComponent,
    ProductCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  protected readonly cart = inject(CartService);
  private readonly catalog = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly crumbs: PageHeaderCrumb[] = [{ label: 'Home', link: '/' }, { label: 'Cart' }];
  protected readonly demoCoupons = DEMO_COUPONS;

  protected readonly couponCode = signal('');
  protected readonly couponMessage = signal<{ ok: boolean; text: string } | null>(null);
  protected readonly couponFailed = computed(() => this.couponMessage()?.ok === false);

  /** "You may be interested in…": related products of what is in the cart, then featured / best sellers. */
  protected readonly suggestions = computed<Product[]>(() => {
    const seen = new Set(this.cart.items().map((i) => i.productId));
    const picked: Product[] = [];
    const add = (list: Product[]): void => {
      for (const p of list) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          picked.push(p);
        }
      }
    };
    for (const p of this.catalog.byIds([...seen])) {
      add(this.catalog.related(p, 4));
    }
    add(this.catalog.featured());
    add(this.catalog.bestSellers());
    return picked.slice(0, 4);
  });

  protected thumb(item: CartItem): string {
    return imageVariant(item.image, '300x300');
  }

  protected lineTotal(item: CartItem): number {
    return round2(item.unitPrice * item.quantity);
  }

  protected setQuantity(item: CartItem, quantity: number): void {
    if (quantity !== item.quantity) {
      this.cart.setQuantity(item.key, quantity);
    }
  }

  protected remove(item: CartItem, index: number): void {
    this.cart.remove(item.key);
    this.toast.show(`“${item.name}” has been removed from your cart.`, { type: 'info' });
    // the focused button disappears with its row → hand the focus to the next remove button (or the page heading)
    afterNextRender(
      () => {
        const buttons = this.host.nativeElement.querySelectorAll<HTMLElement>('.cart-remove');
        const target =
          buttons[Math.min(index, buttons.length - 1)] ??
          this.host.nativeElement.querySelector<HTMLElement>('.empty-title');
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  protected clear(): void {
    this.cart.clear();
    this.couponMessage.set(null);
    this.toast.show('Your cart has been cleared.', { type: 'info' });
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('.empty-title')?.focus(),
      {
        injector: this.injector,
      },
    );
  }

  protected onCouponInput(event: Event): void {
    this.couponCode.set((event.target as HTMLInputElement).value);
  }

  protected useDemoCoupon(code: string): void {
    this.couponCode.set(code);
    this.couponMessage.set(null);
  }

  protected applyCoupon(): void {
    const code = this.couponCode().trim();
    if (!code) {
      this.couponMessage.set({ ok: false, text: 'Please enter a coupon code.' });
      return;
    }
    const result = this.cart.applyCoupon(code);
    this.couponMessage.set({ ok: result.ok, text: result.message });
    if (result.ok) {
      this.couponCode.set('');
    }
  }

  protected removeCoupon(): void {
    this.cart.removeCoupon();
    this.couponMessage.set({ ok: true, text: 'Coupon has been removed.' });
  }
}
