import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SITE_CONFIG } from '@core/data/site.data';
import { ProductService } from '@core/services/product.service';
import { imageVariant } from '@core/utils/image.utils';
import { ToastService } from '@core/services/toast.service';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';
import { CONTACT_ICONS, ContactIcon } from './contact-icons';

type FieldName = 'name' | 'email' | 'phone' | 'inquiry';

/** Error message per field and error key (the first failing validator wins). */
const MESSAGES: Record<FieldName, Record<string, string>> = {
  name: { required: 'Please enter your name.' },
  email: {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.',
    pattern: 'Please enter a valid email address.',
  },
  phone: {
    required: 'Please enter your phone number.',
    phone: 'Please enter a valid phone number.',
  },
  inquiry: { required: 'Please enter your product inquiry.' },
};

/** Like `Validators.required`, but a value made of spaces only counts as empty. */
function requiredTrimmed(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

/** 7–15 digits, optionally with a leading "+" and spaces, dots, dashes or brackets in between. */
function phoneValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();
  if (!value) {
    return null; // "required" reports the empty case
  }
  const digits = value.replace(/\D/g, '').length;
  return /^\+?[\d\s().-]+$/.test(value) && digits >= 7 && digits <= 15 ? null : { phone: true };
}

/**
 * /contact-us – banner, "Do You Have Any Questions?" form (Reactive Forms, inline validation, no backend: a toast confirms
 * and the form resets), the "Contact Info" card with address / phone / e-mail / opening hours + social icons and the
 * "Store Location" Google Maps embed.
 */
@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, NgTemplateOutlet, PageHeaderComponent, SectionTitleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toast = inject(ToastService);
  private readonly catalog = inject(ProductService);

  /** Set when the shopper arrives from a product page (`?product=slug&choice=Color: Black&image=…`). */
  readonly product = input<string>();
  readonly choice = input<string>();
  readonly image = input<string>();

  /** The product this consultation is about, when the link carried a known slug. */
  protected readonly consultation = computed(() => {
    const slug = this.product();
    if (!slug) {
      return null;
    }
    const item = this.catalog.bySlug(slug);
    const requested = this.image();
    const allowed = new Set(
      [item?.images ?? [], item?.variations?.map((variation) => variation.image) ?? []].flat(),
    );
    const image =
      (requested && allowed.has(requested) ? requested : item?.images[0]) || '';
    return {
      name: item?.name ?? slug,
      choice: this.choice()?.trim() ?? '',
      image: image ? imageVariant(image, '300x300') : '',
    };
  });

  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Contact Us' },
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [requiredTrimmed]],
    email: [
      '',
      [requiredTrimmed, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)],
    ],
    phone: ['', [requiredTrimmed, phoneValidator]],
    inquiry: ['', [requiredTrimmed]],
  });

  // ── contact info card (the contact page has its own wording, see the original) ───────────────────────────────────────
  protected readonly infoItems: {
    icon: ContactIcon;
    title: string;
    text: string;
    href?: string;
  }[] = [
    {
      icon: CONTACT_ICONS.home,
      title: 'Address:',
      text: 'United Arab Emirates',
    },
    {
      icon: CONTACT_ICONS.phone,
      title: 'Contact No.:',
      text: '+91 123 456 789',
      href: 'tel:+91123456789',
    },
    {
      icon: CONTACT_ICONS.mail,
      title: 'Email:',
      text: 'info@dominname.com',
      href: 'mailto:info@dominname.com',
    },
    { icon: CONTACT_ICONS.clock, title: 'Open Store:', text: SITE_CONFIG.contact.hours },
  ];

  protected readonly social = SITE_CONFIG.social.map((link) => ({
    ...link,
    label: `Humble Home on ${link.name === 'x' ? 'X' : link.name.charAt(0).toUpperCase() + link.name.slice(1)}`,
  }));

  // ── store map ────────────────────────────────────────────────────────────────────────────────────────────────────────
  /** Embed URL of the original page (a fixed literal, so bypassing the sanitizer is safe). */
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=United%20Arab%20Emirates&t=m&z=6&output=embed&iwloc=near',
  );

  constructor() {
    effect(() => {
      const item = this.consultation();
      if (!item || this.form.controls.inquiry.value.trim()) {
        return;
      }
      const choice = item.choice ? ` (${item.choice})` : '';
      this.form.controls.inquiry.setValue(`${item.name}${choice}`);
    });
  }

  /** Message to show under a field, or null while the field is valid or still untouched. */
  protected error(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || !control.touched) {
      return null;
    }
    const messages = MESSAGES[name];
    const key = Object.keys(control.errors ?? {}).find((k) => k in messages);
    return key ? messages[key] : 'Please check this field.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // move the focus to the first field with a problem
      this.host.nativeElement.querySelector<HTMLElement>('.form-control.ng-invalid')?.focus();
      return;
    }
    const item = this.consultation();
    this.toast.show(
      item
        ? `Thank you! Your consultation request for ${item.name} has been sent, including the product photo.`
        : 'Thank you! Your message has been sent.',
    );
    this.form.reset();
  }
}
