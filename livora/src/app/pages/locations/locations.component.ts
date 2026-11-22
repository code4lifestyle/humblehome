import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';

/**
 * /our-locations – the store address, hours, and map. Linked from the header before Contact Us.
 */
@Component({
  selector: 'app-locations-page',
  imports: [PageHeaderComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
})
export class LocationsComponent {
  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Our Locations' },
  ];

  protected readonly shops: { name: string; address: string; image?: string; phone?: string; phoneHref?: string; mapsUrl?: string; }[] = [
    {
      name: 'GD-01',
      address: 'Dragon Mart 2, International City, Dubai, United Arab Emirates',
      image: 'assets/images/shop-gd-01.jpg',
    },
    {
      name: 'GD-34',
      address: 'Dragon Mart 2, International City, Dubai, United Arab Emirates',
      image: 'assets/images/shop-gd-34.jpg',
    },
    {
      name: 'GD-45',
      address: 'Dragon Mart 2, International City, Dubai, United Arab Emirates',
      image: 'assets/images/shop-gd-45.jpg',
    },
    {
      name: 'GC-47',
      address: 'Dragon Mart 2, International City, Dubai, United Arab Emirates',
      image: 'assets/images/shop-gc-47.jpg',
    },
  ];

  /** Pin for Humble Home at Dragon Mart 2. Safe because the URL is a literal. */
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Dragon%20Mart%202%2C%20Dubai&ll=25.1737648,55.4218103&t=m&z=17&output=embed&iwloc=near',
  );
}
