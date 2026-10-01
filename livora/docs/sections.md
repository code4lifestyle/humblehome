# Sections agent – shared marketing sections (`src/app/shared/sections/…`)

Six reusable page sections that appear on several pages of the original Livora site (Home, About, Testimonials).
Every component renders **its own outer `<section>`** with the original background, vertical padding and a `.container`,
so a page just drops the tag in. All are standalone, `OnPush`, zoneless-safe (state in signals), styled with the tokens of
`src/styles/_tokens.scss` and responsive with the original breakpoints (tablet ≤ 1024px, mobile ≤ 767px). Links are
`routerLink`s; every target exists in `app.routes.ts`.

```ts
import { BestSellerSectionComponent } from '@shared/sections/best-seller-section/best-seller-section.component';
```

| Selector | Class | Inputs | Used on (original) | Block in the original |
|---|---|---|---|---|
| `app-best-seller-section` | `BestSellerSectionComponent` | – | Home, About | "Best Seller / Best Selling Furniture Collection" |
| `app-trending-section` | `TrendingSectionComponent` | – | Home, Testimonials | "Trending Now / Trending Space Inspirations" |
| `app-approach-section` | `ApproachSectionComponent` | – | About, Testimonials | "Our Approach / Thoughtfully Designed For Modern Living" |
| `app-product-video-section` | `ProductVideoSectionComponent` | – | Home, Testimonials | "Product Video / Watch Products Designed For Modern Living" |
| `app-testimonial-slider` | `TestimonialSliderComponent` | `items: Testimonial[]` (default `[]`) | Home, About | "Happy Customer / Beautiful Furniture Trusted By Modern Families" |
| `app-faq-preview-section` | `FaqPreviewSectionComponent` | `items: FaqItem[]` (default `[]`) | About, Testimonials | "Frequently Asked Questions / Common Questions About Furniture Collections" |

```html
<app-product-video-section />
<app-trending-section />
<app-best-seller-section />
<app-testimonial-slider [items]="content.testimonials()" />
<app-approach-section />
<app-faq-preview-section [items]="content.faqPreview()" />
```

The two input-driven sections take `ContentService.testimonials()` / `ContentService.faqPreview()`; the inputs are optional
(default `[]`, the section then shows only its heading).

## Files

```
src/app/shared/sections/<name>/<name>.component.{ts,html,scss}     six folders, names = the selectors without `app-`
src/app/pages/lab/lab-sections.component.ts                        sandbox route /lab/sections (delete at integration)
docs/sections.md                                                   this file
```

Dependencies (other agents' components, used through their public API only): `app-section-title` (every section),
`app-slider` + `app-star-rating` (testimonial slider), `app-accordion` (FAQ preview), global `.btn-default` (FAQ button).

## Common behaviour

* **Vertical rhythm** = the original's Elementor container padding (90px, 40px on tablet/mobile) + the 10px default
  padding of the nested containers: sections use 100px / 50px; Best Seller has 100px above and 50px below (25px on tablet).
  The gap between the heading block and the content is 60px (30px on tablet).
* **Backgrounds**: Best Seller, Trending, FAQ = page background; Approach and Testimonial slider = `--color-secondary`
  (cream); Product Video = full-bleed photo. Cards use the 20px radius (`--radius-md`), inner images 10px.
* **Images** are the original uploads (`assets/images/…`), `loading="lazy"` below the fold, real `alt` text where the image is
  informative; the duplicate image/arrow links of a card are `tabindex="-1" aria-hidden="true"` so keyboard and screen-reader
  users meet exactly one link per card.
* Text is copied verbatim from the original (prices, "UP TO x% OFF", the FAQ intro paragraph, …).

---------------------------------------------------------------------------------------------------------------------

## `app-best-seller-section`

One large tile (left, `best-seller-img-1.jpg`, "Upholstered Storage Beds | 1500+ Designs", from $899) and four small tiles
(2 × 2): Cabinets | 800+ Items ($199), Dining Sets | 750+ Designs ($1,299), Sofa Sets | 1200+ Styles ($1,299),
Coffee Tables | 550+ Items ($189). Every title, image and round arrow links to `/shop` (as in the original).

* Tablet: the large tile goes full width above the 2 × 2 grid; mobile: one column. Image ratio 1 : 0.96 (large) / 1 : 0.843
  (small), 1 : 0.7 on tablet and below.
* Hover: the photo zooms to 1.06 (0.6s); the accent arrow disc turns dark while the text/arrow area is hovered and the arrow
  rotates 45° when the disc itself is hovered.

## `app-trending-section`

Three image cards + three offer banners in a 3-column grid (2 columns on tablet, 1 on mobile).

| Card | Link | Banner | Link |
|---|---|---|---|
| OFFICE – Designed For Productive **Living** | `/product-category/office-furniture` | UP TO 50% OFF – Luxury Sofa, from $899 | `/product-category/living-room` |
| CHAIRS – Comfort Meets Timeless **Style** | `/shop` | UP TO 40% OFF – Modern Desk, from $399 | `/product-category/office-furniture` |
| SOFAS – Create Moments Of **Togetherness** | `/product-category/living-room` | UP TO 35% OFF – Dining Set, from $649 | `/product-category/dining-room` |

* The banners keep the three Elementor gradients (`114deg`, sand / stone / olive), the translucent chip that sits flush against
  the left edge and the product photo that bleeds off the right edge (image column `53% + 95px` wide with `-115px` margin).
  The title is a *stretched link* (the whole banner is clickable, the focus ring is drawn around the banner).
* Like the original, the card photos are never enlarged beyond their natural 360px – on tablets / large phones they sit
  centred in the card.

## `app-approach-section`

Cream section: heading, three white pills (Design With Purpose · Premium Material · Expert Craftsmanship – hover turns them
dark) and three image cards (`approach-item-image-1..3.jpg`) with an accent "UP TO 40% OFF" badge (link → `/shop`,
`aria-label` "UP TO 40% OFF – <title>"), title (Design With Purpose · Premium Material Selection · Expert Craftsmanship) and
text. Hover: photo zoom 1.06 plus the theme's "shiny glass" diagonal sweep over the photo; the badge turns dark.

## `app-product-video-section`

850px tall (580px on tablet/mobile) photo section (`intro-video-bg.jpg`, bottom-to-top dark gradient), content pinned to the
bottom: pill + heading on the left, on the right a 140px (120 / 100px) circle with the rotating text
"MODERA LIVING * MODERA LIVING *" (copied from the original; SVG `textPath`, 20s per turn, pauses on hover) around the play
button.

The play button opens a **modal built on the native `<dialog>`** (`showModal()`):

* the YouTube `<iframe>` (`https://www.youtube.com/embed/Y-x0efG1seA?autoplay=1&rel=0&playsinline=1`, trusted once with
  `DomSanitizer.bypassSecurityTrustResourceUrl`) only exists **while the modal is open** (`@if (playing())`), so closing it
  stops the video;
* `Esc`, the × button and a click on the backdrop close it; a click inside the video does not;
* focus moves to the close button on open and returns to the play button on close; the page behind is inert; the body
  scroll is locked while open (and released on close/destroy);
* the dialog is labelled ("Product video"), the play button is `aria-haspopup="dialog"`.

## `app-testimonial-slider`

Cream section, the armchair photo (`testimonials-image.png`) on the left; on the right the heading and an auto-playing
`app-slider` (1 slide, 30px gap, loop, 6s autoplay that pauses on hover, 0.9s transition, dots below). A slide is the
transparent ElementsKit "style 5" card: gold `app-star-rating` (size `lg`, from `Testimonial.rating`), the quote in 15px
bold, a divider, round 60px avatar + name + role and the big faint quotation mark in the corner.

* `quote` is shown with typographic quotes; if the content already contains them (ContentService does) nothing is added.
* One single testimonial → no loop, no autoplay, no dots.
* The original has *no* dots/arrows (auto-play only); the dots are an addition (usability).

## `app-faq-preview-section`

Two halves: left a sticky intro (pill, heading, the paragraph "Find quick answers to the most common questions about our
furniture collections, including materials, sizes, customization, delivery.", `.btn-default` "View All FAQ's" → `/faqs`),
right an `app-accordion` fed with `{ title: item.question, content: item.answer }` (first row open, questions numbered
"1." … by the accordion's defaults). The intro sticks at `top: calc(var(--header-height, 0px) + 40px)` on desktop and is
static on tablet/mobile (stacked).

---------------------------------------------------------------------------------------------------------------------

## Verification (how it was checked)

Against the original mirror with `tools/shot.mjs` (`--orig`, Elementor's lazy-load class forced on so the gradients show) and
a Playwright script that measures every text/image box of the original block and of my component:

* **1440px** (with the global `--container-gutter: 10px`): section heights are identical to the pixel (Video 850,
  Trending 943.6, Best Seller 1027.2, Testimonial slider 748, Approach 837.7, FAQ 741) and all text/image boxes are
  within 1px of the original.
* **1024 / 820 / 768 / 600 / 480 / 390px**, simulating the original's 20px side gutters on tablet/mobile: Video 0px,
  Trending / Best Seller / Approach about +5px, FAQ +10px (the section-title gap, see below), Testimonial slider about
  +40px (the dots row, which the original does not have). With the current global 10px gutter the content is 10px wider
  per side than the original there. See "Suggested shared changes".
* Modal: keyboard (Enter opens, focus lands on ×, Tab cycles inside, Esc closes, focus back on the play button), backdrop
  click, × click, click inside the video, scroll lock, mobile viewport – all scripted; slider: autoplay, dots by mouse and
  keyboard, pause on hover. No console errors or warnings on `/lab/sections`. `ng build` (development and production) is green,
  no budget warnings; sources are Prettier-formatted.

## Known gaps / deliberate deviations

* The original's Elementor **scroll animations** (fade-up, split-heading, image clip reveals, ScrollTrigger) are not
  reproduced.
* The original's background **MP4** of the video section is not used (external file) – the still `intro-video-bg.jpg` is.
* The play icon stays still while the text ring rotates (in the original the whole circle, icon included, spins).
* Two accidental quirks of the mirror between about 480 and 767px are not copied: Approach photos are clipped to a shorter
  window there, and the small Best Seller photos stop growing at 620px and hug the left of the tile. (The Trending photo cap
  at 360px *is* replicated because it is visible on tablets.)
* Best Seller tiles all link to `/shop` (as in the original); Trending uses the matching category pages.

## Suggested shared changes (not done – not my files)

1. `src/styles/_tokens.scss`: the original's Elementor sections have 20px side gutters on tablet/mobile. One line makes
   every section of every page match: `@media (max-width: 1024px) { :root { --container-gutter: 20px; } }`. (I checked
   this against all six sections: they then match the original to within ~5px at 1024, 820, 768, 600, 480 and 390px.)
2. `app-section-title`: at ≤ 1024px the original gap between pill, heading and paragraph is **10px** (`15px` on desktop);
   the component keeps 15px, which adds 5px per gap on tablet/mobile.
3. (obsolete) the old architecture note said "`.container` (1300px + 15px gutters)" – it is 10px now.
