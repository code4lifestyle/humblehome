import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Order, OrderAddress, PaymentMethodId } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@core/services/order.service';
import { PageTitleService } from '@core/services/page-title.service';
import { round2 } from '@core/utils/product.utils';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { COUNTRIES, PAYMENT_METHODS } from './checkout.data';
import { OrderReceivedComponent } from './order-received/order-received.component';
import { OrderSummaryComponent, OrderSummaryLine } from './order-summary/order-summary.component';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTCODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/;
const PHONE_PATTERN = /^[+\d][\d\s().+-]*$/;

const text = (control: AbstractControl): string => String(control.value ?? '').trim();

/** `Validators.required` accepts "   " – this one does not. */
const required: ValidatorFn = (control): ValidationErrors | null =>
  text(control) ? null : { required: true };
const email: ValidatorFn = (control) =>
  !text(control) || EMAIL_PATTERN.test(text(control)) ? null : { email: true };
const postcode: ValidatorFn = (control) =>
  !text(control) || POSTCODE_PATTERN.test(text(control)) ? null : { postcode: true };
const phone: ValidatorFn = (control) => {
  const value = text(control);
  const digits = value.replace(/\D/g, '').length;
  return !value || (PHONE_PATTERN.test(value) && digits >= 7 && digits <= 15)
    ? null
    : { phone: true };
};

const field = (value = '', ...validators: ValidatorFn[]) =>
  new FormControl<string>(value, { nonNullable: true, validators });

/** Fields shared by the billing and the shipping address. */
const addressControls = () => ({
  firstName: field('', required),
  lastName: field('', required),
  company: field(),
  country: field(COUNTRIES[0].code, required),
  address1: field('', required),
  address2: field(),
  city: field('', required),
  state: field('', required),
  postcode: field('', required, postcode),
});

/**
 * `/checkout` – WooCommerce style checkout (the original mirror redirects to the cart, so it is not mirrored):
 *
 *  - cart with items      → billing form + "Your order" box (payment methods, terms, Place order)
 *  - order just placed    → the "Order received" view at the same URL (also after a reload: the order is in localStorage)
 *  - empty cart, no order → redirect to `/cart`
 */
@Component({
  selector: 'app-checkout-page',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    OrderSummaryComponent,
    OrderReceivedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  protected readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly pageTitle = inject(PageTitleService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Checkout' },
  ];
  protected readonly receivedCrumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Checkout', link: '/checkout' },
    { label: 'Order received' },
  ];
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly countries = COUNTRIES;

  /** The order shown by the "received" view: just placed, or (after a reload) the last one placed within the hour. */
  protected readonly order = signal<Order | null>(this.orders.recent());
  protected readonly submitted = signal(false);
  protected readonly shipDifferent = signal(false);

  protected readonly form = new FormGroup({
    billing: new FormGroup({
      ...addressControls(),
      phone: field('', required, phone),
      email: field('', required, email),
    }),
    shipping: new FormGroup(addressControls()),
    notes: field(),
    payment: new FormControl<PaymentMethodId>('bacs', { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  protected readonly payment = toSignal(this.form.controls.payment.valueChanges, {
    initialValue: this.form.controls.payment.value,
  });

  /** `form` = something to check out, `received` = show the thank-you view, `empty` = nothing here → back to the cart. */
  protected readonly view = computed<'form' | 'received' | 'empty'>(() =>
    !this.cart.isEmpty() ? 'form' : this.order() ? 'received' : 'empty',
  );

  protected readonly lines = computed<OrderSummaryLine[]>(() =>
    this.cart.items().map((item) => ({
      key: item.key,
      name: item.name,
      slug: item.slug,
      image: item.image,
      quantity: item.quantity,
      lineTotal: round2(item.unitPrice * item.quantity),
      variation: item.variation?.label,
    })),
  );

  constructor() {
    this.form.controls.shipping.disable(); // only validated / submitted when "Ship to a different address?" is ticked

    const user = this.auth.user();
    if (user) {
      const [firstName, ...rest] = user.name.split(' ');
      this.form.controls.billing.patchValue({
        email: user.email,
        firstName,
        lastName: rest.join(' '),
      });
    }

    effect(() => {
      if (this.view() === 'empty') {
        void this.router.navigate(['/cart'], { replaceUrl: true });
      }
    });
    effect(() => {
      if (this.view() === 'received') {
        this.pageTitle.set('Order Received');
      }
    });
  }

  protected toggleShipping(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipDifferent.set(checked);
    if (checked) {
      this.form.controls.shipping.enable();
    } else {
      this.form.controls.shipping.disable();
    }
  }

  /**
   * Message for an invalid control, shown once the field was touched or a submit was attempted; `null` when fine.
   * `path` is a form path (`billing.email`, `terms`), `label` names the field in "X is a required field.".
   */
  protected error(path: string, label: string): string | null {
    const control = this.form.get(path);
    if (!control || control.valid || control.disabled || !(control.touched || this.submitted())) {
      return null;
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (control.hasError('phone')) {
      return 'Please enter a valid phone number.';
    }
    if (control.hasError('postcode')) {
      return 'Please enter a valid postcode / ZIP.';
    }
    if (path === 'terms') {
      return 'Please read and accept the terms and conditions to proceed with your order.';
    }
    return `${label} is a required field.`;
  }

  protected placeOrder(): void {
    if (this.order() && this.cart.isEmpty()) {
      return; // a double click on "Place order" – the first one already created the order
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.host.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')
        ?.focus();
      return;
    }

    const value = this.form.getRawValue();
    const method = PAYMENT_METHODS.find((m) => m.id === value.payment) ?? PAYMENT_METHODS[0];
    const placed = this.orders.place({
      billing: {
        ...this.toAddress(value.billing),
        phone: value.billing.phone.trim(),
        email: value.billing.email.trim(),
      },
      shippingAddress: this.shipDifferent() ? this.toAddress(value.shipping) : undefined,
      notes: value.notes,
      payment: { id: method.id, title: method.title },
    });
    if (!placed) {
      void this.router.navigate(['/cart']);
      return;
    }

    this.order.set(placed); // the cart is empty now → `view` switches to "received" (and not to the redirect)
    this.submitted.set(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  private toAddress(group: {
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
  }): OrderAddress {
    const country = COUNTRIES.find((c) => c.code === group.country) ?? COUNTRIES[0];
    const optional = (v: string): string | undefined => v.trim() || undefined;
    return {
      firstName: group.firstName.trim(),
      lastName: group.lastName.trim(),
      company: optional(group.company),
      countryCode: country.code,
      country: country.name,
      address1: group.address1.trim(),
      address2: optional(group.address2),
      city: group.city.trim(),
      state: group.state.trim(),
      postcode: group.postcode.trim(),
    };
  }
}
