import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models';
import { CartService } from '@core/services/cart.service';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { WishlistService } from '@core/services/wishlist.service';
import { isVariable } from '@core/utils/product.utils';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';

/**
 * `/wishlist` – the saved products as a grid of `app-product-card`s with a remove button and an "Add to cart" /
 * "Select options" action per item, "Add all to cart" (simple products only) and "Clear wishlist".
 * The original mirror only shows a login gate here, so this page is designed in the theme's style.
 */
@Component({
  selector: 'app-wishlist-page',
  imports: [RouterLink, PageHeaderComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {
  private readonly wishlist = inject(WishlistService);
  private readonly catalog = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Wishlist' },
  ];

  /** Saved products in the order they were added (ids that no longer exist in the catalog are skipped). */
  protected readonly products = computed(() => this.catalog.byIds(this.wishlist.ids()));

  protected isVariable(product: Product): boolean {
    return isVariable(product);
  }

  protected addToCart(product: Product): void {
    this.cart.add(product);
  }

  protected remove(product: Product, index: number): void {
    this.wishlist.toggle(product); // it is on the list, so this removes it and shows the "removed" toast
    this.restoreFocus(index);
  }

  protected clear(): void {
    this.wishlist.clear();
    this.toast.show('Your wishlist has been cleared.', { type: 'info' });
    this.restoreFocus(0);
  }

  /**
   * Adds every simple product to the cart. Variable products need a colour/option choice, so they are skipped and
   * named in a hint. `CartService.add()` shows one toast per product – they are replaced by a single summary toast.
   */
  protected addAll(): void {
    const all = this.products();
    const simple = all.filter((p) => !isVariable(p));
    const skipped = all.filter((p) => isVariable(p));

    if (simple.length > 0) {
      const known = new Set(this.toast.toasts().map((t) => t.id));
      for (const product of simple) {
        this.cart.add(product);
      }
      for (const t of this.toast.toasts()) {
        if (!known.has(t.id)) {
          this.toast.dismiss(t.id);
        }
      }
      this.toast.show(
        simple.length === 1
          ? `“${simple[0].name}” has been added to your cart.`
          : `${simple.length} products have been added to your cart.`,
        { action: { label: 'View cart', link: '/cart' } },
      );
    }

    if (skipped.length > 0) {
      const names = skipped.map((p) => p.name).join(', ');
      this.toast.show(
        `${skipped.length === 1 ? 'This product has' : 'These products have'} options to choose and ${
          skipped.length === 1 ? 'was' : 'were'
        } not added: ${names}. Open ${skipped.length === 1 ? 'it' : 'them'} to pick the options.`,
        { type: 'info', duration: 8000 },
      );
    }
  }

  /** The focused button disappears with its card → hand the focus to the next remove button (or the page top). */
  private restoreFocus(index: number): void {
    afterNextRender(
      () => {
        const root = this.host.nativeElement;
        const buttons = root.querySelectorAll<HTMLElement>('.wish-remove');
        const target =
          buttons[Math.min(index, buttons.length - 1)] ??
          root.querySelector<HTMLElement>('.empty-title');
        target?.focus();
      },
      { injector: this.injector },
    );
  }
}
