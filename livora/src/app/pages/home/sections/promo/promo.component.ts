import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Offer {
  /** Modifier class carrying the background photo (see the SCSS). */
  photo: 'one' | 'two';
  eyebrow: string;
  title: string;
}

/**
 * The two big promo boxes under the category slider ("Save Up To 50% / Limited Time Flash Sale" and
 * "Extra 20% Off / Mega Furniture Sale Event"), each with a "Shop Now" link to the shop.
 * Original: Elementor containers a9bf92d and ba620d3 (`.offer-item`).
 */
@Component({
  selector: 'app-home-promo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './promo.component.html',
  styleUrl: './promo.component.scss',
})
export class HomePromoComponent {
  protected readonly offers: readonly Offer[] = [
    { photo: 'one', eyebrow: 'Save Up To 50%', title: 'Limited Time Flash Sale' },
    { photo: 'two', eyebrow: 'Extra 20% Off', title: 'Mega Furniture Sale Event' },
  ];
}
