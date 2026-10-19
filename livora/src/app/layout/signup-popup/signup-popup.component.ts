import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { imageVariant } from '../../core/utils/image.utils';

const STORAGE_KEY = 'humblehome.signupBanner';
const LAST_IMAGE_KEY = 'humblehome.signupBanner.image';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FALLBACK_IMAGE = 'assets/images/shop-gd-01.jpg';

/**
 * Editorial promo popup: random product photo + 10% off signup.
 * Image is re-rolled each visit. Closing hides for the session; signup hides permanently.
 */
@Component({
  selector: 'app-signup-popup',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup-popup.component.html',
  styleUrl: './signup-popup.component.scss',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class SignupPopupComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly toast = inject(ToastService);
  private readonly catalog = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly site = SITE_CONFIG;
  protected readonly open = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly featureImage = signal(FALLBACK_IMAGE);
  protected readonly featureIndex = signal('01');
  protected readonly featureName = signal('');

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  constructor() {
    afterNextRender(() => {
      this.pickFeatureProduct();
      if (this.alreadySeen()) {
        return;
      }
      const timer = window.setTimeout(() => {
        this.open.set(true);
        this.doc.documentElement.style.overflow = 'hidden';
        requestAnimationFrame(() => this.field()?.nativeElement.focus({ preventScroll: true }));
      }, 900);
      this.destroyRef.onDestroy(() => {
        window.clearTimeout(timer);
        this.doc.documentElement.style.overflow = '';
      });
    });
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.doc.documentElement.style.overflow = '';
    this.persist('dismissed');
  }

  protected submit(event: Event, value: string): void {
    event.preventDefault();
    const email = value.trim();
    if (!email) {
      this.error.set('Enter email address');
      this.field()?.nativeElement.focus();
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.error.set('Please enter a valid email address.');
      this.field()?.nativeElement.focus();
      return;
    }

    this.error.set(null);
    this.submitting.set(true);

    void fetch(`https://formsubmit.co/ajax/${SITE_CONFIG.contact.email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        // Hidden field name "10%" appears as a row in the FormSubmit email table.
        '10%': 'Yes – first signup offer',
        source: 'Website signup popup',
        featuredProduct: this.featureName() || '—',
        _subject: '[10% OFFER] Newsletter signup – Humble Home',
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
      }),
      keepalive: true,
    }).finally(() => this.submitting.set(false));

    this.persist('subscribed');
    this.open.set(false);
    this.doc.documentElement.style.overflow = '';
    this.toast.show('Welcome! Check your inbox for your 10% off details.', {
      type: 'success',
      duration: 5500,
    });
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const root = this.dialog()?.nativeElement;
    if (!root) {
      return;
    }
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>('button, input, a[href]'),
    ).filter((el) => !el.hasAttribute('disabled'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.doc.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  private pickFeatureProduct(): void {
    const products = this.catalog.all().filter((p) => p.images?.length);
    if (!products.length) {
      this.featureImage.set(FALLBACK_IMAGE);
      this.featureName.set('');
      this.featureIndex.set('01');
      return;
    }

    let last = '';
    try {
      last = sessionStorage.getItem(LAST_IMAGE_KEY) ?? '';
    } catch {
      last = '';
    }

    const pool = products.length > 1 ? products.filter((p) => p.images[0] !== last) : products;
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? products[0];
    const image = imageVariant(pick.images[0], '600x600');
    const index = String((products.indexOf(pick) % 99) + 1).padStart(2, '0');

    this.featureImage.set(image);
    this.featureName.set(pick.name);
    this.featureIndex.set(index);

    try {
      sessionStorage.setItem(LAST_IMAGE_KEY, pick.images[0]);
    } catch {
      /* ignore */
    }
  }

  private alreadySeen(): boolean {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'subscribed') {
        return true;
      }
      if (localStorage.getItem(STORAGE_KEY) === 'dismissed') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return sessionStorage.getItem(STORAGE_KEY) === 'dismissed';
    } catch {
      return false;
    }
  }

  private persist(value: 'dismissed' | 'subscribed'): void {
    try {
      if (value === 'subscribed') {
        localStorage.setItem(STORAGE_KEY, value);
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* private mode / blocked storage */
    }
  }
}
