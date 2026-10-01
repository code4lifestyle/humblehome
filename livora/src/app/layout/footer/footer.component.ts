import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Dark site footer (owner: shell agent): social · logo · "Call 24/7", about text + newsletter, Quick Links,
 * Customer Services, contact information, and copyright. The newsletter has no backend – it validates the
 * address and confirms with a toast.
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

  private readonly toast = inject(ToastService);

  /** Validation message of the newsletter field (null = valid / untouched). */
  protected readonly newsletterError = signal<string | null>(null);

  protected subscribe(event: Event, field: HTMLInputElement): void {
    event.preventDefault();
    const email = field.value.trim();

    if (!email) {
      this.newsletterError.set('Please enter your email address.');
      field.focus();
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.newsletterError.set('Please enter a valid email address.');
      field.focus();
      return;
    }

    this.newsletterError.set(null);
    field.value = '';
    this.toast.show('Thank you for subscribing! You will now receive our latest news and offers.');
  }
}
