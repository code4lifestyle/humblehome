import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
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
 * /contact-us – inquiry form (sent to SITE_CONFIG.contact.email), contact info, social icons, and store map.
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

  protected readonly sending = signal(false);
  private readonly inbox = SITE_CONFIG.contact.email;

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
      text: SITE_CONFIG.contact.phone,
      href: SITE_CONFIG.contact.phoneHref,
    },
    {
      icon: CONTACT_ICONS.mail,
      title: 'Email:',
      text: SITE_CONFIG.contact.email,
      href: `mailto:${SITE_CONFIG.contact.email}`,
    },
    { icon: CONTACT_ICONS.clock, title: 'Open Store:', text: SITE_CONFIG.contact.hours },
  ];

  protected readonly social = SITE_CONFIG.social.map((link) => {
    const names: Record<string, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      whatsapp: 'WhatsApp',
      x: 'X',
    };
    return {
      ...link,
      label: `Humble Home on ${names[link.name] ?? link.name}`,
    };
  });

  // ── store map ────────────────────────────────────────────────────────────────────────────────────────────────────────
  /** Family Friends Furniture at Dragon Mart 2. Safe because the URL is a literal. */
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Family%20Friends%20Furniture%2C%20Dragon%20Mart%202%2C%20Dubai&ll=25.1737648,55.4218103&t=m&z=17&output=embed&iwloc=near',
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
      this.host.nativeElement.querySelector<HTMLElement>('.form-control.ng-invalid')?.focus();
      return;
    }
    if (this.sending()) {
      return;
    }

    const item = this.consultation();
    const { name, email, phone, inquiry } = this.form.getRawValue();
    this.sending.set(true);

    const body = JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      inquiry: inquiry.trim(),
      product: item?.name ?? '',
      choice: item?.choice ?? '',
      _subject: item
        ? `Consultation request: ${item.name}`
        : 'New contact form message – Humble Home',
      _replyto: email.trim(),
      _template: 'table',
      _captcha: 'false',
    });

    // FormSubmit can take 45–75s before responding (SMTP happens before the HTTP reply).
    // Confirm the UI immediately and deliver email in the background with keepalive.
    void fetch(`https://formsubmit.co/ajax/${this.inbox}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
      keepalive: true,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          success?: string | boolean;
          message?: string;
        } | null;
        const accepted =
          response.ok &&
          (payload == null ||
            payload.success === true ||
            payload.success === 'true' ||
            payload.success === undefined);
        if (!accepted) {
          this.toast.show(
            `Sorry, we could not send your message. Please email ${this.inbox} directly.`,
            { type: 'error', duration: 8000 },
          );
        }
      })
      .catch(() => {
        this.toast.show(
          `Sorry, we could not send your message. Please email ${this.inbox} directly.`,
          { type: 'error', duration: 8000 },
        );
      });

    this.toast.show(
      item
        ? `Thank you! Your consultation request for ${item.name} has been sent.`
        : 'Thank you! Your message has been sent successfully.',
      { type: 'success', duration: 5000 },
    );
    this.form.reset();
    this.sending.set(false);
  }
}
