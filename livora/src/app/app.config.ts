import { ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
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
    provideAppInitializer(() => {
      inject(ViewportScroller).setOffset(() => {
        const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
        return [0, (Number.isFinite(bar) ? bar : 76) + 16];
      });
    }),
    // Products come from Supabase; wait for them (max 6 s, then the bundled catalog) so deep links resolve.
    provideAppInitializer(() =>
      Promise.race([
        inject(ProductService).load(),
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]),
    ),
    provideRouter(
      routes,
      // route params / query params / route data → component input()s
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: LivoraTitleStrategy },
  ],
};
