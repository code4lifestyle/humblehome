import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, ProductAttribute, ProductVariation } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { WishlistService } from '@core/services/wishlist.service';
import { findVariation, isVariable } from '@core/utils/product.utils';
import { needsDarkCheck } from '../product-detail.utils';

/**
 * The right-hand column of the product page: title, categories, excerpt + highlights, variation picker,
 * "Book a free consultation" + wishlist heart, and meta (SKU / Category / Brand).
 *
 * The consultation link opens /contact-us with the product slug and any chosen options (for example "Color: Black").
 * Variable products: the colour attribute is shown as round swatches (`attribute.swatches`) or – without swatch colours –
 * as a `<select>`. The chosen variation is reported through `variationChange` (the page uses it for the gallery image
 * and the badge).
 */
@Component({
  selector: 'app-product-summary',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-summary.component.html',
  styleUrl: './product-summary.component.scss',
})
export class ProductSummaryComponent {
  readonly product = input.required<Product>();
  readonly variationChange = output<ProductVariation | null>();

  private readonly catalog = inject(ProductService);
  private readonly wishlist = inject(WishlistService);

  private readonly picker = viewChild<ElementRef<HTMLElement>>('picker');

  /** attribute slug → chosen option ({ color: 'Black' }). */
  protected readonly chosen = signal<Record<string, string>>({});

  protected readonly variable = computed(() => isVariable(this.product()));
  protected readonly attributes = computed<ProductAttribute[]>(() =>
    this.variable() ? (this.product().attributes ?? []) : [],
  );
  protected readonly categories = computed(() => this.catalog.categoriesOf(this.product()));
  protected readonly brands = computed(() => this.catalog.brandsOf(this.product()));

  /** The variation matching every chosen option (null until all attributes are chosen). */
  protected readonly variation = computed<ProductVariation | null>(() =>
    this.variable() ? (findVariation(this.product(), this.chosen()) ?? null) : null,
  );
  protected readonly hasChoice = computed(() => Object.keys(this.chosen()).length > 0);
  /** "Color: Black" for whatever the shopper has picked, sent to the contact form. */
  protected readonly choiceLabel = computed(() =>
    this.attributes()
      .filter((attribute) => this.chosen()[attribute.slug])
      .map((attribute) => `${attribute.name}: ${this.chosen()[attribute.slug]}`)
      .join(', '),
  );
  protected readonly consultQuery = computed(() => {
    const product = this.product();
    const image = this.variation()?.image || product.images[0] || '';
    const params: Record<string, string> = { product: product.slug };
    if (image) {
      params['image'] = image;
    }
    const choice = this.choiceLabel();
    if (choice) {
      params['choice'] = choice;
    }
    return params;
  });

  protected readonly sku = computed(() => this.variation()?.sku ?? this.product().sku ?? 'N/A');
  /** WooCommerce prints "SKU: N/A" for variable products without SKU and no SKU line for simple ones. */
  protected readonly showSku = computed(() => !!this.product().sku || this.variable());
  protected readonly wished = computed(() => this.wishlist.has(this.product().id));

  // ------------------------------------------------------------------- variation picker

  protected isChosen(attribute: ProductAttribute, option: string): boolean {
    return this.chosen()[attribute.slug] === option;
  }

  protected swatchColour(attribute: ProductAttribute, option: string): string | undefined {
    return attribute.swatches?.[option];
  }

  protected darkCheck(attribute: ProductAttribute, option: string): boolean {
    return needsDarkCheck(this.swatchColour(attribute, option));
  }

  /** Roving tabindex of the swatch radio group: the chosen swatch, else the first one, is the tab stop. */
  protected tabStop(attribute: ProductAttribute, index: number): 0 | -1 {
    const chosen = this.chosen()[attribute.slug];
    const stop = chosen ? attribute.options.indexOf(chosen) : 0;
    return index === (stop < 0 ? 0 : stop) ? 0 : -1;
  }

  protected choose(attribute: ProductAttribute, option: string): void {
    this.chosen.update((chosen) => ({ ...chosen, [attribute.slug]: option }));
    this.variationChange.emit(this.variation());
  }

  protected onSelect(attribute: ProductAttribute, event: Event): void {
    const option = (event.target as HTMLSelectElement).value;
    if (option) {
      this.choose(attribute, option);
    } else {
      this.chosen.update((chosen) => {
        const next = { ...chosen };
        delete next[attribute.slug];
        return next;
      });
      this.variationChange.emit(null);
    }
  }

  protected clear(): void {
    this.chosen.set({});
    this.variationChange.emit(null);
    this.picker()?.nativeElement.querySelector<HTMLElement>('[tabindex="0"], select')?.focus();
  }

  /** Arrow keys move through the swatches like a radio group (and choose the swatch they land on). */
  protected onSwatchKey(event: KeyboardEvent, attribute: ProductAttribute, index: number): void {
    const last = attribute.options.length - 1;
    let target: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = index === 0 ? last : index - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.choose(attribute, attribute.options[target]);
    (event.currentTarget as HTMLElement).parentElement
      ?.querySelectorAll<HTMLElement>('[role="radio"]')
      [target]?.focus();
  }

  protected toggleWishlist(): void {
    this.wishlist.toggle(this.product());
  }
}
