import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/** Router link commands, e.g. `['/product-category', 'office-furniture']`. */
type LinkTarget = string | readonly string[];

interface TrendingCard {
  image: string;
  /** Upper-case category label, e.g. OFFICE. */
  title: string;
  /** Plain part of the tag line. */
  text: string;
  /** Emphasised (dark, bold) last word of the tag line. */
  strong: string;
  link: LinkTarget;
}

interface OfferBanner {
  /** Modifier class that carries the banner's gradient (see the SCSS). */
  tone: 'sand' | 'stone' | 'olive';
  badge: string;
  title: string;
  text: string;
  price: string;
  image: string;
  link: LinkTarget;
}

/**
 * "Trending Now / Trending Space Inspirations" – three image cards (OFFICE / CHAIRS / SOFAS) followed by three
 * "UP TO x% OFF" offer banners. Used on Home and Testimonials.
 */
@Component({
  selector: 'app-trending-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './trending-section.component.html',
  styleUrl: './trending-section.component.scss',
})
export class TrendingSectionComponent {
  protected readonly cards: TrendingCard[] = [
    {
      image: 'assets/images/trending-product-image-1.jpg',
      title: 'OFFICE',
      text: 'Designed For Productive',
      strong: 'Living',
      link: ['/product-category', 'office-furniture'],
    },
    {
      image: 'assets/images/trending-product-image-2.jpg',
      title: 'CHAIRS',
      text: 'Comfort Meets Timeless',
      strong: 'Style',
      link: '/shop',
    },
    {
      image: 'assets/images/trending-product-image-3.jpg',
      title: 'SOFAS',
      text: 'Create Moments Of',
      strong: 'Togetherness',
      link: ['/product-category', 'living-room'],
    },
  ];

  protected readonly offers: OfferBanner[] = [
    {
      tone: 'sand',
      badge: 'UP TO 50% OFF',
      title: 'Luxury Sofa',
      text: 'Elegant Modern Comfort',
      price: 'AED 9,000',
      image: 'assets/images/product-offer-image-1.png',
      link: ['/product-category', 'living-room'],
    },
    {
      tone: 'stone',
      badge: 'UP TO 40% OFF',
      title: 'Modern Desk',
      text: 'Smart Workspaces',
      price: 'AED 1,800',
      image: 'assets/images/product-offer-image-2.png',
      link: ['/product-category', 'office-furniture'],
    },
    {
      tone: 'olive',
      badge: 'UP TO 35% OFF',
      title: 'Dining Set',
      text: 'Elegant Dining',
      price: 'AED 5,500',
      image: 'assets/images/product-offer-image-3.png',
      link: ['/product-category', 'dining-room'],
    },
  ];
}
