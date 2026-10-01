# Shared components (`src/app/shared/components/…`)

Eight small, reusable UI components ported from the original Livora theme (WooCommerce/ShopEngine loop, ElementsKit
accordion / countdown / blog cards, theme pagination). All are **standalone, OnPush, zoneless-safe** (state lives in
signals), styled with the CSS variables of `src/styles/_tokens.scss` and responsive with the original breakpoints
(tablet ≤ 1024px, mobile ≤ 767px). Import them by path alias:

```ts
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
```

Owner: **components agent**. `page-header` and `section-title` in the same folder belong to the shell agent.

| Selector | Class | File |
|---|---|---|
| `app-star-rating` | `StarRatingComponent` | `star-rating/star-rating.component.ts` |
| `app-product-card` | `ProductCardComponent` | `product-card/product-card.component.ts` |
| `app-blog-card` | `BlogCardComponent` | `blog-card/blog-card.component.ts` |
| `app-pagination` | `PaginationComponent` | `pagination/pagination.component.ts` |
| `app-accordion` | `AccordionComponent` | `accordion/accordion.component.ts` |
| `app-slider` | `SliderComponent` | `slider/slider.component.ts` |
| `app-quantity-input` | `QuantityInputComponent` | `quantity-input/quantity-input.component.ts` |
| `app-countdown` | `CountdownComponent` | `countdown/countdown.component.ts` |

The public API of docs/architecture.md is unchanged; everything below marked **(added)** is an optional, additive input,
output or method that is not in the contract.

---

## `app-star-rating`

Five Font Awesome stars in the accent colour (as in the original – not the yellow `--color-star`): full = `fa-solid fa-star`,
half = `fa-solid fa-star-half-stroke`, empty = `fa-regular fa-star`.

| Input | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | `0` | 0–5, clamped, rounded to the nearest 0.5 |
| `count` | `number \| null \| undefined` | – | renders `(12)` after the stars; nothing for null/undefined |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 13 / 16 / 20 px (`font-size`) |
| `showValue` | `boolean` | `false` | prints `4.5` between stars and count |

```html
<app-star-rating [value]="product.rating" [count]="product.reviewCount" size="sm" />
```

* The host element is the image: `role="img"` + `aria-label="Rated 4.5 out of 5"`; the stars, value and count inside are `aria-hidden`.
* The size is `em` based – a parent can override it with `font-size` (the product card uses 14px on phones).

## `app-product-card`

The shop-loop card: rounded cream image (zoom 1.05 on hover, second gallery image fades in), "Sale!" pill, title, stars,
price and hover buttons (wishlist · view · add to cart / select options).

| Input | Type | Default | Notes |
|---|---|---|---|
| `product` | `Product` | **required** | |
| `layout` | `'grid' \| 'list'` | `'grid'` | `list` = horizontal card: categories, title, stars, price, excerpt (3 lines), "Add to cart" / "Select options" pill + wishlist + view; stacks below 640px |
| `badge` **(added)** | `'sale' \| 'percent' \| 'none'` | `'sale'` | `sale` = "Sale!" pill top-left (shop). `percent` = the `-13%` tag top-right of the **home "Top Rated"** cards; it also switches to the home spacing (no text inset, no image zoom). Only shown for products on sale |
| `showCategories` **(added)** | `boolean \| null` | `null` | category links above the title. `null` = automatic: hidden in the grid (like the original shop), shown in the list layout |

```html
<!-- shop grid -->
<div class="products"> @for (p of page().items; track p.id) { <app-product-card [product]="p" /> } </div>
<!-- home "Top Rated Product": 4 columns -->
<app-product-card [product]="p" badge="percent" />
<!-- list view -->
<app-product-card [product]="p" layout="list" />
```

Behaviour

* Links are `routerLink`s: image / title / eye button → `['/product', slug]`; category names → `['/product-category', slug]`
  (names from `ProductService.categoryBySlug()`, falling back to the prettified slug).
* Price via `@core/utils/product.utils`: simple = `$89.00` (+ struck-through `$99.00` when on sale); variable with differing
  variation prices = `$39.00 – $89.00` (lowest first); screen-reader texts like WooCommerce ("Current price is: …").
* Wishlist button: `WishlistService.has()/toggle()`, `aria-pressed`, filled heart + dark background when active.
* Simple products: cart button calls `CartService.add(product)` (the service shows the toast). Variable products get a
  "Select options" link to the product page instead.
* Stars only when `product.rating > 0`; the `(n)` count only when `reviewCount > 0`.
* Keyboard: the buttons are revealed by `:hover` **and** by keyboard focus (`:has(:focus-visible)`); the image link is
  `aria-hidden` / `tabindex="-1"` so each card is one link + three buttons. On touch screens (`hover: none`) the buttons
  are always visible along the bottom edge of the image (the original only shows them after a tap).
* The host is `display: block` and the card is `height: 100%`, so cards stretch inside grid rows / swiper slides.
* Images: `imageVariant(images[0], '300x300')`, `loading="lazy"`.

## `app-blog-card`

| Input | Type | Default | Notes |
|---|---|---|---|
| `post` | `BlogPost` | **required** | |
| `variant` **(added)** | `'card' \| 'highlight' \| 'row'` | `'card'` | `card` = blog-list look (cream card, image on top, title, excerpt, divider, "Read More" + accent arrow disc). `highlight` = home "Latest News" big image with dark gradient and white text (min-height 470px). `row` = home "Latest News" small card, 183px image left / text right (stacks on phones) |
| `showMeta` **(added)** | `boolean` | `true` | date (`June 22, 2026`) + category links line above the title |

```html
<app-blog-card [post]="post" />
<app-blog-card [post]="posts[0]" variant="highlight" />
<app-blog-card [post]="posts[1]" variant="row" />
```

* Links: image / title / Read More → `['/blog', slug]`; categories → `['/category', slug]` (names from
  `BlogService.categoryBySlug()`, fallback = prettified slug). Multiple categories are shown as "A, B".
* `highlight` and `row` do not print the excerpt (like the original home block).

## `app-pagination`

| Input / output | Type | Default | Notes |
|---|---|---|---|
| `page` | `number` | `1` | current page, 1-based (clamped) |
| `pages` | `number` | `1` | total pages; **renders nothing when ≤ 1** |
| `variant` **(added)** | `'numbers' \| 'load-more'` | `'numbers'` | `load-more` = the single "Load More" pill the original shop shows; it emits `page + 1` and disappears on the last page (the parent has to append the items) |
| `loadMoreLabel` **(added)** | `string` | `'Load More'` | |
| `pageChange` (output) | `number` | | requested page – never the current one, always within 1…pages |

```html
<app-pagination [page]="result().page" [pages]="result().pages" (pageChange)="goTo($event)" />
```

* `‹ 1 2 3 … 10 ›` – at most 7 page slots (first, last, current ± 1, "…"). Real `<button>`s inside
  `<nav aria-label="Pagination">`, `aria-current="page"` on the current one, prev/next disabled at the ends.
* Look = the original pills (accent, current/hover = dark). 34px on phones so 9 items fit a 360px screen.
* It is controlled: it does not change `page` by itself – bind it to the route/query param or a signal.

## `app-accordion`

| Input | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ title: string; content: string }[]` | `[]` | plain text |
| `multi` | `boolean` | `false` | several rows may be open |
| `openFirst` | `boolean` | `true` | first row open initially |
| `openIndex` **(added)** | `number \| null` | `null` | 0-based row to open initially; **overrides `openFirst`** when set (the original FAQ page opens the 3rd question: `[openIndex]="2"`); an index outside the list opens nothing |
| `numbered` **(added)** | `boolean` | `true` | "1." "2." prefixes like the original (numbering restarts per accordion) |

```ts
// FaqItem { question, answer } → accordion item { title, content } (compute once, e.g. in a `computed`)
readonly items = computed(() => this.content.faqPreview().map((f) => ({ title: f.question, content: f.answer })));
```
```html
<app-accordion [items]="items()" [openIndex]="2" />   <!-- FAQs page: 3rd question open in every group -->
<app-accordion [items]="items()" />                   <!-- About / Testimonials: first question open -->
```

* Each row = `<h3><button aria-expanded aria-controls>` + `role="region"` panel (`aria-labelledby`), unique ids per instance.
* Keyboard: Enter/Space toggle; ↑ ↓ Home End move focus between the questions.
* Smooth open/close (grid-row 0fr → 1fr, 0.35s, disabled for `prefers-reduced-motion`); closed panels are
  `visibility: hidden`. The initial state is re-applied only when the list of titles or `openFirst`/`openIndex` really change.
* Look: cream rows, 20px radius, 20px gap, 18px/700 questions, black +/− disc (24px), divider under the open question.

## `app-slider`

Swiper (v11 core API) wrapper. **The consumer projects the slides, each wrapped in `<div class="swiper-slide">`.**

| Input | Type | Default | Notes |
|---|---|---|---|
| `slidesPerView` | `number \| 'auto'` | `1` | |
| `spaceBetween` | `number` | `20` | px |
| `breakpoints` | `Record<number\|string, { slidesPerView?; spaceBetween? }>` | – | key = min viewport width. **In templates quote the keys** (Angular cannot parse numeric object keys): `{ '768': { slidesPerView: 2 } }` |
| `loop` | `boolean` | `false` | switched off automatically when there are not enough slides |
| `autoplay` | `boolean \| number` | `false` | `true` = 5000ms, number = delay in ms; rests while the mouse is over the slider (arrows and dots included) or a keyboard user is inside it, off for `prefers-reduced-motion` |
| `speed` | `number` | `600` | ms |
| `navigation` | `boolean` | `false` | round accent arrows (44px, 36px on phones), hidden when everything fits |
| `pagination` | `boolean` | `false` | dots below the slides: 12px dots, active = 40px accent pill (the home category slider) |
| `centeredSlides` | `boolean` | `false` | |
| `effect` **(added)** | `'slide' \| 'fade'` | `'slide'` | `fade` cross-fades (forces one slide per view) |
| `label` **(added)** | `string` | `'Slider'` | accessible name (`role="region" aria-roledescription="carousel"`) |
| `slideChange` **(added, output)** | `number` | | real index of the active slide |
| `next()` `prev()` `slideTo(i)` **(added)** | methods | | via `viewChild(SliderComponent)` |

```html
<app-slider [slidesPerView]="1" [spaceBetween]="20"
            [breakpoints]="{ '640': { slidesPerView: 2 }, '1025': { slidesPerView: 4 } }"
            [autoplay]="4000" [loop]="true" [navigation]="true" [pagination]="true">
  @for (p of products(); track p.id) {
    <div class="swiper-slide"><app-product-card [product]="p" /></div>
  }
</app-slider>
```

* Swiper is created after render, re-created when an input changes (compared by value) and **whenever slides are added or
  removed** (MutationObserver on the wrapper – async `@for` lists work; Swiper's own loop DOM moves are ignored) and
  destroyed with the component. Route changes with a running loop/autoplay slider are clean (no errors).
* Slides are `height: auto` (equal height); Swiper's core/navigation/pagination CSS comes from `angular.json`, the fade and
  a11y rules are included in the component.
* Dark backgrounds: set `--slider-dot-color` (inactive dots, default = divider colour) on the slider or a parent.
* Swiper A11y module: slides are labelled "n / total", bullets are focusable buttons, the arrows are real `<button>`s.

## `app-quantity-input`

| Input | Type | Default | Notes |
|---|---|---|---|
| `value` | `model<number>` | `1` | `[(value)]` |
| `min` | `number` | `1` | |
| `max` | `number` | `99` | |
| `label` **(added)** | `string` | `'Quantity'` | accessible name |
| `disabled` **(added)** | `boolean` | `false` | |

```html
<app-quantity-input [(value)]="qty" [max]="10" />
```

* Pill `[ − 1 + ]` 119 × 50px like the product page. − / + disable at the limits.
* Typing is allowed: valid whole numbers in range are applied immediately, everything else (empty, `0`, `500`, `2.7`) is
  normalised on blur / Enter; an externally set value (or a lowered `max`) is clamped too.

## `app-countdown`

| Input | Type | Default | Notes |
|---|---|---|---|
| `target` | `string \| Date` | **required** | ISO string, `Date`, or the original's `2027-05-21 12:00` (local time) |
| `finishedText` **(added)** | `string` | `'Countdown is finished!'` | |

```html
<app-countdown target="2027-05-21T12:00:00" />
```

* Days / Hours / Minutes / Seconds with the big ":" separators (65×80 units, 38px/700 numbers; 32px tablet, 26px phone).
* One `setInterval(1000)` writing a signal, cleared on destroy and stopped by itself when the time is up; restarts when
  `target` changes. `role="timer"`, `aria-live="off"`; the finished message is `role="status"`.
* White text by default (it lives in the dark "Flat Discount" section): override with `--countdown-color`.

---

## Lab / verification

* `/lab/components` (`src/app/pages/lab/lab-components.component.ts`, temporary – deleted at integration) renders every
  component in every state (sample products: simple / sale / variable range / variable on sale / unrated; blog variants; a
  6-slide loop+autoplay slider, a 1→2→4 product slider, a fade slider with add/remove buttons; accordions; countdowns 10s
  ahead / past / far; pagination with 1, 3, 10 pages and load-more; quantity states) plus a "real data" block that feeds
  the cards with `ProductService` / `BlogService`, and fixtures at the widths of the original layout.
* Side-by-side element screenshots against the original (shop card 308px, home card, blog card, highlight, row, accordion,
  countdown, quantity, Load More) at 1440px, card + touch layout at 390px: card, blog and countdown match to within a
  few pixels (see "Known gaps" for the intentional differences).
* Playwright (mouse + keyboard) run of 67 checks – hover reveal, wishlist/cart side effects, links, price formats,
  accordion ARIA/keyboard, quantity clamping, pagination states, slider navigation/autoplay/dynamic slides, countdown
  ticking – all pass with no console errors or warnings. `ng build` (development and production) is green, no budget warnings.

## Known gaps / notes

* The original hover overlay also has a *compare* button and a *quick view* modal; there is no compare feature, and the
  eye button simply opens the product page.
* The original list view (`layout="list"`) exists in the markup but is unstyled/hidden, so the list layout is a new design
  in the theme's style.
* In the grid the category links are hidden by default (the original shop grid shows none); pass `[showCategories]="true"`.
* The original prints variable price ranges high → low (`$89.00 – $39.00`); the card prints low → high.
* `variant="load-more"` only emits the next page number – accumulating the items is up to the page.
* Blog `highlight` uses `post.image` (the 1024×576 variant) instead of the original's full-size file.
