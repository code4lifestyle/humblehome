import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SITE_CONFIG } from '@core/data/site.data';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';

/**
 * /our-locations – the store address, hours, and map. Linked from the header before Contact Us.
 */
@Component({
  selector: 'app-locations-page',
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
})
export class LocationsComponent {
  protected readonly contact = SITE_CONFIG.contact;
  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Our Locations' },
  ];

  /** Fixed embed of the store area. Bypassing the sanitizer is safe because the URL is a literal. */
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=United%20Arab%20Emirates&t=m&z=6&output=embed&iwloc=near',
  );
}
