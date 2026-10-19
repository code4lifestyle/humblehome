import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * Dark site footer (owner: shell agent): social · logo · "Call 24/7", Quick Links,
 * Customer Services, contact information, and copyright.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly footer = SITE_CONFIG.footer;
}
