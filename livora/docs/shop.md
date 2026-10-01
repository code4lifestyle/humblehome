# Shop – product listing (`/shop`, `/product-category/:slug`, `/brand/:slug`)

Owner: **shop agent**. One lazy page component serves the three listing routes of `app.routes.ts` (`data.mode` =
`shop` | `category` | `brand`): banner, "Filter By" sidebar (drawer on tablet / mobile), toolbar, product grid, pagination and
"Load More". It reads data **only** through `ProductService` and renders every product with `app-product-card`.
Original pages: `shop/index.html`, `product-category/<slug>/index.html`, `brand/<slug>/index.html` (Elementor template 2443 +
ShopEngine widgets).

## 1. Files

| File | What |
|---|---|
| `src/app/pages/shop/shop.component.{ts,html,scss}` | `ShopComponent` (`app-shop-page`): route bindings, URL ⇄ state, header, toolbar, grid, pager, drawer shell |
| `src/app/pages/shop/shop-filters/shop-filters.component.{ts,html,scss}` | `ShopFiltersComponent` (`app-shop-filters`): the four facets (price · rating · categories · brands) – presentational |
| `src/app/pages/shop/shop.utils.ts` | pure helpers: `ShopMode`, `ShopParams`, `PriceRange`, query-param parsers, `SORT_OPTIONS`, `PER_PAGE_OPTIONS`, `resultCountText()` |

## 2. Query-param contract (the URL is the single source of truth)

The router binds route data, `:slug` and the query params to `input()`s (`withComponentInputBinding`); every value on screen is
a `computed()` of them, every user action is `Router.navigate([], { queryParams, queryParamsHandling: 'merge', scroll: 'manual' })`.
Defaults are **omitted** from the URL (`page=1`, `orderby=default`, `per_page=9`, price at the catalog bound). Unknown / invalid
values are ignored silently (never an error): the page falls back to the default.

| Param | Values | Notes |
|---|---|---|
| `search` | free text | trimmed, whitespace collapsed. Matches `ProductService` search (word starts in name / excerpt / category / brand). Works on all three routes. Header search box → `/shop?search=<text>` |
| `page` | integer ≥ 1 | clamped to the last page by the service (`?page=99` on 12 products / 9 per page shows page 2) |
| `orderby` | `default` `popularity` `rating` `latest` `price-asc` `price-desc` `title-asc` `title-desc` | WooCommerce values `menu_order` `date` `price` `title` are accepted as aliases |
| `per_page` | `6` `9` `12` | anything else → 9 |
| `min_price` `max_price` | numbers ≥ 0 | clamped to `priceBounds()` (30 – 89); a limit sitting on the bound is dropped (filters nothing); a reversed pair is swapped |
| `rating` | `1`…`5` | **minimum** rounded rating ("N stars & up", `ProductQuery.minRating`) |
| `category` | `a,b` (or `?category=a&category=b`) | slugs, OR inside the list; unknown slugs dropped. **Only read on `/shop` and `/brand/:slug`** |
| `brand` | `a,b` | same; **only read on `/shop` and `/product-category/:slug`** |

Changing anything except `page` removes `page` (back to page 1). "Filter" navigations create history entries, so Back / Forward
replay them (verified: 4 filter steps back and forward).

Examples: `/shop?min_price=40&max_price=70&rating=4&category=living-room,bedroom&brand=nordic-living&orderby=price-desc&per_page=6` ·
`/product-category/bedroom?brand=livora-home` · `/brand/nordic-living?category=living-room&rating=5` · `/shop?search=wooden%20table`.

## 3. Page anatomy and behaviour

* **Banner** (`app-page-header`): `/shop` → "Premium Furniture", crumbs *Home / Shop*; category / brand → its name, crumbs
  *Home / Products / <name>* (**Products → `/shop`**, like the original); `?search=x` → `Search results for “x”` with an extra
  last crumb *Search results* (the category / brand crumb becomes a link). Document title via `PageTitleService`
  ("Shop", "Bedroom", "Nordic Living", `Search results for “x”`) – re-applied after every navigation because the router's title
  strategy resets the static "Shop" title.
* **Unknown slug** on `/product-category/:slug` or `/brand/:slug` → `navigateByUrl('/404', { skipLocationChange: true })`
  (URL stays, the 404 page is shown, the shop renders nothing meanwhile). Slugs are case-insensitive.
* **Locked route facet**: on a category page the *Categories* list is the route's own filter, on a brand page the *Brands* list.
  The rows are then **links** to the sibling category / brand pages (other query params kept, `page` dropped), the current row is
  shown checked with `aria-current="page"`. The `category` / `brand` param of the locked facet is ignored.
* **Sidebar "Filter By"** – measured on the original: 280px column, 45px gap, facets 30px apart with a hairline + 30px padding
  under each, 16px/700 titles, 20px circle boxes, 20px rows (30px pitch ≤ 1024px). Sticky on desktop
  (`top: var(--header-height) + 20px`, like the original's `.sticky-column`). It is taller than a laptop viewport, so **while it is
  pinned** its panel scrolls inside itself (`@container scroll-state(stuck: top)` → `max-height` + `overflow: auto`; wheel chaining
  stays on – no scroll trap); unpinned it is shown in full (so full-page screenshots and printing show every facet).
  "Clear all" appears in its header while a filter is active.
  * *Price Range*: two overlaid native range inputs drawn like the original asRange slider (hairline track, dark segment, 5×17px
    bar handles; the handles have an 8px transparent hit border) **plus** min / max number fields, the "$min - $max" label and the
    accent "Reset" pill. Sliding updates label and fill live, the URL changes on release / Enter / blur (`change`). Bounds
    from `ProductService.priceBounds()`.
  * *Product rating*: 5 → 1 star rows (radio-like circle + stars + "& up" + count). Click = filter, click the active row = clear
    (`aria-pressed`). **Counts are cumulative** ("N stars & up", derived from `ratingCounts()`: 6 · 12 · 12 · 12 · 12) so the
    number always equals what the click yields – see §5.
  * *Categories* / *Brands*: circle checkboxes with static counts from `categories()` / `brands()`; several checked = OR inside the
    facet, AND between facets.
* **Drawer (≤ 1024px, the original's tablet breakpoint)**: the sidebar becomes an off-canvas panel (`role="dialog"`,
  `aria-modal`, 380px max, slides in from the left, backdrop). Opened by the "Filter By" button in the toolbar (shows a badge with
  the number of active filters). Focus moves to the close button, Tab / Shift+Tab are trapped, **Esc**, ✕, backdrop click and
  the footer button "Show N results" close it and give the focus back to the toggle; the page behind does not scroll
  (`<html>` overflow lock, like the header menu); growing past 1024px closes it. While closed it is `visibility: hidden`
  (out of the tab order). Filters apply live, the drawer stays open.
* **Toolbar**: "Showing 1–9 of 12 results" (WooCommerce wording: *Showing all 7 results* / *Showing the single result* /
  *Showing 10–12 of 12 results*; it is a `role="status"` live region), products-per-page radios `6 / 9 / 12` (real, visually
  hidden radios), the 8-option sort select (190px cream pill). Mobile order: `[Filter By] [sort]` / `count · per page`.
* **Grid**: `<ul>` of `app-product-card`, 3 columns (15px gap, 30px between rows) down to 769px, **2 columns ≤ 768px** (10px / 20px
  gaps ≤ 767px) – exactly the original's breakpoints (the original also has 3 columns at 820px).
* **Pagination**: below the grid the original's **"Load More"** pill (`app-pagination variant="load-more"`) and the **numbers**
  (`app-pagination`) sit side by side. Numbers navigate (`?page=N`, list is replaced); Load More appends the next page below the
  current items (12 cards after one click with 9 per page), disappears on the last page and moves the keyboard focus to the first new
  product. The accumulated pages are **not** in the URL but in the current history entry (`history.state.shopLoadedPages`), so
  Back / Forward and a reload bring the list back; any other URL starts again at one page.
* **Empty state**: "No products were found matching your selection." + **Reset filters** (accent pill) – clears search, price,
  rating, categories and brands, keeps sort / page size / the route's own category or brand. The toolbar controls are hidden.
* **Scrolling**: the router's scroll-to-top is switched off for the shop's own navigations (`scroll: 'manual'`); after the new list
  is rendered the page scrolls to the toolbar (`scrollIntoView`, respects the sticky header's `scroll-padding-top`) **only if
  the toolbar is above the viewport** – so clicking page 2 at the bottom brings you back to the grid, filtering at the top does not
  jump. Route changes (header links) and Back / Forward use the router's default (top).

## 4. Public API

`ShopComponent` – `selector: 'app-shop-page'`, standalone, OnPush. Inputs (all bound by the router, names = URL names):
`mode` (`'shop' | 'category' | 'brand'`, route data) · `slug` · `search` · `page` · `orderby` · `per_page` (alias) · `min_price`
(alias) · `max_price` (alias) · `rating` · `category` (alias) · `brand` (alias). Nothing else is public; other pages link with
`routerLink="/shop" [queryParams]="{ … }"`.

`ShopFiltersComponent` – `selector: 'app-shop-filters'`. Inputs: `minPrice` `maxPrice` (`number | null`), `rating` (`number | null`),
`categories` `brands` (selected slugs), `lockedCategory` `lockedBrand` (`string | null`). Outputs: `priceChange` (`{ min, max }`,
`null` = unbounded), `ratingChange` (`number | null`), `categoriesChange` / `brandsChange` (`string[]`). Injects `ProductService`
only for the static lists / bounds / rating counts.

## 5. Decisions and deviations from the brief

* **Rating counts are "& up"** – the brief says "counts from `ratingCounts()`" *and* "click to filter `minRating`", but the raw
  `ratingCounts()` (per rounded rating: 0 · 0 · 0 · 6 · 6) does not equal what `minRating` returns (4★ → 12 products). The rows are
  cumulative sums of `ratingCounts()` so the number beside a row is exactly the result count of clicking it. One line in
  `ShopFiltersComponent.ratingRows` switches back to raw counts if the exact-match semantic of WooCommerce is preferred.
* **Per page 6 / 9 / 12** (original: 1 / 9 / 12 / 15) as briefed. **Tablet grid is 3 columns** (the original), not 2.
* **Search on category / brand pages** is supported (ANDed with the route filter) and replaces the banner title.
* **Facet counts are static** (whole catalog), like the original's – they do not react to the other active filters.
* The original's *Uncategorized (0)* category is not in the reduced catalog.
* The category / brand lists on locked routes are link lists (see §3) instead of checkboxes that would have no effect.
* Price fields + slider both exist (the original hides its number inputs).
* The rating rows draw their own Font Awesome stars (solid gold / pale grey, like the original filter) instead of `app-star-rating`,
  whose empty stars are outlines; checkboxes are 20px circles (original) instead of the global square `.form-check`.

## 6. Workarounds for shared components / services (nothing shared was edited)

* `app-pagination`: both variants bring their own 45 / 15 / 20px top margin → the two instances live in a flex row so the margins
  do not add up (`.pager`); on very narrow screens they wrap.
* Router: `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` scrolls to the top on **every** navigation, also on
  query-param-only ones → the shop passes `scroll: 'manual'` and scrolls to its own toolbar.
* `.form-control-soft` select: `select.form-control` gives it `padding-right: 46px` (original 35px) → overridden locally, plus an
  ellipsis for the 320px case.
* `app-product-card` has a fixed square thumbnail, but the original squashes the product image to `1 / 0.87` between 768 and 1024px
  (250 × 217.5 at 820px): the shop grid overrides `.thumb { aspect-ratio }` for that range with a scoped `::ng-deep`. Row pitch now
  matches the original within 1.5px at 768 / 820 / 900 / 1440 (the card is 1.5px taller than the original everywhere) – cosmetic.
* Layout uses the global `.container` (1320px max, 20px gutters) untouched: content x = 80 at 1440, 43 at 1366, 20px below ~1320px –
  sidebar / toolbar / grid x and width equal the original's at 1700, 1440, 1366, 1300 and 1100px.

## 7. Known gaps

* "Load More" is not shareable (a link reproduces only the `page` in the URL; the appended pages live in `history.state`).
* The slider uses two native `<input type="range">` – styled for WebKit / Blink and Firefox pseudo-elements, only verified in Chrome.
* The pinned inner scroll needs scroll-state container queries (Chrome / Edge 133+). Elsewhere the sidebar is a plain sticky column
  like the original's, i.e. the last facets are only reachable once the grid's end scrolls them into view.
* The select chevron is the shell's thinner arrow (the original's is a bolder eicon).
* No comparison / quick-view / grid-list switch (the original hides them too).
* Facet counts are not "faceted" (see §5).

## 8. Verification (done)

`ng build --configuration development` and the production `ng build` are green (no budget warnings; shop chunk 38 kB / 9.4 kB gzip). Screenshots in `shots/shop/`: `orig-*` vs `my-*` for `/shop`, `bedroom`, `nordic-living`
at 1440 / 820 / 390 (+ 1100, 1025, 320, drawer at 390 / 820, search at 820, 404). Metrics compared with a Playwright measurement of
the original at 1700 / 1440 / 1366 / 1300 / 1100 / 900 / 820 / 768 / 390 (sidebar 280px, toolbar y = 694, grid columns 308.3 × 3, 15px gap, 30px row gap – identical x / width; footer offsets within a few px).
Playwright behaviour runs (≈ 420 checks, no console errors / warnings, no horizontal overflow at 14 widths × 4 routes):
default page · all 8 sorts · per-page 6/9/12 · numbers + next/prev · Load More (+ focus, Back, reload, resets) · price fields, slider
(keyboard and mouse), clamping, swap, Reset · rating toggle · category / brand OR / AND · Clear all · deep links with every param ·
junk params · `?page=99` · search (+ empty state, Reset filters, whitespace) · category / brand routes (locked lists, sibling links
without reload, param ignoring, 404 for unknown slugs) · Back / Forward across 4 filter steps · header search → shop · drawer at 390
and 820 (open, focus, trap, Esc, backdrop, close button, footer button, live filtering, badge, scroll lock, resize to desktop) ·
sticky sidebar (pinned / unpinned, inner scroll, wheel chaining), keyboard focus rings and accessible names, touch taps, rapid
click streams, every product image loads on all shop routes.
