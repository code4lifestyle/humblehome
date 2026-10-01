# Info agent – About · Testimonials · FAQs · Contact + the sidebar cards (`app-help-card`, `app-toc-card`)

Four "information" pages and the two small cards that the FAQ page and the policy pages share. All components are standalone,
`OnPush`, zoneless-safe (no async state outside the Reactive Form), styled with the tokens of `src/styles/_tokens.scss` and the
original's breakpoints (tablet ≤ 1024px, mobile ≤ 767px). Text is copied from the original mirror, data comes through
`ContentService` (`brandLogos()`, `team()`, `testimonials()`, `faqPreview()`, `faqGroups()`); the page-specific static copy
(offer banners, chips, vision & mission) lives in `pages/about/about.data.ts`.

## 1. Files

| File | What |
|---|---|
| `src/app/pages/about/about.component.{ts,html,scss}` · `about.data.ts` | `AboutComponent` (`app-about-page`, route `/about-us`) |
| `src/app/pages/testimonials/testimonials.component.{ts,html,scss}` | `TestimonialsComponent` (`app-testimonials-page`, `/testimonials`) |
| `src/app/pages/faqs/faqs.component.{ts,html,scss}` | `FaqsComponent` (`app-faqs-page`, `/faqs`) |
| `src/app/pages/contact/contact.component.{ts,html,scss}` · `contact-icons.ts` | `ContactComponent` (`app-contact-page`, `/contact-us`) |
| `src/app/shared/components/help-card/**` (`.ts .html .scss`, `help-card.icons.ts`) | `HelpCardComponent` (`app-help-card`) |
| `src/app/shared/components/toc-card/**` (`.ts .html .scss`, `toc-card.icons.ts`) | `TocCardComponent` (`app-toc-card`) |
| `docs/info.md` | this file |

The `*.icons.ts` / `contact-icons.ts` files hold SVG path data copied programmatically from the original markup (no retyped paths).

## 2. Shared cards – public API

```html
<app-help-card />                                                  <!-- no inputs -->
<app-toc-card [items]="toc" />                                     <!-- policy look (default) -->
<app-toc-card [items]="toc" [arrows]="true" />                     <!-- FAQ look -->
```

| Input of `app-toc-card` | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ label: string; fragment: string }[]` (`TocItem`, exported) | required | `fragment` = element id on the current page (no `#`) |
| `title` | `string?` | – | optional `<h2>` above the list (neither original card has one) |
| `arrows` **(added)** | `boolean` | `false` | `true` = the FAQ page look: 20px up-right arrow at the end of every entry (turns 45° on hover), 20px spacing around the dividers. `false` = the policy-page look: plain entries, 15px spacing |

* **Look** (measured against both original pages, 0px differences): outlined 20px-radius card, 30px padding (20px on tablet),
  15px text in `--color-text` (accent on hover), 1px divider under every entry but the last. Help card: 20px/700 heading (max
  240px wide), divider, phone + e-mail lines with 20px icons (icons stay dark, only the text turns accent).
* **Policy pages** – use the cards exactly as documented, no extra input needed: `<app-toc-card [items]="toc()" />` renders the
  policy look (`items` = `section.tocLabel ?? section.heading` → `section.id`), `<app-help-card />` the shared help card. In the
  original the two cards sit in a sticky column (`position: sticky; top: calc(var(--header-height, 0px) + 20px)`, 30px gap).
* **Scrolling to a target** – the router's anchor scrolling (`withInMemoryScrolling({ anchorScrolling: 'enabled' })`) calls
  `window.scrollTo(top)` and therefore ignores the global `scroll-padding-top`: the target ended up *under* the sticky header bar.
  While a TOC card is on the page it listens for the router's `Scroll` event and re-aligns the target `scroll-padding-top`
  (= `--header-height` + 16px) below the top of the page. This also fixes direct loads like `/faqs#returns-warranty`. A second
  click on an entry whose fragment is already in the URL (the router ignores same-URL navigations) is handled too.
* Links are `routerLink="."` + `[fragment]` + `queryParamsHandling="preserve"`, so they work on `/faqs` and `/policy/:slug` alike.

## 3. Pages

### `/about-us` – `AboutComponent`
Banner ("About Us"), then in the original's order:

1. **Best Offer / Where Comfort Meets Timeless Design** – two banners (Lounge Chair, Recliner Chair: text + `.btn-default` "Shop Now" →
   `/shop`, product image with the pulsing round "Save 40%" tag) · six round chips (`best-offer-product-1..6.jpg`; hover = a grey
   layer slides in from the left; *Living Room* → `/product-category/living-room`, the others → `/shop`) · **Our Vision / Our Mission**
   cards (photo background, gradient, white text; the mission text keeps the original's missing full stop).
2. `<app-approach-section />`, 3. `<app-best-seller-section />` (shared).
4. **Authorised Dealer** – heading (the original's doubled "Trusted Brand For Modern Living Trusted Brand For Modern Living" is kept
   verbatim) and the **logo ticker**: a pure-CSS marquee (6 identical groups of the 5 logos; the track moves by exactly half its width
   in 30s, `linear infinite`), pauses on hover, only the first group is exposed to assistive tech (the others are `aria-hidden`), and
   under `prefers-reduced-motion` it becomes one static centred row.
5. **Our Team** – 4 cards from `ContentService.team()`: photo (zoom 1.06 on hover), gradient, name + role; the four social icons
   (`SITE_CONFIG.social` → the networks' home pages, `target="_blank" rel="noopener noreferrer"`, `aria-label="<name> on <network>"`)
   drop in from the top on hover **and on keyboard focus** (`:focus-within`).
6. `<app-testimonial-slider [items]="testimonials" />`, 7. `<app-faq-preview-section [items]="faqPreview" />` (shared).

### `/testimonials` – `TestimonialsComponent`
Banner, then a grid (3 columns, 2 on tablet, 1 on phones) with the 6 testimonials: gold `app-star-rating` (5 stars, 19px), quote,
divider, round 50px avatar + name + role and the faint quotation mark; the card lifts 5px on hover. Then
`<app-product-video-section />`, `<app-trending-section />`, `<app-approach-section />`, `<app-faq-preview-section [items]="faqPreview" />`.

### `/faqs` – `FaqsComponent`
Banner titled **"Frequently Asked Questions"** (breadcrumb "FAQs", as in the original). Two columns: a sticky sidebar
(`<app-toc-card [items]="toc" [arrows]="true" />` with the 5 group titles → fragments = `group.id`, and `<app-help-card />`) and the main
column with one `<h2 [id]="group.id">` + `<app-accordion [items]="…" [openIndex]="2" />` per `ContentService.faqGroups()` group
(`{ title: question, content: answer }`; the 3rd question of every group is open, like the original). The sidebar sticks at
`top: calc(var(--header-height, 0px) + 20px)` on desktop and is static (stacked above the questions) on tablet/mobile.

### `/contact-us` – `ContactComponent`
* **Form** ("Do You Have Any Questions?"): Reactive Forms (`NonNullableFormBuilder`), fields first name · last name · e-mail · phone ·
  message. Validation: all but the message are required (spaces only = empty), e-mail must look like `a@b.cc`, phone 7–15 digits
  (`+`, spaces, `.`, `-`, brackets allowed). Errors appear inline under a field (`.form-error`, `aria-invalid`, `aria-describedby`)
  once it was touched or a submit was attempted; an invalid submit focuses the first bad field. A valid submit shows
  `ToastService.show('Thank you! Your message has been sent.')` and resets the form (no backend). The fields have visually hidden
  `<label>`s (the original has only placeholders) and `autocomplete` attributes; the visible placeholders are the original texts.
* **Contact Info card**: Address / Contact No. / Email / Open Store with the original icons; phone and e-mail are `tel:` / `mailto:`
  links (the value turns accent on hover); accent strip "Our Social:" with 4 round icons (`SITE_CONFIG.social`).
  The wording is the contact page's own (`245 Modern Avenue, Manhattan, New York, USA - 00258`, `+91 123 456 789`,
  `info@dominname.com` – typo of the original kept); the opening hours come from `SITE_CONFIG.contact.hours`.
* **Store Location**: pill + "Visit Our Furniture Store Today" and the Google Maps embed of the original
  (`https://maps.google.com/maps?q=New%20York&t=m&z=12&output=embed&iwloc=near`) through
  `DomSanitizer.bypassSecurityTrustResourceUrl` (a fixed literal), `loading="lazy"`, a `title`, 600 / 450 / 350px high,
  grey until hovered (as in the original).

## 4. Decisions / deviations

* **Layout numbers** come straight from the Elementor CSS (`tools/css-of.py`); every Elementor container is padded 10px, which is
  included in the vertical distances (e.g. 100px above the first heading = 90px section + 10px container). On tablet/mobile the page
  sections get `padding-inline: 20px` (coordinator's rule; the original has 20px there, the global `.container` 10px). Between
  1025 and 1300px the content is therefore 10px wider per side than the original (same as the shared sections).
* **Chips and team icons are links** (the original's are dead `href="#"` or plain text): chips → shop pages, team icons → the social
  networks like the footer. There are no `href="#"` placeholders on any of my pages.
* **Doubled ticker heading kept** (original copy-paste error) – to change it edit the `title` in `about.component.html`.
* **Ticker images** are `object-fit: contain` in the original's 139×70 box (the original squeezes the 184×80 bitmaps by ~14%).
* **Stars**: `app-star-rating` (Font Awesome, accent colour) instead of Elementor's eicon stars; sized to 19px so the row is as wide
  as the original's.
* **FAQ answers** are the original's placeholders (one text per group) – shown as in `ContentService`.
* Local overrides of the shell's form styles on the contact page (`.contact-form`): 30px column gap (Bootstrap gutter of the original
  instead of the global 24px), fixed heights 56px/136px (46px/126px on tablet) to match the original to the pixel.

## 5. Known gaps

* No scroll-reveal / split-text / parallax animations of the original (the banner photo therefore crops slightly differently from a
  scrolled screenshot of the original).
* The team members' cards themselves are not links (the original's `href="#"` name link is dropped).
* The marquee cannot be paused by keyboard/touch (hover only, no focusable content inside); it is decorative, stops for
  `prefers-reduced-motion`, and only the first logo group is announced.
* On touch screens the team social icons appear on tap/focus only (as in the original).
* The Google Maps iframe logs its own CORS errors to the console in headless Chrome (they come from google.com's document, not the app).

## 6. Suggested shared changes (not done – not my files)

* `app.config.ts`: `withInMemoryScrolling({ …, scrollOffset: () => [0, <header offset>] })` would make *every* fragment link land below the
  sticky header (my TOC card only fixes the pages that contain a TOC card). Router anchor scrolling ignores CSS `scroll-padding-top`, so
  the shell's note "anchor links never end up under the bar" only holds for native `#hash` links.
* `_forms.scss`: `.form-control-lg` renders 56.25px (line-height 1.35 × 15px + padding) instead of 56px; the contact page pins the
  height locally.

## 7. Verification (how it was checked)

* Side by side against the original mirror (`tools/shot.mjs … --orig`) at **1440 / 820 / 390px** and with a Playwright script that
  measures the boxes and computed styles of every text/image/card of the original block and of mine (pairs of selectors, y relative to
  the section top, 1px tolerance): About (best offer, chips, vision/mission, dealers, team), Testimonials grid, FAQs (sidebar, help
  card, groups, accordions), Contact (form, info card, social strip, map) – no differences beyond the original's own entrance-animation
  drift, the padding-free title wrappers and the intentionally different shared-section states noted by the sections agent
  (Best Seller renders taller in the original's lazy state, the testimonial slider has the extra dots row).
  The default look of the TOC/help cards was compared with the original *policy* page (0px differences).
* Scripted checks (Playwright, mouse + keyboard): form validation, focus handling, toast + reset, tab order, map attributes, hover
  states (contact info links, social icons, map colour, TOC arrow, chips, team card, testimonial card), FAQ anchors (click, second click,
  direct load, keyboard), `openIndex` (3rd row open in all 5 groups), sticky sidebar, ticker movement / hover pause / seamless width /
  `prefers-reduced-motion`, no dead `#` links, no horizontal overflow (element scan) and one `<h1>` at 390 / 820 / 1024 / 1440px,
  no console errors or warnings of the app on any of the four pages.
* `ng build` (development and production) is green, no budget warnings.
