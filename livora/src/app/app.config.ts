import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { LivoraTitleStrategy } from './core/services/page-title.service';
import { ProductService } from './core/services/product.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // The router's anchor scrolling uses window.scrollTo() and ignores CSS `scroll-padding-top`, so tell it how tall the
    // sticky header bar is (the header publishes it as --header-height on <html>) – fragment links land below it.
    // Browser only: getComputedStyle(document) does not exist during prerendering.
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
      }
      inject(ViewportScroller).setOffset(() => {
        const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
        return [0, (Number.isFinite(bar) ? bar : 76) + 16];
      });
    }),
    // Products come from Supabase; wait for them (max 6 s, then the bundled catalog) so deep links resolve.
    // Browser only: during prerendering the bundled catalog is used (a network load here would run once per
    // prerendered page and could delay the build by up to 6 s per page).
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
      }
      return Promise.race([
        inject(ProductService).load(),
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]);
    }),
    provideRouter(
      routes,
      // route params / query params / route data → component input()s
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: LivoraTitleStrategy },
  ],
};
