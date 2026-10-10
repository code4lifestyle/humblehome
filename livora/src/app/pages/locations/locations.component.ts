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
    'GD-01',
    'GD-34',
    'GD-45',
    'GC-47',
  ].map((number) => ({
    number,
    address: `${number} Dragon Mart 2, International City, Dubai, United Arab Emirates`,
  }));

  /** Fixed embed of Dragon Mart 2. Bypassing the sanitizer is safe because the URL is a literal. */
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Dragon%20Mart%202%20International%20City%20Dubai&t=m&z=16&output=embed&iwloc=near',
  );
}
