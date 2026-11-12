import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export const SITE_NAME = 'Humble Home';
export const DEFAULT_TITLE = `${SITE_NAME} – Furniture, Curtains & Marble in Dubai`;
export const DEFAULT_DESCRIPTION =
  'Humble Home designs and makes custom furniture, curtains, and marble for homes in Dubai. Visit us at Dragon Mart 2 or call +971 55 485 0711.';
export const DEFAULT_IMAGE = 'assets/images/collection-furniture-1200x800.jpg';
export const SITE_ORIGIN = 'https://humble-home-phi.vercel.app';

export interface SeoTags {
  title?: string | null;
  description?: string;
  image?: string;
  /** OG/Twitter image size in px; only set when the image's real size is known. */
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  robots?: string;
}

const META = {
  description: 'description',
  robots: 'robots',
  keywords: 'keywords',
  author: 'author',
  ogTitle: 'og:title',
  ogDescription: 'og:description',
  ogUrl: 'og:url',
  ogImage: 'og:image',
  ogImageWidth: 'og:image:width',
  ogImageHeight: 'og:image:height',
  ogImageAlt: 'og:image:alt',
  ogType: 'og:type',
  ogSite: 'og:site_name',
  ogLocale: 'og:locale',
  twCard: 'twitter:card',
  twTitle: 'twitter:title',
  twDescription: 'twitter:description',
  twImage: 'twitter:image',
  twImageAlt: 'twitter:image:alt',
} as const;

/** Sets document title, description, robots, Open Graph, Twitter, and canonical for the current page. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(tags: SeoTags = {}): void {
    const rawTitle = tags.title?.trim();
    // A title that already names the business is used as-is (no doubled brand);
    // anything else gets " – Humble Home" appended.
    const title = !rawTitle
      ? DEFAULT_TITLE
      : rawTitle === SITE_NAME
        ? DEFAULT_TITLE
        : rawTitle.includes(SITE_NAME)
          ? rawTitle
          : `${rawTitle} – ${SITE_NAME}`;
    const description = (tags.description ?? DEFAULT_DESCRIPTION).trim().slice(0, 220);
    // Keep a route-level robots value (e.g. noindex on cart/checkout/account)
    // when a component re-applies tags without one.
    const robots =
      tags.robots ?? this.meta.getTag('name="robots"')?.content ?? 'index, follow';
    const url = this.pageUrl();
    const image = this.absolute(tags.image || DEFAULT_IMAGE);

    this.title.setTitle(title);
    this.meta.updateTag({ name: META.description, content: description });
    this.meta.updateTag({ name: META.robots, content: robots });
    this.meta.updateTag({ property: META.ogTitle, content: title });
    this.meta.updateTag({ property: META.ogDescription, content: description });
    this.meta.updateTag({ property: META.ogUrl, content: url });
    this.meta.updateTag({ property: META.ogImage, content: image });
    if (tags.imageWidth) {
      this.meta.updateTag({ property: META.ogImageWidth, content: String(tags.imageWidth) });
    }
    if (tags.imageHeight) {
      this.meta.updateTag({ property: META.ogImageHeight, content: String(tags.imageHeight) });
    }
    if (tags.imageAlt) {
      this.meta.updateTag({ property: META.ogImageAlt, content: tags.imageAlt });
      this.meta.updateTag({ name: META.twImageAlt, content: tags.imageAlt });
    }
    this.meta.updateTag({ property: META.ogType, content: 'website' });
    this.meta.updateTag({ property: META.ogSite, content: SITE_NAME });
    this.meta.updateTag({ property: META.ogLocale, content: 'en_AE' });
    this.meta.updateTag({ name: META.twCard, content: 'summary_large_image' });
    this.meta.updateTag({ name: META.twTitle, content: title });
    this.meta.updateTag({ name: META.twDescription, content: description });
    this.meta.updateTag({ name: META.twImage, content: image });
    this.setCanonical(url);
  }

  private pageUrl(): string {
    const path = (this.document.location?.pathname || '/').split(/[?#]/)[0] || '/';
    return `${this.origin()}${path === '/' ? '/' : path}`;
  }

  private origin(): string {
    const host = this.document.location?.origin;
    return host && !host.includes('localhost') ? host : SITE_ORIGIN;
  }

  private absolute(path: string): string {
    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
      return path;
    }
    return `${this.origin()}/${path.replace(/^\//, '')}`;
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
