# Architecture

Angular 21 rebuild of the **Livora** WordPress / Elementor / WooCommerce furniture-store demo. The original static
mirror is the *parent folder* of this project and stays untouched – it is only used as the visual/content reference.

**Stack:** Angular 21 · standalone components · zoneless change detection · signals · OnPush · lazy routes · SCSS ·
Swiper 11 · Font Awesome 6 (free) · no backend (everything is static data + `localStorage`).

**Idea:** ≈ 40 original URLs (20 product pages, 6 posts, 5 policies, archives, …) collapse into **15 lazy page components**
that are driven by data. Nothing is duplicated per product/post/policy – to add one you add a data record, not a page.

---------------------------------------------------------------------------------------------------------------------

## 1. Layout of `src/`

```
src/
  index.html · main.ts · styles.scss          entry + global styles (imports src/styles/*)
  styles/                                     design system: _tokens _fonts _mixins _base _typography _layout _buttons _forms _utilities
  app/
    app.ts|html|scss  app.config.ts  app.routes.ts    shell, providers (zoneless, router options, title strategy), route map
    core/
      models/      TypeScript interfaces (product, cart, blog, content, site, order, auth)
      data/        typed static datasets (products, categories, brands, blog, faq, testimonials, team, policies, site config)
      services/    ProductService BlogService ContentService · CartService WishlistService AuthService OrderService ·
                   ToastService PageTitleService (+ storage helper)
      utils/       product.utils (price/sale/variation helpers) · image.utils (imageVariant)
    layout/        header (topbar, logo, search, mega menu, mobile menu, sticky bar) · footer · toast container · svg-icon
    shared/
      components/  page-header · section-title · product-card · blog-card · star-rating · pagination · accordion · slider ·
                   quantity-input · countdown · help-card · toc-card
      sections/    reusable marketing blocks: best-seller · trending · approach · product-video · testimonial-slider · faq-preview
    pages/         one folder per routed page (home about shop product-detail cart checkout wishlist account blog-list
                   blog-detail contact faqs testimonials policy not-found)
public/assets/     images (original uploads, product images also as -300x300 / -600x600, posts as -1024x576), fonts, icons
tools/             QA helpers (screenshots, link crawler, original-site outline/CSS lookup) – see §7
docs/              per-area documentation (see docs/README.md)
```

Path aliases (tsconfig): `@core/*`, `@shared/*`, `@layout/*`, `@pages/*`.

---------------------------------------------------------------------------------------------------------------------

## 2. Routes and dynamic pages

| Route | Page component | Driven by |
|---|---|---|
| `/` | `HomeComponent` | 9 home-only sections + shared sections; products via `ProductService`, news via `BlogService` |
| `/about-us` · `/testimonials` · `/faqs` · `/contact-us` | `AboutComponent` … | `ContentService` (team, testimonials, FAQ groups, brand logos) |
| `/shop` · `/product-category/:slug` · `/brand/:slug` | **`ShopComponent`** (route `data.mode`) | `ProductService.query()`; filters/sort/paging live in the URL query string |
| `/product/:slug` | **`ProductDetailComponent`** | one component for every product (gallery, variations, tabs, reviews, related) |
| `/cart` · `/checkout` · `/wishlist` | `CartComponent` … | `CartService`, `WishlistService`, `OrderService` |
| `/my-account` · `/my-account/lost-password` | **`AccountComponent`** (route `data.view`) | `AuthService` (demo only) |
| `/blog` · `/category/:slug` · `/tag/:slug` | **`BlogListComponent`** (route `data.mode`) | `BlogService.query()` |
| `/blog/:slug` | **`BlogDetailComponent`** | one component for every post |
| `/policy/:slug` | **`PolicyComponent`** | one component for the 5 policy pages (`ContentService.policyBySlug`) |
| `/404` and `**` | `NotFoundComponent` | unknown slugs on dynamic pages also render it (URL is kept) |

`provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling(...))`: route params, query params and route
`data` arrive as component `input()`s, e.g. `slug = input<string>()`, `mode = input<'shop'|'category'|'brand'>()`,
`page = input<string>()`. Pages derive everything with `computed()`. Document titles: static route `title`s go through
`LivoraTitleStrategy` ("<title> – Livora"); dynamic pages call `PageTitleService.set(...)`. Fragment links are offset below
the sticky header through `ViewportScroller.setOffset` (see `app.config.ts`).

---------------------------------------------------------------------------------------------------------------------

## 3. Data layer

Pages never import the `*.data.ts` files – they go through the services, which are synchronous, pure and return stable
instances (safe to bind to inputs). Swap the data files for HTTP calls later without touching the pages.

* **Catalog** – `core/data/{products,categories,brands}.data.ts`, `ProductService` (`all/bySlug/byId/byIds/query/related/
  featured/latest/topRated/bestSellers/priceBounds/ratingCounts/categories/brands/categoriesOf/brandsOf`). Details:
  [catalog.md](catalog.md).
* **Content** – `blog/faq/testimonials/team/policies.data.ts`, `BlogService`, `ContentService`. Details:
  [content.md](content.md).
* **Site config** – `core/data/site.data.ts` (`SITE_CONFIG`: contact details, main navigation incl. the Shop mega menu, footer
  columns, social links, payment icons). Details: [shell.md](shell.md).
* **Reduced content set ("only a few")**: 12 of the original 20 products (5 categories × 5 brands all still populated), 4 of the
  6 blog posts, and the 5 policies, 5 FAQ groups, 6 testimonials, 4 team members. Adding the rest is data only.

### Client-side state (signals + `localStorage`)

| Service | Storage key | Notes |
|---|---|---|
| `CartService` | `livora.cart.v1`, `livora.cart.coupon.v1` | items, quantities, variations, coupon (demo codes `LIVORA10`, `WELCOME15`, `SAVE20`), shipping rule, totals |
| `WishlistService` | `livora.wishlist.v1` | product ids |
| `OrderService` | `livora.orders.v1` | orders placed at `/checkout` (order-received view, `LV-…` numbers) |
| `AuthService` | `livora.auth.accounts.v1`, `livora.auth.session.v1` | **mock only** – salted SHA-256 hashes, no server; see [commerce.md](commerce.md) |
| Home countdown | `livora.home.flat-discount.ends` | deadline armed on first visit |

---------------------------------------------------------------------------------------------------------------------

## 4. Building blocks

* **Layout** ([shell.md](shell.md)): `app-header` (promo topbar, phone box, logo, search overlay → `/shop?search=`, wishlist /
  account / cart icons with live counters, dropdowns + full-width Shop mega menu, off-canvas mobile menu ≤ 1024px, compact sticky
  bar), `app-footer` (newsletter with validation + toast, link columns, contacts, payments), `app-toast-container`.
* **Shared components** ([components.md](components.md)): `product-card` (grid/list, sale/percent badges, wishlist, add to
  cart / select options), `blog-card` (card/highlight/row), `star-rating`, `pagination` (numbers or "load more"), `accordion`
  (`openFirst` / `openIndex` / `multi`), `slider` (Swiper wrapper – **quote numeric breakpoint keys in templates**),
  `quantity-input` (`[(value)]`), `countdown`, `page-header`, `section-title`, `help-card`, `toc-card`.
* **Marketing sections** ([sections.md](sections.md)): drop-in `<app-…-section />` blocks used by Home / About / Testimonials.
* **Pages**: [home.md](home.md), [info.md](info.md), [shop.md](shop.md), [product.md](product.md), [commerce.md](commerce.md),
  [blog.md](blog.md).

---------------------------------------------------------------------------------------------------------------------

## 5. Styling system

* **Tokens** (`src/styles/_tokens.scss`) – CSS custom properties: `--color-primary #161616`, `--color-secondary #F8F5EF`,
  `--color-text #585858`, **`--color-accent #B08D57`**, `--color-bg #FCFBFA`, dividers, radii, transitions, `--container-*`.
  Never hard-code brand colours.
* **Font** – OPPOSans 300/400/500/700/900 (`public/assets/fonts`, Latin subsets of ~13 KB each; the originals were ~5 MB CJK builds).
* **Container** – `.container` = `max-width: 1320px; padding-inline: 20px` – measured on the original: 1280px of content
  (x = 80 at a 1440px viewport) and a 20px side inset below ~1320px, for header, footer and sections alike.
* **Breakpoints** – `@use 'mixins' as *;` → `@include tablet {…}` (≤ 1024px), `@include mobile {…}` (≤ 767px),
  `@include menu-collapse {…}` (≤ 991px).
* **Buttons** – `class="btn-default"` (+ `btn-highlighted`, `btn-dark`, `btn-outline`, `btn-light`, `btn-plain`, `btn-sm/lg/block`);
  the arrow circle is drawn by CSS. **Forms** – `.form-control`, `.form-group`, `.form-grid`, `.form-label`, `.form-check`,
  `.is-invalid`, `.form-error`… Full class reference in [shell.md](shell.md).
* **Icons** – Font Awesome 6 free classes + a few inline SVGs (`layout/svg-icon`). **Images** – templates use
  `src="assets/images/…"`, SCSS uses `url('/assets/images/…')`; `imageVariant(path, '300x300' | '600x600' | '1024x576')`.

---------------------------------------------------------------------------------------------------------------------

## 6. Conventions

* Standalone components only, `ChangeDetectionStrategy.OnPush`, modern control flow (`@if / @for (…; track …) / @switch`),
  `signal / computed / effect / input() / output() / model() / inject()`.
* **Zoneless:** anything changed asynchronously (timers, observers, third-party callbacks) must be a signal.
* Files: `foo.component.ts|html|scss`, class `FooComponent`, selector `app-foo`; services `foo.service.ts`; data `foo.data.ts`.
* Every internal link is a `routerLink`; pages read data only through services; models change additively.
* Accessibility: alt texts, `aria-*` on icon-only controls, keyboard-operable menus / accordions / modals / lightbox.

---------------------------------------------------------------------------------------------------------------------

## 7. QA tools (`tools/`)

They compare the rebuild against the original mirror (the parent folder) and need Google Chrome or Edge on Windows
(`playwright-core` drives the installed browser – no download).

| Command | Purpose |
|---|---|
| `node tools/shot.mjs http://localhost:8090/about-us/index.html out.png --full --slice=1400 --orig` | screenshot of an ORIGINAL page (served in-process, no server needed) |
| `node tools/shot.mjs /shop out.png --dist=dist/livora-angular/browser --full --slice=1400` | screenshot of the built app (or pass a running dev-server URL) |
| `npm run check:links -- --dist=dist/livora-angular/browser [--width=390]` | crawls all 50 routes: broken links / 404s, console errors, broken images, horizontal overflow, missing `<h1>` |
| `python tools/outline.py ../about-us/index.html` · `python tools/condense.py …` · `python tools/css-of.py <element-id-or-class>` | text outline / stripped markup / all CSS rules of an element of the original |

---------------------------------------------------------------------------------------------------------------------

## 8. Known limitations

* No backend: orders, accounts, reviews and the newsletter are demo-only (browser storage / toasts).
* The original's scroll-reveal, parallax and split-text animations, the MP4 background clips and the compare feature are not
  reproduced; a few `::ng-deep` overrides in page styles adapt shared cards (listed in the page docs).
* The app is client-side rendered (no SSR/prerender); titles are set per route, `<meta>` tags are static.
