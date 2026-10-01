# Home – `/` (`HomeComponent`, selector `app-home-page`)

Owner: **home agent**. The complete original `index.html`, section by section and in the original order. Nine sections are
home-only components under `src/app/pages/home/sections/`, four come from `src/app/shared/sections/` and are dropped in
unchanged. Everything is standalone, `OnPush` and zoneless-safe (state in signals); all data comes from the services
(`ProductService`, `BlogService`, `ContentService`); every internal link is a `routerLink` (no `.html`, no `#`).

## 1. Files

| File | What |
|---|---|
| `src/app/pages/home/home.component.{ts,html,scss}` | the page: `<main class="home">` stacking the 13 sections; feeds `ContentService.testimonials()` to the testimonial slider |
| `sections/hero/` | `HomeHeroComponent` · `app-home-hero` |
| `sections/categories/` | `HomeCategoriesComponent` · `app-home-categories` |
| `sections/promo/` | `HomePromoComponent` · `app-home-promo` |
| `sections/top-rated/` | `HomeTopRatedComponent` · `app-home-top-rated` |
| `sections/new-arrivals/` | `HomeNewArrivalsComponent` · `app-home-new-arrivals` |
| `sections/luxury/` | `HomeLuxuryComponent` · `app-home-luxury` (the two feature icons are inline SVG from the original) |
| `sections/flat-discount/` | `HomeFlatDiscountComponent` · `app-home-flat-discount` |
| `sections/design-stories/` | `HomeDesignStoriesComponent` · `app-home-design-stories` + `images/story-1..4.jpg` |
| `sections/latest-news/` | `HomeLatestNewsComponent` · `app-home-latest-news` |
| `docs/home.md` | this file |

None of the components has inputs or outputs – they are page sections, not reusable widgets.

## 2. Sections (original order)

| # | Section | Built with | Original (Elementor id) | Data / links |
|--:|---|---|---|---|
| 1 | **Hero** – pill "Modern Living Starts Here", h1 "Crafted Furniture For Every Beautiful Home", Shop Now | `app-home-hero`: `app-section-title` (`tag="h1"`, `light`, h1 restyled 80/58/36px 900) + `.btn-highlighted`; `hero-bg-image.jpg`, 50 % primary overlay, 800/600/500px | `6348e1f` | Shop Now → `/shop` |
| 2 | **Shop By Category / Explore Furniture Categories** | `app-home-categories`: `app-section-title` + `app-slider` (7 circular tiles, 6 / 4 / 2 per view, autoplay 3 s, speed 1 s, loop) | `214418f`, `202d489` | Living Room · Bedroom · Dining Room · Office → `/product-category/<slug>` with the **real** count from `ProductService.categories()`; Outdoor · Home Storage · Kitchen → `/shop`, original captions (15 / 20 / 20 items) |
| 3 | **Two promo boxes** – "Save Up To 50% / Limited Time Flash Sale", "Extra 20% Off / Mega Furniture Sale Event" | `app-home-promo`: photo boxes (`offer-item-image-1/2.jpg`), dark top-down gradient, text link with a white arrow disc | `a9bf92d`, `ba620d3` | Shop Now → `/shop` |
| 4 | **Top Rated Product / Discover Our Newest Arrivals** | `app-home-top-rated`: heading + paragraph row, 4 × `app-product-card badge="percent"`, avatar (`author-1.jpg` + phone disc) CTA line | `d5f779d`, `f0f1cc5` | `ProductService.featured(4)`; "View Our All Products." → `/shop` |
| 5 | Product Video | shared `app-product-video-section` | `9c31e95` | – |
| 6 | Trending Now | shared `app-trending-section` | `72b9a6e` | – |
| 7 | **New Arrivals / Newly Arrived Furniture** | `app-home-new-arrivals`: cream band, large "Style Meets Comfort" card (`arrivals-item-image-1.jpg`, white "Up to 40% Off" pill, `.btn-highlighted`) + 2 × 2 photo tiles (`arrivals-item-image-2..5.jpg`) | `6a8a040` | every link → `/shop` (tiles use a stretched link: one tab stop per tile) |
| 8 | Best Seller | shared `app-best-seller-section` | `0ecf61b` | – |
| 9 | **Luxury TV Cabinets Crafted With Elegance** | `app-home-luxury`: cream rounded box – heading, "Modern Minimal Design" / "Smart Storage Spaces" icon boxes, divider, dotted list (Premium Wood · Easy To Maintain · Durable Build Quality), photo with the theme's "shiny glass" hover sweep | `989439a` | – |
| 10 | **Flat Discount / Discover Amazing Flat Furniture Discounts Today** | `app-home-flat-discount`: dark band, paragraph, `app-countdown`, Buy Now, `discount-image.jpg` cut into a 5-tile mosaic with `discount-image-mask.svg` (CSS mask) | `09fc6c9` | Buy Now → `/shop` |
| 11 | **Design Stories / Modern Living Inspirations** + the "Free · Let's make something great work together. Get Free Quote." line | `app-home-design-stories`: 4 portrait tiles (dark veil + round social button appear on hover / focus), accent "Free" pill + text | `b50ba1b` | Get Free Quote → `/contact-us`; the four icons → the network sites of `SITE_CONFIG.social` (new tab) |
| 12 | Happy Customer / Beautiful Furniture Trusted By Modern Families | shared `app-testimonial-slider [items]="content.testimonials()"` | `6e550fa` | all 6 testimonials (the original repeats one) |
| 13 | **Latest News / Creative Furniture Styling Tips** | `app-home-latest-news`: `app-blog-card variant="highlight"` (newest post) + 2 × `variant="row"` | `a250c70` | `BlogService.latest(3)` → `/blog/:slug`, `/category/:slug` |

## 3. Decisions

* **Countdown deadline (section 10).** The original counts down to a fixed date (2027-05-21 12:00) and would end in "Countdown is
  finished!". Here the end is **15 days after the visitor's first visit**, computed once and kept in
  `localStorage['livora.home.flat-discount.ends']` (ISO string; +1 s so the first render reads `15 Days 00 Hours 00 Minutes 00 Seconds`).
  When it has passed a fresh 15-day campaign starts, so the timer never shows "finished" on the home page; without storage
  (private mode) every page load starts a new 15-day timer. (`storage.util` helpers, never throw.)
* **Category slider (section 2).** 7 tiles with 6 in view is a degenerate case for Swiper 11's loop mode (no spare slides:
  the pagination jumped to wrong slides and Tab visited the same tiles three times). The original uses cloned slides, so do
  we: the tiles are rendered **twice**, the second copy is `aria-hidden` and `tabindex="-1"`; the dots are our own
  (`<button>`s with 24px hit area, one per tile, `aria-current`, they take the nearer of the two copies); the slider's own
  pagination is not used. Focus on an already visible tile is kept away from Swiper's a11y module (capture-phase listener),
  so Tab moves through the 7 tiles → 7 dots → next section without the row jumping; a tile outside the view is still slid
  into sight. Autoplay is off for `prefers-reduced-motion` and rests while the pointer or keyboard focus is inside the slider
  (done by `app-slider`). The circles are 180px (160px ≤ 1024px) but never wider than their slide, because the original's
  overlap between 1025px and ≈ 1220px and on very narrow phones.
* **Story tiles (section 11).** The original plays a muted looping MP4 (`demo.awaikenthemes.com/assets/videos/livora-our-story-N-video.mp4`,
  1.4–1.8 MB each) over a poster (`Storie-bg-image-N.jpg`). Neither is in the mirror or in `public/assets/images`, so the four
  **posters were downloaded** into `sections/design-stories/images/` and are bundled by the builder through the relative
  `url('./images/story-N.jpg')` in the component SCSS (hashed files in `media/`). The videos are not used (no external
  dependency, no 6 MB of video). The social buttons link to the same network home pages as the footer (original: `#`).
* **"Top Rated" cards.** The original prints the "-13%" tag only on *simple* products (Modern Wooden Table, Wooden Dining
  Chair); variable products (Scandinavian Wooden Table, Luxury Tufted Velvet Sofa) get none. `badge="percent"` would tag every
  product on sale, so the tag of variable products is hidden (`.no-tag`). The original also gives the photos a fixed height
  (302px, 312px ≤ 991px, 167px ≤ 767px – it stretches the picture) – applied here with `object-fit: cover`.
* **Vertical rhythm** = the original Elementor paddings *plus* the 10px default padding of every nested container – the same
  convention as the shared sections (100px above a heading block, 60px between heading and content, …).
* **Side gutters** come from the global `.container` (`max-width: 1320px`, 20px gutters → x = 80 at 1440px, 20px below ≈ 1320px,
  like the original at every width); the sections add no gutter rules of their own. Only the flat-discount row is widened by
  10px per side (`margin-inline: -10px`) because the original's columns are 50 % of the 1300px Elementor inner box and pad
  themselves (text column 630px, photo column 620px).
* **Text** copied verbatim (including "Let’s" with a typographic apostrophe, "Up to 40% Off", "Starting from …" etc.).
* The stretched links / round arrows / pills reuse the global button and section-title styles (`.btn-highlighted`,
  `app-section-title`); no button or title styling was re-implemented.

### Local overrides of shared components (no shared file was edited)

These use `::ng-deep` with a specificity high enough to beat the shared rules; if a shared class is renamed the override
just stops applying (the shared look remains).

| Where | Override | Why |
|---|---|---|
| `top-rated` → `app-product-card` | `.thumb` fixed height 302/312/167px, `.card.is-home .title` padding-top 14px ≤ 1024px, `.no-tag .badge-percent { display: none }` | original list metrics (see above) |
| `latest-news` → `app-blog-card` `row` | ≥ 992px: photo `calc(33% − 10px)` (scales with the card) and 20px text padding; ≤ 991px: stacked card (photo on top, 1 : 0.598, 15px / 5px padding) also on phones; ≤ 767px tighter gaps; date line 14px | the original theme CSS (`.posts-item-list`, widget `99fcb8d`) |
| `latest-news` → `app-blog-card` `highlight` | `min-height` 435px tablet / 352px phone; date line 14px | original: 470 / 435 / 352px |
| `categories` → `app-slider` | capture-phase `focus` listener (see decision above) | keyboard behaviour with a looping slider |
| `hero` → `app-section-title` | `.section-title__heading` 80/58/36px, weight 900 | the hero h1 is much bigger than a section heading |

## 4. Verification

Screenshots in `shots/home/` (`orig-*.png` = original at 1440, `orig-820-*`, `orig-390-*`; `mine-*` = this page; `focus-sheet.png`,
`hover-*.png`). The original was shot with `--orig` and Elementor's lazy-load class forced on; boxes were measured with a
Playwright script that compares identical elements of both pages.

* **Section heights (original / this page), px:**

  | width | hero | categories | promo | top rated | luxury | flat discount | stories | news |
  |---|---|---|---|---|---|---|---|---|
  | 1440 | 800 / 800 | 597 / 597 | 565 / 565 | 804 / 805 | 592 / 591 | 796 / 796 | 844 / 844 | 836 / 836 |
  | 820 | 600 / 600 | 431 / 432 | 440 / 440 | 1153 / 1155 | 881 / 881 | 1030 / 1030 | 1008 / 1008 | 1075 / 1072 |
  | 390 | 500 / 500 | 418 / 418 | 670 / 670 | 955 / 955 | 698 / 698 | 824 / 824 | 811 / 811 | ≈ 1382 / 1376 |
  | 1366 | 800 / 800 | 597 / 597 | 565 / 565 | 804 / 805 | 592 / 591 | 796 / 796 | 844 / 844 | 836 / 836 |
  | 1100 | 800 / 800 | 597 / 577 ¹ | 565 / 565 | 804 / 805 | 604 / 604 | 691 / 691 | 844 / 844 | 808 / 802 |

  ¹ deliberate: the category circles never exceed their slide (the original's 180px circles are wider than the 160px slides
  there and touch or overlap).

  (the shared sections match as well, except the testimonial slider's dots row: +42px tablet, +34px phone.) Inner boxes
  – headings, pills, cards, buttons, tiles, countdown, mosaic – are within 1–3px at 1440, 820 and 390.
* **Behaviour:** category slider autoplay, drag, dot click and Enter on a dot; tile hover (splash overlay + "N Items" caption);
  story hover (veil + social button); promo arrow turns 45°; countdown ticks; keyboard: every link/button of the page shows
  a visible focus ring (`focus-sheet.png`), Tab order hero → 7 tiles → 7 dots → promo; `prefers-reduced-motion` (no autoplay,
  ~0 transitions).
* **Links:** 79 anchors (14 distinct internal targets, 4 external), all internal ones render a real page (none the 404), no
  `.html`, no `#`. 46 images, none broken, all with an `alt` attribute. No console errors or warnings; no horizontal overflow at
  1920, 1440 … 360, 320px. `ng build` (development and production) is green, no budget warnings (home chunk 43 kB / 9 kB gz).

## 5. Known gaps / deliberate deviations

* **Hero parallax** (ElementsKit "jarallax", speed 0.5) is not reproduced – a plain `cover` background. (The original's first
  frame also shows a 44px dark band at the bottom of the hero and a slightly tighter crop; that is a side effect of the effect.)
* **Story tile videos** (see decisions) and the theme's scroll-triggered reveal animations (GSAP) are not reproduced.
* The original's category **dots wrap onto two rows** at 390px (theme quirk) – ours stay on one row.
* The original's Latest News on **tablet** shows the highlight card at half width next to an empty half (theme rule
  `.post-items > .post-item { flex: 0 0 50% }`); here it spans the full width (435px high).
* Star glyphs, the hover-button placement and the `Add to cart` overlay of the product cards are the shared component's design.

## 6. Requests for shared files (not done – not my files)

The container/gutter question is settled by the global `.container` (20px gutters, 1320px max). Remaining:

1. `app-slider`: in loop mode with few slides (here 7 tiles / 6 per view) pagination clicks land on the wrong slide and
   Swiper's focus handling makes Tab revisit slides. `watchSlidesProgress: true` (so visible slides do not trigger `slideTo` on
   focus) and/or cloning slides would fix it for every consumer; the home page works around it locally.
2. `app-blog-card variant="row"`: photo `calc(33% − 10px)` instead of 183px, 20px text padding, stacked layout up to 991px
   (1 : 0.598 photo, 15px card padding), 14px date line – see the override table above; `variant="highlight"` min-height 435px
   tablet / 352px phone.
3. `app-product-card badge="percent"`: skip variable products (the original tags only simple products); optionally an input
   for the fixed 302 / 312 / 167px photo height of the home list.
