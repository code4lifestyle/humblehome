import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Section heading of the theme: a small outlined pill with an accent dot ("eyebrow") above a big heading, optional
 * description as projected content.
 *
 *   <app-section-title eyebrow="Shop By Category" title="Explore Furniture Categories" />
 *   <app-section-title eyebrow="Top Rated Product" title="Discover Our Newest Arrivals" align="left" [light]="true">
 *     Find beautifully crafted furniture …
 *   </app-section-title>
 *
 * `tag` only changes the heading element (semantics) – the look is identical for h1/h2/h3.
 */
@Component({
  selector: 'app-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-title.component.html',
  styleUrl: './section-title.component.scss',
  host: {
    '[class.is-left]': "align() === 'left'",
    '[class.is-light]': 'light()',
  },
})
export class SectionTitleComponent {
  /** The small pill above the heading (accent dot + text). Omit to render the heading only. */
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly align = input<'center' | 'left'>('center');
  readonly tag = input<'h1' | 'h2' | 'h3'>('h2');
  /** White text / dark-divider outline for dark backgrounds. */
  readonly light = input(false);
}
