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
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { WishlistService } from '@core/services/wishlist.service';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';

/**
 * `/wishlist` – the saved products as a grid of `app-product-card`s with a remove button and a
 * "Book a free consultation" link per item, plus "Clear wishlist".
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
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Wishlist' },
  ];

  /** Saved products in the order they were added (ids that no longer exist in the catalog are skipped). */
  protected readonly products = computed(() => this.catalog.byIds(this.wishlist.ids()));

  /** Contact form query for this saved product, including its photo. */
  protected consultQuery(product: Product): Record<string, string> {
    const params: Record<string, string> = { product: product.slug };
    const image = product.images[0];
    if (image) {
      params['image'] = image;
    }
    return params;
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
