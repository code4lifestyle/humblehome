# Livora – Angular

Angular 21 rebuild of the **Livora** furniture-store demo (originally a WordPress / Elementor / WooCommerce site whose
static mirror sits in the parent folder). Same look, same content – but the ≈ 40 mirrored HTML pages became **15 lazy,
data-driven page components**, all linked through the router.

* Standalone components · zoneless · signals · OnPush · lazy routes · SCSS · Swiper · Font Awesome
* No backend: catalog, blog and content are typed data files; cart, wishlist, orders and the demo login live in `localStorage`
* Reduced content set ("only a few"): **12 products** (of 20, all 5 categories and 5 brands populated) and **4 blog posts**
  (of 6); the 5 policy pages, FAQs, testimonials, team and brands are complete

## Quick start

```bash
npm install
npm start                 # http://localhost:4200
npm run build             # production build → dist/livora-angular/browser
```

Requires Node 20.19+ / 22.12+ / 24 and npm 10+. Any static host works for the build output, but it must **fall back to
`index.html`** for unknown paths (SPA routing), e.g. `try_files $uri /index.html;` on nginx.

## Pages and routes

| Route | What |
|---|---|
| `/` | Home – hero, category slider, promos, top-rated products, video, trending, arrivals, best sellers, countdown, testimonials, latest news |
| `/about-us` · `/testimonials` · `/faqs` · `/contact-us` | Info pages (team, brand ticker, FAQ accordion + sticky TOC, contact form + map) |
| `/shop` · `/product-category/:slug` · `/brand/:slug` | **One listing page** – filters (price, rating, categories, brands), sorting, per-page, pagination / "Load more"; state lives in the URL (`?search=&orderby=&min_price=&category=…`) |
| `/product/:slug` | **One product page for every product** – gallery + lightbox, colour variations, add to cart, wishlist, tabs, reviews, related products |
| `/cart` · `/checkout` · `/wishlist` | Cart (coupons `LIVORA10`, `WELCOME15`, `SAVE20`), checkout with order-received view, wishlist |
| `/my-account` · `/my-account/lost-password` | Login / sign-up / dashboard (**demo auth**, no server) |
| `/blog` · `/category/:slug` · `/tag/:slug` · `/blog/:slug` | **One blog list** (also archives) and **one article page** |
| `/policy/:slug` | **One policy page** for privacy, terms, cancellation, delivery, refunds & returns |
| `/404` and any unknown URL (also unknown product/post/policy slugs) | Not found |

## Adding or changing content

Everything is data – no new pages needed:

* **Products / categories / brands:** `src/app/core/data/{products,categories,brands}.data.ts` (put images in `public/assets/images`;
  `-300x300` / `-600x600` variants are used for cards / gallery). See [docs/catalog.md](docs/catalog.md).
* **Blog posts, FAQs, testimonials, team, policies:** `src/app/core/data/{blog,faq,testimonials,team,policies}.data.ts`
  ([docs/content.md](docs/content.md)).
* **Menu, footer, contact details, social links:** `src/app/core/data/site.data.ts` ([docs/shell.md](docs/shell.md)).
* **Colours / fonts / spacing:** CSS variables in `src/styles/_tokens.scss`.

## Documentation

[docs/README.md](docs/README.md) indexes everything; start with [docs/architecture.md](docs/architecture.md) (structure, routes,
data layer, state, styling system, conventions, QA tools).

## Notes

* The original mirror in the parent folder is untouched and only used as a visual/content reference. The QA helpers in
  `tools/` (screenshots of original vs rebuild, link crawler) need Chrome or Edge on Windows – see the architecture doc.
* Text content is the original template's placeholder copy, kept verbatim (including its quirks) so it can be replaced later.
* Not reproduced from the original: scroll-reveal/parallax animations, background MP4 clips, the "compare" feature.
