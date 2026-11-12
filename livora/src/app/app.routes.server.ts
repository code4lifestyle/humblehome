import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { BLOG_CATEGORIES, BLOG_POSTS, BLOG_TAGS } from './core/data/blog.data';
import { BRANDS } from './core/data/brands.data';
import { PRODUCT_CATEGORIES } from './core/data/categories.data';
import { HH_PRODUCTS } from './core/data/hh-products.data';
import { POLICIES } from './core/data/policies.data';
import { PRODUCTS } from './core/data/products.data';

/**
 * Hybrid rendering for the Humble Home site (Angular 21, @angular/ssr).
 *
 * The site is deployed fully static (`outputMode: "static"` in angular.json),
 * so there is no Node server at runtime: prerendered pages are plain HTML
 * files served by Vercel, and Client routes fall back to the SPA shell
 * (vercel.json rewrites everything else to /index.csr.html — the empty
 * client shell — so a cart / checkout / admin URL never briefly shows the
 * prerendered home page before the app takes over).
 *
 *  - Prerender: every public marketing / catalog page, including all
 *    parameterized pages whose slugs exist in the bundled data files.
 *    The Supabase catalog is NOT loaded during prerendering (see
 *    app.config.ts), so prerendered pages show the bundled catalog.
 *  - Client: cart, checkout, account and admin — user-specific, and they
 *    already carry `noindex, nofollow`. Also the 404 page and any unknown
 *    route, so a bad URL never gets a prerendered page.
 *
 * No design change: this file only decides *where* each route renders.
 * Canonical stays https://humble-home-phi.vercel.app (see seo.service.ts).
 */
const STATIC_ROUTES: string[] = [
  '',
  'about-us',
  'shop',
  'furniture',
  'curtains',
  'marble',
  'blog',
  'our-locations',
  'contact-us',
  'faqs',
  'testimonials',
];

/** Canonical product slugs, de-duplicated (old WordPress alias slugs are NOT prerendered). */
const productSlugs = (): string[] => [
  ...new Set([...PRODUCTS, ...HH_PRODUCTS].map((p) => p.slug)),
];

export const serverRoutes: ServerRoute[] = [
  ...STATIC_ROUTES.map(
    (path): ServerRoute => ({ path, renderMode: RenderMode.Prerender }),
  ),
  {
    path: 'product/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return productSlugs().map((slug) => ({ slug }));
    },
  },
  {
    path: 'product-category/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return PRODUCT_CATEGORIES.map((c) => ({ slug: c.slug }));
    },
  },
  {
    path: 'brand/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return BRANDS.map((b) => ({ slug: b.slug }));
    },
  },
  {
    path: 'category/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return BLOG_CATEGORIES.map((c) => ({ slug: c.slug }));
    },
  },
  {
    path: 'tag/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return BLOG_TAGS.map((t) => ({ slug: t.slug }));
    },
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return BLOG_POSTS.map((p) => ({ slug: p.slug }));
    },
  },
  {
    path: 'policy/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return POLICIES.map((p) => ({ slug: p.slug }));
    },
  },
  // User-specific pages: client-side only (and noindex, as before).
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'my-account', renderMode: RenderMode.Client },
  { path: 'my-account/lost-password', renderMode: RenderMode.Client },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '404', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
