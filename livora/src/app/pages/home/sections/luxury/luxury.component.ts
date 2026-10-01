import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * "Luxury TV Cabinets Crafted With Elegance" – rounded cream box: heading, two icon feature boxes and a dotted list on
 * the left, photo on the right (with the theme's "shiny glass" sweep on hover). Original: Elementor container 989439a.
 */
@Component({
  selector: 'app-home-luxury',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './luxury.component.html',
  styleUrl: './luxury.component.scss',
})
export class HomeLuxuryComponent {
  protected readonly highlights: readonly string[] = [
    'Premium Wood',
    'Easy To Maintain',
    'Durable Build Quality',
  ];
}
