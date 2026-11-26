import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PixelTrackingService } from './core/services/pixel-tracking.service';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { SignupPopupComponent } from './layout/signup-popup/signup-popup.component';
import { ToastContainerComponent } from './layout/toast-container/toast-container.component';
import { WhatsappButtonComponent } from './layout/whatsapp-button/whatsapp-button.component';

const isAdminPath = (path: string): boolean => path === '/admin' || path.startsWith('/admin/');

/** App shell: skip link + header + routed page + footer + toast notifications. Owned by the shell agent. */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    WhatsappButtonComponent,
    ToastContainerComponent,
    SignupPopupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly pixelTracking = inject(PixelTrackingService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Dashboard pages render without the shop header, footer and WhatsApp button. */
  // DOCUMENT, not the bare `location` global: `location` does not exist during prerendering (Node).
  protected readonly isAdmin = signal(isAdminPath(this.document.location.pathname));

  constructor() {
    // After every navigation to another page (not the first load, not just a query-param change) move the keyboard focus
    // to the page content, so it never gets lost in a menu that just closed and screen readers start at the new page.
    // Pixel tracking and focus moves are browser-only: during prerendering there is no window and no focus.
    let previousPath: string | null = null;
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const path = e.urlAfterRedirects.split(/[?#]/)[0];
        this.isAdmin.set(isAdminPath(path));
        if (this.isBrowser) {
          if (!isAdminPath(path)) {
            this.pixelTracking.trackPageView();
          }
          if (previousPath !== null && path !== previousPath) {
            document.getElementById('content')?.focus({ preventScroll: true });
          }
        }
        previousPath = path;
      });
  }

  /** "Skip to content" link: move the focus (and the viewport) to the routed page. */
  protected skipToContent(event: Event): void {
    event.preventDefault();
    const content = document.getElementById('content');
    content?.focus({ preventScroll: true });
    content?.scrollIntoView();
  }
}
