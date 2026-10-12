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

  protected readonly shops = [
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
    {
      name: 'Family Friends Furniture',
      address: 'Dragon Mart 2, Warsan First, Dubai International City, Dubai, United Arab Emirates',
      phone: '+971 52 604 7610',
      phoneHref: 'tel:+971526047610',
      mapsUrl: 'https://maps.app.goo.gl/ScVjkqFeNGk3HTng8',
    },
  ];

  /** Pin for Family Friends Furniture at Dragon Mart 2. Safe because the URL is a literal. */
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Family%20Friends%20Furniture%2C%20Dragon%20Mart%202%2C%20Dubai&ll=25.1737648,55.4218103&t=m&z=17&output=embed&iwloc=near',
  );
}
