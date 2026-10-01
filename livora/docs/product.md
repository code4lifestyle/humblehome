# Product page – `/product/:slug`

Owner: **product agent**. The single product page (original: `product/<slug>/index.html`, Elementor template 3126 with the
ShopEngine / WooCommerce widgets). One lazy route component renders all 12 products of the reduced catalog: simple, sale, variable
with a price range, variable with uniform prices.

```
Home › Luxury Collection › Leather Recliner                                   ← breadcrumb (there is NO banner, like the original)
┌─────────────── gallery ───────────────┐ ┌──────────────── summary ────────────────┐
│ [17% OFF]                    [expand] │ │ Leather Recliner                        │
│         main image (hover zoom)       │ │ Luxury Collection                       │
│                                       │ │ ───────────────────────────────────     │
│ [thumb][thumb][thumb][thumb]  ‹ ›     │ │ excerpt + highlight bullets             │
└───────────────────────────────────────┘ │ $49.00 $59.00 · Inclusive of all taxes* │
                                          │ Color  ● ● ● ● ●  Clear                 │
                                          │ [ − 1 + ] [Add To Cart] [♡]             │
                                          │ ─── SKU / Category / Brand ───          │
                                          │ ─── Accepted Payment Methods ───        │
                                          └─────────────────────────────────────────┘
Description | Additional information | Reviews (n)        ← tabs
"Featured products / Explore Our Signature Jewellery Pieces" + Related products (3 × app-product-card)
```

## 1. Files

| File | What |
|---|---|
| `src/app/pages/product-detail/product-detail.component.{ts,html,scss}` | `ProductDetailComponent` (`app-product-detail-page`, **name and selector unchanged**): resolves the slug, page title, 404, breadcrumb, columns, related section, owns the chosen variation |
| `…/product-gallery/product-gallery.component.*` | `ProductGalleryComponent` (`app-product-gallery`): main image, badge, expand button, thumbnails + arrows, hover zoom, swipe, opens the lightbox |
| `…/product-lightbox/product-lightbox.component.*` | `ProductLightboxComponent` (`app-product-lightbox`): full-screen viewer (accessible modal) |
| `…/product-summary/product-summary.component.*` | `ProductSummaryComponent` (`app-product-summary`): title … payment methods, variation picker, cart / wishlist actions |
| `…/product-tabs/product-tabs.component.*` | `ProductTabsComponent` (`app-product-tabs`): ARIA tabs, Description, Additional information, holds the local review list |
| `…/product-reviews/product-reviews.component.*` | `ProductReviewsComponent` (`app-product-reviews`): rating summary, review list, "Add a review" form (Reactive Forms) |
| `…/product-detail.utils.ts` | `variationDiscount()`, `breadcrumbCategorySlug()`, `luminance()` / `needsDarkCheck()` (swatch check colour), `scrollBehavior()` (reduced motion) |
| `docs/product.md` | this file |

Everything is standalone, `OnPush`, signal based (zoneless-safe), uses only the services (`ProductService`, `CartService`,
`WishlistService`, `ToastService`, `PageTitleService`), `@core/utils/product.utils` and `image.utils`, the shared
`app-section-title` / `app-product-card` / `app-quantity-input` / `app-star-rating` and the global `.btn-*` / `.form-*` styles.
No route, model, service or shared-component file was touched.

## 2. Public API (all inside the page folder – nothing else should use them)

```ts
// page
readonly slug = input<string>();                       // :slug – old WordPress slugs (modern-linen-fabric-sofa …) resolve too

// app-product-gallery
images = input.required<string[]>();  alt = input.required<string>();  badge = input<string | null>();
variation = input<ProductVariation | null>();          // its image is brought on stage

// app-product-lightbox (created with @if by the gallery)
images = input.required<string[]>();  alt = input.required<string>();  index = model(0);  closed = output<void>();

// app-product-summary
product = input.required<Product>();  variationChange = output<ProductVariation | null>();

// app-product-tabs
product = input.required<Product>();

// app-product-reviews
productName = input.required<string>();  reviews = input.required<ProductReview[]>();  reviewSubmitted = output<ProductReview>();
```

## 3. Behaviour

**Routing / title / 404** – `slug` is bound from the route. `ProductService.bySlug()` unknown → the page calls
`router.navigateByUrl('/404', { skipLocationChange: true })` (the not-found page shows, the address bar keeps the URL). Known →
`PageTitleService.set(product.name)` ("Leather Recliner – Livora"). The page renders a list with **0 or 1 view-model** and
`@for … track product.id`, so moving from one product to another (related cards) rebuilds gallery, summary, tabs and the review
form: chosen colour, quantity, active tab, lightbox and local reviews never leak between products. The chosen variation lives in a
`linkedSignal` that is reset by the product.

**Breadcrumb** – `Home › category › product` (`routerLink`s, last crumb = `aria-current="page"`). The category is the first one,
except for the two products where the original's WooCommerce "main term" differs (Contemporary Leather Sofa → Office Furniture,
Luxury Tufted Velvet Sofa → Living Room) – see `breadcrumbCategorySlug()`.

**Gallery** – main image `imageVariant(img, '600x600')` (+ the 1200px original as `2x` srcset) on the cream 20px-radius stage (square, at most
610px high = 615 × 610 at 1440px; 20:17 and at most 518.5px high on tablets/phones – all like the original), `object-fit: contain`, so nothing
is ever distorted. Alt text = name / "name - Image 2" …
Thumbnails (`300x300`, four visible, horizontal strip that scrolls with more images, active one ringed and
`aria-current`) select the image; the two translucent arrow bars over the first/last thumbnail (desktop only, as in the original) step
through the images. **Hover zoom** (mouse only, `(hover: hover) and (pointer: fine)`): a second layer with the full-size 1200px image,
scaled 2× around the pointer, loaded on the first hover. Touch: swipe the main image. The **badge** shows the discount of the chosen
variation ("17% OFF"; before a choice the first variation, exactly like the original), of the product for simple products, nothing
when the product is not on sale. The gallery is sticky (`top: calc(var(--header-height) + 20px)`) inside its grid row on desktop.

**Lightbox** (expand button, or a click on the main image) – full-screen dark viewer with counter "1 / 4", close, prev / next and
the full-size image; `role="dialog" aria-modal`, focus moves to the close button and returns to the opener, Tab / Shift+Tab are
trapped, `Esc` closes, `←` `→` change the image (wraps), backdrop click closes (a click on the image does not), swipe on touch,
`documentElement` scroll lock while open (same mechanism as the shell's overlays). On close the main image follows the last image
viewed. Sits outside the sticky wrapper on purpose (a sticky ancestor is a stacking context and would trap it below the header).

**Summary**
* Title `<h1>`, category links `['/product-category', slug]`, excerpt + highlight bullets, divider like the original.
* **Price**: simple → `$39.00` + struck-through `$49.00`; variable → the range `$30.00 – $49.00` (low → high; the original prints
  high → low, an artefact of its CSS) until a variation is chosen, then that variation's price (`$40.00 $50.00`); uniform variable
  prices (Leather Recliner) show as a plain sale price. Screen-reader texts like WooCommerce, `aria-live="polite"`.
* **Variation picker** (only for variable products): one row per attribute. With `attribute.swatches` → 24px round swatches
  (`role="radiogroup"` / `role="radio"`, roving tabindex, ← → ↑ ↓ Home End choose the neighbour, tooltip with the colour name on hover
  and keyboard focus, chosen swatch = dark ring + check, the check turns dark on light colours – Gray, Light, Pink – for contrast); without
  swatch colours → a `<select>` ("Choose an option"). "Clear" (only while something is chosen) resets. `findVariation()` decides.
* **Add To Cart**: `CartService.add(product, qty, variation?)` (it toasts "… has been added to your cart. View cart"). Until every
  attribute is chosen the button is dimmed (`aria-disabled="true"`, still clickable): a click shows the info toast "Please select
  some product options before adding this product to your cart." (WooCommerce's wording) and moves the focus to the swatches.
  The button is a `type="submit"` in a `<form>`, so **Enter in the quantity field adds too**.
* Quantity: `app-quantity-input` (`[(value)]`), wishlist heart: `WishlistService.toggle()`, `aria-pressed`, filled + dark when active.
* **Meta**: `SKU:` only when `p.sku || isVariable(p)` (value or "N/A", the chosen variation's SKU when it has one), `Category:` /
  `Categories:` links, `Brand:` links `['/brand', slug]` from `ProductService.brandsOf()` (comma separated, up to two).
* "Accepted Payment Methods": `SITE_CONFIG.paymentIcons` (`icon-payment-options-1..6.svg`), 47px, 1px hairline, 5px radius.

**Tabs** (WAI-ARIA tabs pattern, automatic activation) – *Description* (paragraphs + feature bullets), *Additional information*
(bordered attribute table, only when the product has attributes: `Color → Accent, Black, Gray, Light, Pink`), *Reviews (n)*.
`←` `→` Home End move between the tabs (wrapping). All panels stay in the DOM (`hidden`), so a half-typed review survives a tab
change. The active tab is accent coloured with a 2px accent underline on the hairline (on phones the labels share the row).

**Reviews** – left: "Average Rating" (average with 2 decimals, `app-star-rating`, "1 Review" / "2 Reviews"), the 5 → 1 star bars with
rounded percentages, "n review(s) for <product>", then the list oldest first: neutral avatar icon (inline SVG – the original's
Gravatar "mystery man"), stars, author (capitalised), "(verified owner)" when `verified`, `MMMM d, y` date, text. Right: **Add a
review** – star picker (`role="radiogroup"`, hover preview, arrow keys), review, name, email, "Save my name, email, and website …"
checkbox, `Submit` (`.btn-default.btn-plain.btn-block`), global `.form-*` classes. Reactive Forms: rating ≥ 1, review / name not blank,
email `something@something.tld`; messages under the fields after blur or a submit attempt (`aria-invalid`, `aria-describedby`), the
first invalid field gets the focus. A valid submit builds a `ProductReview` (today's date), the tabs component appends it to a **local
signal list** (not persisted, gone on reload / product change), shows the toast **"Thank you! Your review has been submitted."**, and
resets the form (a ticked "Save my name…" keeps name + email). Tab label, average, bars and list update at once; on narrow screens the
new review is scrolled into view. The rating shown on product cards elsewhere is catalog data and is not touched.

**Related** – heading block kept as in the original ("Featured products" pill + "Explore Our Signature Jewellery Pieces"), then
`ProductService.related(product, 3)` in `app-product-card`s (`<ul aria-label="Related products">`): 4 columns at
≥ 1025px (with three products the fourth slot stays empty, as in the original), 2 columns ≤ 1024px.

## 4. Layout (numbers measured on the original mirror)

| | ≥ 1025px | ≤ 1024px | ≤ 767px |
|---|---|---|---|
| side inset | global `.container` (1320px max, 20px gutters: x = 80 at 1440, 43 at 1366, 20px below ~1320) | same | same |
| header → breadcrumb | 70 | 40 | 40 |
| columns | 2 × 615, gap 50 | 1 column, gap 30 | same |
| title / price | 30 / 36px 700 | 26px | 22px |
| tabs → labels | 18px | 16px | 14px, equal columns |
| block gaps in the summary | 30 | 30 | 20 |
| tabs → related heading | 100 | 50 | 50 |
| related grid | 4 cols, gap 20 | 2 cols, gap 20 | 2 cols, gap 10 |

Full-page height at 1440 (Leather Recliner): original 2901px, this page 2902px.

## 5. Decisions / deviations

* **No page banner**: the original product page has only the breadcrumb row (no `page-header` image) – followed.
* **"Add To Cart" stays clickable when dimmed** (it explains what is missing) – the original shows a browser alert.
* **Range price low → high** with spaces, "n Reviews" plural, `verified owner` in parentheses like the original but italic; the dash
  between author and date has spaces – small readability fixes of typographic accidents.
* **Compare button of the original is not built** (the site has no compare feature) – heart only.
* The original's tab underline is a short 8 %-wide JS line; here it spans the label.
* **Active thumbnail ring, visible swatch check colour, focus handling, keyboard maps** are additions (a11y).
* Sticky range: the gallery is only sticky while the summary is taller (as in the original) – a few dozen px.

## 6. Workarounds for shared components (nothing shared was edited)

* `app-quantity-input` is 119 × 50px only – the original uses 105 × 46px on tablets and 101 × 46px on phones: `::ng-deep .qty*`
  overrides in `product-summary.component.scss` (≤ 1024px / ≤ 767px).
* `app-product-card` is the shop card (10px text inset, review count, square image): the original's related widget has no inset / no
  count, and its image is 1 : 0.9 between 768 and 1024px – overridden with `::ng-deep` in `product-detail.component.scss`.
* The **breadcrumb category** of two products differs from `categories[0]` in the original: local map in `product-detail.utils.ts`.
  Suggested shared fix: an optional `Product.primaryCategory?: string`.
* `discountPercent()` (shared) returns the *largest* variation discount; the badge needs the chosen / first variation's:
  `variationDiscount()` in the page's utils (could move to `product.utils.ts`).

## 7. Known gaps

* Review avatars are a neutral icon; new reviews get today's date and are lost on reload (as specified).
* Only the `Color` attribute exists in the catalog – the `<select>` fallback (attributes without `swatches`) and multi-attribute
  products are implemented but not exercised by the data; every variation's image equals the gallery's first image, so choosing a
  colour only re-selects slide 1 (the image-swap path for images outside the gallery is implemented, not exercised).
* No pinch-zoom / drag-pan inside the lightbox (PhotoSwipe has them); hover zoom is mouse only.
* Related order is the service's (shared categories, then brands, then A→Z), not the original's.
* The shell keeps **Shop** highlighted in the nav on product pages (shell behaviour, the original highlights nothing).

## 8. Verification

* Side-by-side screenshots against the original at **1440 / 820 / 390** for Leather Recliner (variable, sale), Lounge Chair (simple,
  sale), Wooden Cupboard (price range) – gallery, summary, meta, payment icons, tabs (all three), related, plus intermediate widths
  1100 / 1025 / 768 / 600 (`shots/product/`). Typography, spacing, colours and section offsets match to within a few pixels.
* Playwright suite (system Chrome, a static `ng build` served in-process so other agents' rebuilds cannot reload the page): **193 checks** – title, breadcrumb, prices and badges for the three
  product kinds, swatch clicks / arrow keys / tooltip / Clear, disabled-cart message, quantity, add to cart (header count, cart item
  key + "Color: Black" label, Enter in the quantity field), wishlist toggle, tabs (roles, roving tabindex, ← → Home End), review
  summary + bars + list + verified owner, review form validation (all messages, focus, `aria-invalid`), submit (toast, tab label,
  average, bars, list, reset, "Save my name", not persisted), gallery (thumbs, arrows, alt text, hover zoom, 5-image strip),
  lightbox (dialog attributes, focus in / out, Tab trap, Esc, arrows, backdrop, scroll lock, image click), sticky gallery,
  related cards + navigation state reset + scroll to top, old slug + case-insensitive slug, unknown slug → 404 (URL kept),
  gallery stage geometry at six widths, no horizontal overflow at 320 / 340 / 360 / 390 / 820 / 1025 / 1440 for four to five products
  (and the reviews / additional tabs at 390 / 320), no console errors or warnings.
* Element boxes (breadcrumb, stage, thumbnails, title, price, tabs, panel, related heading / grid / card) measured on the original and on
  this page at 1700 / 1440 / 1366 / 1100 / 1025 / 1024 / 820 / 600 / 390: x, width and (almost every) y agree to < 0.5px; the known
  differences are the 4px shorter thumbnail row on phones (four whole thumbs instead of the original's clipped fourth) and the related
  block (3 cards instead of the original's 3-4 different ones).
* Content fidelity: for **all 12 products** the visible text of the original (title, categories, excerpt + bullets, prices, SKU / Category /
  Brand lines, description paragraphs and bullets, attribute table, tab labels, every review incl. author / date / text / stars /
  "verified owner", average, star bars, swatch names, breadcrumb, sale badge) was extracted from the mirror and from this page by script
  and compared: **0 differences**.
* Manual a11y audit (no axe offline): every image has `alt`, every button / link / field has an accessible name, no duplicate ids, all
  `aria-*` references resolve, one `<main>`, sane heading order, logical Tab order.
* `npx ng build --configuration development` and the production build are green.
* Tip for `tools/shot.mjs` from **Git Bash**: `--dist=… /product/x` is rewritten to a Windows path by MSYS – prefix the command with
  `MSYS_NO_PATHCONV=1` (the screenshot then shows the 404 page instead of the product).
