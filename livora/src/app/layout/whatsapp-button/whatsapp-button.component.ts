import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '@core/data/site.data';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * Fixed chat button, bottom-right on every page. Opens WhatsApp to the store number.
 */
@Component({
  selector: 'app-whatsapp-button',
  imports: [SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.scss',
})
export class WhatsappButtonComponent {
  protected readonly href = `https://wa.me/${SITE_CONFIG.contact.phoneHref.replace(/\D/g, '')}`;
}
