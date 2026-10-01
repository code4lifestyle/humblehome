import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthErrorField } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@core/services/order.service';
import { ToastService } from '@core/services/toast.service';
import { WishlistService } from '@core/services/wishlist.service';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';

export type AccountView = 'auth' | 'lost-password';

interface FormFailure {
  field?: AuthErrorField;
  text: string;
}

const textField = () => new FormControl('', { nonNullable: true });

/**
 * `/my-account` (`data.view = 'auth'`) and `/my-account/lost-password` (`data.view = 'lost-password'`).
 *
 *  - signed out → "Login your account" + "Sign up your account" side by side (texts of the original page)
 *  - signed in  → dashboard: greeting, quick links (wishlist, cart, shop), recent order, log out
 *  - lost password → reset form; there is no mail server, so it only shows a confirmation toast (demo)
 *
 * Accounts are a MOCK kept in localStorage – see `AuthService`.
 */
@Component({
  selector: 'app-account-page',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  /** Route `data.view`. */
  readonly view = input<AccountView>('auth');

  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly orders = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly accountCrumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'My account' },
  ];
  protected readonly lastOrder = this.orders.last;

  protected readonly loginForm = new FormGroup({
    identifier: textField(),
    password: textField(),
    remember: new FormControl(false, { nonNullable: true }),
  });
  protected readonly registerForm = new FormGroup({ email: textField(), password: textField() });
  protected readonly resetForm = new FormGroup({ login: textField() });

  protected readonly showLoginPassword = signal(false);
  protected readonly showRegisterPassword = signal(false);
  protected readonly busy = signal(false);
  protected readonly loginError = signal<FormFailure | null>(null);
  protected readonly registerError = signal<FormFailure | null>(null);
  protected readonly resetError = signal<string | null>(null);
  protected readonly resetSent = signal(false);

  protected async login(): Promise<void> {
    if (this.busy()) {
      return;
    }
    const { identifier, password, remember } = this.loginForm.getRawValue();
    this.busy.set(true);
    this.loginError.set(null);
    try {
      const result = await this.auth.login({ identifier, password, remember });
      if (result.ok) {
        this.loginForm.reset();
        this.showLoginPassword.set(false);
        this.toast.show(`Welcome back, ${result.user.name}!`);
        this.focusDashboard();
      } else {
        this.loginError.set({ field: result.field, text: result.error });
        this.focusField(result.field === 'password' ? '#password' : '#username');
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected async register(): Promise<void> {
    if (this.busy()) {
      return;
    }
    const { email, password } = this.registerForm.getRawValue();
    this.busy.set(true);
    this.registerError.set(null);
    try {
      const result = await this.auth.register({ email, password });
      if (result.ok) {
        this.registerForm.reset();
        this.showRegisterPassword.set(false);
        this.toast.show(`Your account has been created. Welcome, ${result.user.name}!`);
        this.focusDashboard();
      } else {
        this.registerError.set({ field: result.field, text: result.error });
        this.focusField(result.field === 'password' ? '#reg_password' : '#reg_email');
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected resetPassword(): void {
    const login = this.resetForm.getRawValue().login.trim();
    if (!login) {
      this.resetSent.set(false);
      this.resetError.set('Enter a username or email address.');
      this.focusField('#user_login');
      return;
    }
    // demo: there is no mail server – never reveal whether the account exists, always confirm
    this.resetError.set(null);
    this.resetSent.set(true);
    this.resetForm.reset();
    this.toast.show('A password reset link has been sent to your email (demo)');
  }

  protected logout(): void {
    this.auth.logout();
    this.toast.show('You have been logged out.', { type: 'info' });
  }

  private focusField(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), {
      injector: this.injector,
    });
  }

  /** The forms are replaced by the dashboard → hand the focus to its heading. */
  private focusDashboard(): void {
    afterNextRender(
      () =>
        this.host.nativeElement
          .querySelector<HTMLElement>('.dash-title')
          ?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
}
