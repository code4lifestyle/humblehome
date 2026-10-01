import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { PriceRange } from '../shop.utils';

type RatingStep = 1 | 2 | 3 | 4 | 5;

/**
 * The four facets of the shop sidebar: price range, product rating, categories and brands (ShopEngine "product filters").
 * Purely presentational – the page owns the URL: every user action is emitted and the current selection comes back in
 * through the inputs.
 *
 * On `/product-category/:slug` the category list is locked to that category (`lockedCategory`) and on `/brand/:slug` the
 * brand list is locked (`lockedBrand`): the rows then link to the other category / brand pages instead of being checkboxes.
 */
@Component({
  selector: 'app-shop-filters',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shop-filters.component.html',
  styleUrl: './shop-filters.component.scss',
})
export class ShopFiltersComponent {
  private readonly catalog = inject(ProductService);

  /** Active price limits (`null` = unbounded). */
  readonly minPrice = input<number | null>(null);
  readonly maxPrice = input<number | null>(null);
  /** Active minimum rating (`null` = any). */
  readonly rating = input<number | null>(null);
  /** Selected category / brand slugs (checkbox mode). */
  readonly categories = input<readonly string[]>([]);
  readonly brands = input<readonly string[]>([]);
  /** Route-locked category / brand slug (the list then navigates instead of filtering). */
  readonly lockedCategory = input<string | null>(null);
  readonly lockedBrand = input<string | null>(null);

  readonly priceChange = output<PriceRange>();
  readonly ratingChange = output<number | null>();
  readonly categoriesChange = output<string[]>();
  readonly brandsChange = output<string[]>();

  protected readonly bounds = this.catalog.priceBounds();
  protected readonly categoryList = this.catalog.categories();
  protected readonly brandList = this.catalog.brands();

  /** 5 → 1 with "N stars & up" counts (the rating filter is a minimum, so the counts add up). */
  protected readonly ratingRows: readonly { step: RatingStep; count: number; label: string }[] =
    (() => {
      const perStar = this.catalog.ratingCounts();
      let running = 0;
      return ([5, 4, 3, 2, 1] as const).map((step) => {
        running += perStar[step];
        return {
          step,
          count: running,
          label: step === 5 ? 'Rated 5 out of 5' : `Rated ${step} out of 5 and up`,
        };
      });
    })();
  protected readonly stars = [1, 2, 3, 4, 5] as const;

  /** What the slider / fields show while the user is still adjusting; the URL only changes on commit. */
  protected readonly draftMin = linkedSignal(() => this.minPrice() ?? this.bounds.min);
  protected readonly draftMax = linkedSignal(() => this.maxPrice() ?? this.bounds.max);

  /** Slider geometry as 0…1 fractions. */
  protected readonly lowFraction = computed(() => this.fraction(this.draftMin()));
  protected readonly highFraction = computed(() => this.fraction(this.draftMax()));
  /** When both thumbs sit at the far right the low one must be on top, otherwise it could never be pulled back. */
  protected readonly lowOnTop = computed(() => this.lowFraction() > 0.5);

  private fraction(value: number): number {
    const span = this.bounds.max - this.bounds.min;
    return span > 0 ? Math.min(1, Math.max(0, (value - this.bounds.min) / span)) : 0;
  }

  protected aed(value: number): string {
    return value.toLocaleString('en-US');
  }

  // ------------------------------------------------------------------------------------------------------- price

  /** Live while dragging (`input` event): only the label and the fill follow, the URL is untouched. */
  protected onRangeInput(which: 'min' | 'max', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(value)) {
      return;
    }
    if (which === 'min') {
      this.draftMin.set(Math.min(value, this.draftMax()));
    } else {
      this.draftMax.set(Math.max(value, this.draftMin()));
    }
    // the native thumb must not cross the other one
    (event.target as HTMLInputElement).value = String(
      which === 'min' ? this.draftMin() : this.draftMax(),
    );
  }

  /** Number fields: applied when the field loses focus / Enter is pressed (`change` event). */
  protected onPriceField(which: 'min' | 'max', event: Event): void {
    const input = event.target as HTMLInputElement;
    const typed = input.value.trim() === '' ? NaN : Number(input.value);
    const { min, max } = this.bounds;
    if (which === 'min') {
      const value = Number.isFinite(typed) ? Math.round(typed) : min;
      this.draftMin.set(Math.min(Math.max(value, min), this.draftMax()));
      input.value = String(this.draftMin());
    } else {
      const value = Number.isFinite(typed) ? Math.round(typed) : max;
      this.draftMax.set(Math.max(Math.min(value, max), this.draftMin()));
      input.value = String(this.draftMax());
    }
    this.commitPrice();
  }

  /** Slider released / key step done → tell the page. */
  protected commitPrice(): void {
    const { min, max } = this.bounds;
    const lo = this.draftMin() <= min ? null : this.draftMin();
    const hi = this.draftMax() >= max ? null : this.draftMax();
    if (lo !== this.minPrice() || hi !== this.maxPrice()) {
      this.priceChange.emit({ min: lo, max: hi });
    }
  }

  protected resetPrice(): void {
    this.draftMin.set(this.bounds.min);
    this.draftMax.set(this.bounds.max);
    if (this.minPrice() !== null || this.maxPrice() !== null) {
      this.priceChange.emit({ min: null, max: null });
    }
  }

  // ------------------------------------------------------------------------------------------------------- rating

  /** Click = filter by "N stars & up", click the active row again = clear. */
  protected toggleRating(step: number): void {
    this.ratingChange.emit(this.rating() === step ? null : step);
  }

  // ------------------------------------------------------------------------------------------ categories / brands

  protected toggleCategory(slug: string, checked: boolean): void {
    this.categoriesChange.emit(this.toggled(this.categories(), slug, checked));
  }

  protected toggleBrand(slug: string, checked: boolean): void {
    this.brandsChange.emit(this.toggled(this.brands(), slug, checked));
  }

  private toggled(current: readonly string[], slug: string, checked: boolean): string[] {
    const rest = current.filter((entry) => entry !== slug);
    return checked ? [...rest, slug] : rest;
  }
}
