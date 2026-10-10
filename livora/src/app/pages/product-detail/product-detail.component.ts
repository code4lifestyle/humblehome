import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product, ProductVariation } from '@core/models';
import { PageTitleService } from '@core/services/page-title.service';
import { ProductService } from '@core/services/product.service';
import { discountPercent, isVariable } from '@core/utils/product.utils';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';
import { breadcrumbCategorySlug, variationDiscount } from './product-detail.utils';
import { ProductGalleryComponent } from './product-gallery/product-gallery.component';
import { ProductSummaryComponent } from './product-summary/product-summary.component';
import { ProductTabsComponent } from './product-tabs/product-tabs.component';

/**
 * /product/:slug – the single product page (original: `product/<slug>/index.html`, Elementor template 3126).
 *
 *   breadcrumb (Home › category › product) · gallery | summary · tabs (Description / Additional information / Reviews)
 *   · "Featured products – Explore Our Signature Jewellery Pieces" heading + the related products.
 *
 * The page resolves the product and owns the one piece of state the two columns share: the chosen variation (its image
 * goes to the gallery, its discount to the badge). An unknown slug shows the 404 page without changing the URL.
 */
@Component({
  selector: 'app-product-detail-page',
  imports: [
    RouterLink,
    ProductGalleryComponent,
    ProductSummaryComponent,
    ProductTabsComponent,
    ProductCardComponent,
    SectionTitleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  /** Route param `:slug` (bound by `withComponentInputBinding`). */
  readonly slug = input<string>();

  private readonly catalog = inject(ProductService);
  private readonly router = inject(Router);
  private readonly pageTitle = inject(PageTitleService);

  private readonly product = computed<Product | undefined>(() => {
    const slug = this.slug();
    return slug ? this.catalog.bySlug(slug) : undefined;
  });

  /**
   * Everything the template needs for the current product – as a list with 0 or 1 entries. `@for … track product.id`
   * then throws the whole view away and builds a new one when the route changes from one product to another, so the
   * chosen options, quantity, active tab, gallery position, lightbox and the local reviews never leak between products.
   */
  protected readonly views = computed(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    const categorySlug = breadcrumbCategorySlug(product);
    return [
      {
        product,
        category: categorySlug ? this.catalog.categoryBySlug(categorySlug) : undefined,
        related: this.catalog.related(product, 3),
      },
    ];
  });

  /** Variation chosen in the summary (null = none); starts empty for every product. */
  protected readonly variation = linkedSignal<Product | undefined, ProductVariation | null>({
    source: this.product,
    computation: () => null,
  });

  /**
   * "17% OFF": the discount of the chosen variation – of the first one until a choice is made (like the original) –
   * or of the product itself. No badge when the product is not on sale.
   */
  protected readonly badge = computed(() => {
    const product = this.product();
    if (!product) {
      return null;
    }
    const percent = isVariable(product)
      ? variationDiscount(this.variation() ?? product.variations![0])
      : discountPercent(product);
    return percent > 0 ? `${percent}% OFF` : null;
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      const product = this.product();
      if (product) {
        this.pageTitle.set(product.name, {
          description: product.excerpt,
          image: product.images[0],
        });
      } else if (slug !== undefined) {
        // unknown product: render the 404 page in place (the address bar keeps the requested URL)
        void this.router.navigateByUrl('/404', { skipLocationChange: true });
      }
    });
  }
}
