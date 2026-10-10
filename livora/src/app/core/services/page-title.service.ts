import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SITE_NAME, SeoService, SeoTags } from './seo.service';

/**
 * Static route titles (the `title` field in app.routes.ts) become "<title> – Humble Home".
 * Route `data.description` / `data.robots` become the page meta tags.
 * Dynamic pages (product / blog / policy) call PageTitleService.set(...) themselves.
 */
@Injectable({ providedIn: 'root' })
export class LivoraTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    let description: string | undefined;
    let robots: string | undefined;
    for (let route = snapshot.root; route; route = route.firstChild!) {
      if (typeof route.data['description'] === 'string') {
        description = route.data['description'];
      }
      if (typeof route.data['robots'] === 'string') {
        robots = route.data['robots'];
      }
      if (!route.firstChild) {
        break;
      }
    }
    this.seo.apply({
      title: routeTitle ?? SITE_NAME,
      description,
      robots,
    });
  }
}

/** Use from dynamic pages: `inject(PageTitleService).set(product.name, { description: product.excerpt })`. */
@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly seo = inject(SeoService);

  set(pageTitle: string | null | undefined, tags: Omit<SeoTags, 'title'> = {}): void {
    this.seo.apply({ ...tags, title: pageTitle });
  }
}
