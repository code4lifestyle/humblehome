import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

interface BestSellerTile {
  image: string;
  /** Visible label, e.g. "Cabinets | 800+ Items". */
  title: string;
  /** Short name used for the image alt text and the accessible link label. */
  name: string;
}

/**
 * "Best Seller / Best Selling Furniture Collection" – one large tile on the left, four smaller ones on the right.
 * Used on Home and About. Every tile links to the shop, like the original.
 */
@Component({
  selector: 'app-best-seller-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, SectionTitleComponent],
  templateUrl: './best-seller-section.component.html',
  styleUrl: './best-seller-section.component.scss',
})
export class BestSellerSectionComponent {
  protected readonly featured: BestSellerTile = {
    image: 'assets/images/best-seller-img-1.jpg',
    title: 'Upholstered Storage Beds | 1500+ Designs',
    name: 'Upholstered Storage Beds',
  };

  protected readonly tiles: BestSellerTile[] = [
    {
      image: 'assets/images/best-seller-img-2.jpg',
      title: 'Cabinets | 800+ Items',
      name: 'Cabinets',
    },
    {
      image: 'assets/images/best-seller-img-3.jpg',
      title: 'Dining Sets | 750+ Designs',
      name: 'Dining Sets',
    },
    {
      image: 'assets/images/best-seller-img-4.jpg',
      title: 'Sofa Sets | 1200+ Styles',
      name: 'Sofa Sets',
    },
    {
      image: 'assets/images/best-seller-img-5.jpg',
      title: 'Coffee Tables | 550+ Items',
      name: 'Coffee Tables',
    },
  ];
}
