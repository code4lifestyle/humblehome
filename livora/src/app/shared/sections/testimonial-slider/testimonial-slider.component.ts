import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Testimonial } from '@core/models/content.model';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';
import { SliderComponent } from '@shared/components/slider/slider.component';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';

/** Wraps the quote in typographic quotes unless the content already carries its own. */
function withQuoteMarks(quote: string): string {
  const text = quote.trim();
  return /^["“”„‟]/.test(text) ? text : `“${text}”`;
}

/**
 * "Happy Customer / Beautiful Furniture Trusted By Modern Families" – armchair image on the left, heading + auto-playing
 * testimonial slider on the right. Used on Home and About; the caller supplies the testimonials
 * (`ContentService.testimonials()`).
 *
 *   <app-testimonial-slider [items]="content.testimonials()" />
 */
@Component({
  selector: 'app-testimonial-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitleComponent, SliderComponent, StarRatingComponent],
  templateUrl: './testimonial-slider.component.html',
  styleUrl: './testimonial-slider.component.scss',
})
export class TestimonialSliderComponent {
  readonly items = input<Testimonial[]>([]);

  protected readonly slides = computed(() =>
    this.items().map((item) => ({ ...item, quote: withQuoteMarks(item.quote) })),
  );

  /** A slider with a single slide neither loops nor autoplays. */
  protected readonly multiple = computed(() => this.items().length > 1);
}
