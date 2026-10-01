import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type StarKind = 'full' | 'half' | 'empty';

const STAR_CLASS: Record<StarKind, string> = {
  full: 'fa-solid fa-star',
  half: 'fa-solid fa-star-half-stroke',
  empty: 'fa-regular fa-star',
};

/**
 * Five Font Awesome stars in the accent colour (WooCommerce "star-rating" look). Halves are supported:
 * the value is rounded to the nearest 0.5. The host element is one image for assistive tech: `role="img"` +
 * `aria-label="Rated 4.5 out of 5"` (the stars, value and count inside are decorative).
 *
 *   <app-star-rating [value]="4.5" [count]="12" size="sm" />
 */
@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()', '[attr.data-size]': 'size()' },
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
})
export class StarRatingComponent {
  /** Average rating 0–5 (halves allowed, anything else is rounded to the nearest half). */
  readonly value = input<number>(0);
  /** Number of ratings – rendered as "(12)" after the stars. Nothing is rendered for null/undefined. */
  readonly count = input<number | null | undefined>(undefined);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Also print the numeric value (e.g. "4.5") before the count. */
  readonly showValue = input(false);

  private readonly clamped = computed(() => {
    const v = Number(this.value());
    return Number.isFinite(v) ? Math.min(5, Math.max(0, v)) : 0;
  });

  /** Value rounded to the nearest half star. */
  private readonly rounded = computed(() => Math.round(this.clamped() * 2) / 2);

  protected readonly stars = computed<string[]>(() => {
    const v = this.rounded();
    return [1, 2, 3, 4, 5].map(
      (i) => STAR_CLASS[v >= i ? 'full' : v >= i - 0.5 ? 'half' : 'empty'],
    );
  });

  /** "4.5" / "5" – up to one decimal, no trailing zero. */
  protected readonly display = computed(() => String(Math.round(this.clamped() * 10) / 10));
  protected readonly label = computed(() => `Rated ${this.display()} out of 5`);
}
