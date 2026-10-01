import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE = 'Humble Home';

/**
 * Static route titles (the `title` field in app.routes.ts) become "<title> – Livora".
 * Routes without a static title (dynamic pages such as product/blog detail) are left alone so the page
 * component can set its own title with PageTitleService.set('Leather Recliner').
 */
@Injectable({ providedIn: 'root' })
export class LivoraTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    if (routeTitle) {
      this.title.setTitle(routeTitle === SITE ? `${SITE} – Modern Furniture Store` : `${routeTitle} – ${SITE}`);
    }
  }
}

/** Use from dynamic pages: `inject(PageTitleService).set(product.name)`. */
@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly title = inject(Title);

  set(pageTitle: string | null | undefined): void {
    this.title.setTitle(pageTitle ? `${pageTitle} – ${SITE}` : `${SITE} – Modern Furniture Store`);
  }
}
