import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';

/**
 * Dark site footer: social links, logo, Quick Links, Customer Services, contact information,
 * and copyright.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly footer = SITE_CONFIG.footer;
  protected readonly social = [
    ...SITE_CONFIG.social.filter((link) => link.name !== 'whatsapp'),
    {
      name: 'snapchat',
      url: 'https://www.snapchat.com/',
      icon: 'fa-brands fa-snapchat',
    },
  ];
}
