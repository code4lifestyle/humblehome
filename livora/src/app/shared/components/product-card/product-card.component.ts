import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { WishlistService } from '@core/services/wishlist.service';
import { imageVariant } from '@core/utils/image.utils';
import { discountPercent, isOnSale } from '@core/utils/product.utils';
/** `srcset` of the 300x300 / 600x600 variants of a product image (null without an image). */
const srcsetOf = (path?: string): string | null =>
  path ? `${imageVariant(path, '300x300')} 300w, ${imageVariant(path, '600x600')} 600w` : null;

/** 'living-room' → 'Living Room' (fallback when the catalog does not know the category). */
const prettify = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Product card used by the shop grid, related products, wishlist and the home "Top Rated" list.
 *
 *   <app-product-card [product]="p" />                       shop look: image + "Sale!" pill, title, stars
 *   <app-product-card [product]="p" layout="list" />         horizontal card with categories, excerpt and buttons
 *   <app-product-card [product]="p" badge="percent" />       home look: "-13%" tag top right, no image zoom
 *
 * Hover (or keyboard focus) reveals round buttons over the image: wishlist and view.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly layout = input<'grid' | 'list'>('grid');
  /** Discount badge: "Sale!" pill (shop, default), "-13%" tag (home) or none. Only shown for products on sale. */
  readonly badge = input<'sale' | 'percent' | 'none'>('sale');
  /** Category links above the title. `null` = automatic (shown in the list layout, hidden in the grid like the original). */
  readonly showCategories = input<boolean | null>(null);

  private readonly wishlist = inject(WishlistService);
  private readonly catalog = inject(ProductService);

  protected readonly link = computed(() => ['/product', this.product().slug]);
  protected readonly onSale = computed(() => isOnSale(this.product()));
  protected readonly percent = computed(() => discountPercent(this.product()));
  /** Heart state – `has()` reads the wishlist signal, so this follows every toggle. */
  protected readonly wished = computed(() => this.wishlist.has(this.product().id));

  protected readonly image = computed(() =>
    imageVariant(this.product().images[0] ?? '', '300x300'),
  );
  /** 300w + 600w candidates, so wide cards (3-column grids, wishlist) and hi-dpi screens get a sharp image. */
  protected readonly imageSrcset = computed(() => srcsetOf(this.product().images[0]));
  /** Second gallery image, faded in on hover. */
  protected readonly hoverImage = computed(() => {
    const second = this.product().images[1];
    return second ? imageVariant(second, '300x300') : null;
  });
  protected readonly hoverSrcset = computed(() => srcsetOf(this.product().images[1]));

  protected readonly brand = computed(() => this.catalog.brandBySlug(this.product().brand));
  protected readonly categories = computed(() =>
    this.product().categories.map((slug) => ({
      slug,
      name: this.catalog.categoryBySlug(slug)?.name ?? prettify(slug),
    })),
  );
  protected readonly categoriesVisible = computed(
    () => this.showCategories() ?? this.layout() === 'list',
  );

  protected toggleWishlist(): void {
    this.wishlist.toggle(this.product());
  }
}
