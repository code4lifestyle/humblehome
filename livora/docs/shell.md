# Shell – app shell, header, footer, toasts, buttons, forms, page header, section title

Owner: **shell agent**. Everything every page shares: the frame around the routed page (`app-header` + `app-footer` +
toasts), the site configuration behind it, the global **button** and **form** styles, and the two shared heading
components `app-page-header` and `app-section-title`.

All components are standalone, OnPush and zoneless-safe (state in signals), use the tokens of `src/styles/_tokens.scss` and
the original breakpoints (tablet ≤ 1024px, mobile ≤ 767px).

## 1. Files

| File | What |
|---|---|
| `src/app/app.ts` · `app.html` · `app.scss` | shell: skip link, `<app-header/>`, `<div id="content"><router-outlet/></div>`, `<app-footer/>`, `<app-toast-container/>` |
| `src/app/layout/header/**` | `HeaderComponent` (`app-header`): promo topbar, phone box, logo, icons, nav bar, sticky compact bar |
| `src/app/layout/main-nav/**` | `MainNavComponent` (`app-main-nav`): desktop menu with dropdowns + Shop mega panel |
| `src/app/layout/mega-menu/**` | `MegaMenuComponent` (`app-mega-menu`): content of the Shop mega menu (used on desktop and in the off-canvas menu) |
| `src/app/layout/mobile-menu/**` | `MobileMenuComponent` (`app-mobile-menu`): off-canvas menu ≤ 1024px |
| `src/app/layout/search-modal/**` | `SearchModalComponent` (`app-search-modal`): "Search Your Product" overlay |
| `src/app/layout/header-actions/**` | `HeaderActionsComponent` (`app-header-actions`): search · wishlist · account · cart (+ count badges) · hamburger |
| `src/app/layout/svg-icon/**` | `SvgIconComponent` (`app-svg-icon`) + `icon-paths.ts` (the theme's header/footer SVG icons) |
| `src/app/layout/layout.service.ts` | `LayoutService`: open/close state of the off-canvas menu and the search overlay |
| `src/app/layout/footer/**` | `FooterComponent` (`app-footer`) |
| `src/app/layout/toast-container/**` | `ToastContainerComponent` (`app-toast-container`) – restyled, logic unchanged |
| `src/app/shared/components/page-header/**` | `PageHeaderComponent` (`app-page-header`) |
| `src/app/shared/components/section-title/**` | `SectionTitleComponent` (`app-section-title`) |
| `src/app/core/data/site.data.ts` | `SITE_CONFIG: SiteConfig` |
| `src/app/core/models/site.model.ts` | additive fields only (see §9) |
| `src/styles/_buttons.scss` · `_forms.scss` | global button system and form styling (already `@use`d by `styles.scss`) |
| `src/app/pages/lab/lab-shell.component.ts` | sandbox `/lab/shell` (page header, section titles, every button/form variant, toast triggers) – **delete at integration** |

---------------------------------------------------------------------------------------------------------------------

## 2. Buttons – `src/styles/_buttons.scss`

Write a plain `<a>` or `<button>` with a class; the trailing white circle with the arrow icon is drawn by CSS
(pseudo-elements, `mask` of the theme's `arrow-white.svg`), the label is capitalised like in the original.

```html
<a class="btn-default" routerLink="/shop">Shop Now</a>
<button type="button" class="btn-dark btn-sm" (click)="…">Add to cart</button>
<button type="submit" class="btn-default btn-plain btn-block">Place order</button>
```

| Class | Look | Hover |
|---|---|---|
| `.btn-default` | accent pill, white 16px/700 label, white circle + accent arrow (50px high, 24px left padding) | dark (`--color-primary`) fill sweeps in from the left, arrow turns 45° |
| `.btn-highlighted` | the hero button (same rest state, 10px gap) | white fill, dark label, circle turns dark with a white arrow |
| `.btn-dark` | near-black pill, white circle + dark arrow | accent fill |
| `.btn-outline` | transparent, 1px dark outline, dark label, dark circle + white arrow | dark fill, white label |
| `.btn-light` | white pill for dark backgrounds, accent circle | accent fill, white label |
| `.btn-plain` | **no arrow circle** – Woo-style pill (17px 24px → 50px high; 46px on tablet). Standalone (accent) or combined: `class="btn-dark btn-plain"` | as its colour class |

Modifiers: `.btn-sm` (14px, 32px circle) · `.btn-lg` (18px, 48px circle) · `.btn-block` (full width; label left / circle right,
centred when `.btn-plain`).
Disabled: `disabled` attribute, `.disabled` class or `aria-disabled="true"` → 50 % opacity, `not-allowed`, no hover effect
(`a.disabled` also gets `pointer-events: none`).

Details
* Tablet (≤ 1024px): 14px label, 36px circle, 16px left padding (as the original).
* Hover effects are wrapped in `@media (hover: hover)` and also fire on `:focus-visible`.
* The arrow is a pseudo-element, so `<input type="submit">` cannot show it – use `<button type="submit" class="… btn-plain">`.
* If a button already contains its own `<svg>` / `<i>` (original theme markup) the pseudo arrow is switched off and the
  icon is styled as the circle (`:has(> svg, > i)`).
* Colours come from CSS variables you can override per element: `--btn-bg --btn-color --btn-fill --btn-color-hover --btn-ring
  --btn-circle --btn-arrow --btn-circle-hover --btn-arrow-hover`, sizes `--btn-size --btn-pad --btn-pad-start --btn-gap`.

---------------------------------------------------------------------------------------------------------------------

## 3. Forms – `src/styles/_forms.scss`

```html
<form class="…" (ngSubmit)="…">
  <div class="form-grid">                                   <!-- 2 columns, 1 on mobile (.form-grid-3 = 3) -->
    <div class="form-group">
      <label class="form-label form-label--required" for="first">First name</label>
      <input id="first" class="form-control form-control-lg" placeholder="Enter First Name *" />
      <p class="form-error">Please enter your first name.</p>
    </div>
    …
    <div class="form-group form-col-full"><textarea class="form-control" …></textarea></div>
  </div>
  <label class="form-check"><input type="checkbox" /> <span>Remember me</span></label>
  <button type="submit" class="btn-default btn-plain">Send Message</button>
</form>
```

| Class | Purpose |
|---|---|
| `.form-group` | field wrapper (24px bottom margin) |
| `.form-grid` / `.form-grid-3` / `.form-col-full` | 2 / 3 column grid of groups (1 column on mobile) · a group spanning the whole row |
| `.form-label` (+ `.form-label--required` → "*") | bold 15px label, 10px below |
| `.form-control` | `<input>`, `<select>`, `<textarea>`: 50px (46px mobile), 10px radius, hairline `--color-divider` border, transparent background, 15px `--color-text`; focus = accent border + soft ring. `select.form-control` gets the chevron, `textarea.form-control` is 136px |
| `.form-control-lg` | 56px – the contact form (46px on tablet/mobile) |
| `.form-control-sm` | 40px – coupon field, filters, small inputs |
| `.form-control-soft` | cream pill, 38px, no border – the shop's "Default sorting" `<select>` |
| `.form-check` | checkbox / radio row (custom 20px box, accent when checked). Works with `<label class="form-check"><input …> text</label>` |
| `.form-control-wrap` + `.form-control-icon` | input with an icon button inside (password eye): `<div class="form-control-wrap"><input class="form-control"><button class="form-control-icon">…</button></div>` |
| `.form-inline` | input + button on one row (coupon: `<input class="form-control form-control-sm"> <button class="btn-default btn-plain btn-sm">`) |
| `.is-invalid` / `.is-valid` | red / green border (`.form-control.ng-invalid.ng-touched` is treated as invalid automatically) |
| `.form-error` / `.form-success` / `.form-hint` | 14px message under a field |
| `.form-message` (+ `--success`) | rounded response box under a form (Contact-Form-7 look) |

---------------------------------------------------------------------------------------------------------------------

## 4. `app-page-header`

Inner-page banner: `assets/images/page-header-bg-image.jpg` + 60 % dark overlay, 150px vertical padding (90px ≤ 1024px), centred white
`<h1>` 64px/900 (50px tablet, 36px mobile), optional description, breadcrumb trail (`Home / Shop`).

| Input | Type | Notes |
|---|---|---|
| `title` | `string` (required) | the `<h1>` |
| `crumbs` | `{ label: string; link?: string \| any[] }[]` (default `[]`) | last crumb = current page (no link, `aria-current="page"`); none → no trail |
| `description` | `string?` | white paragraph between title and trail |

```html
<app-page-header title="Bedroom" [crumbs]="[{ label: 'Home', link: '/' }, { label: 'Shop', link: '/shop' }, { label: 'Bedroom' }]" />
```
The type `PageHeaderCrumb` is exported from the component file.

## 5. `app-section-title`

Small outlined pill with an accent dot ("eyebrow") above a big heading (36 / 30 / 24px), optional description as projected content.

| Input | Type | Default |
|---|---|---|
| `eyebrow` | `string?` – the pill (omitted → heading only) | – |
| `title` | `string` (required) | – |
| `align` | `'center' \| 'left'` | `'center'` |
| `tag` | `'h1' \| 'h2' \| 'h3'` – semantics only, identical look | `'h2'` |
| `light` | `boolean` – white text / dark-divider outline for dark backgrounds | `false` |

```html
<app-section-title eyebrow="Shop By Category" title="Explore Furniture Categories" />
<app-section-title eyebrow="Top Rated Product" title="Discover Our Newest Arrivals" align="left">
  <p>Find beautifully crafted furniture …</p>
</app-section-title>
<app-section-title eyebrow="Happy Customer" title="…" [light]="true" />
```
Spacing: 15px between pill, heading and description; the component adds no outer margin – put it in your own section/flex gap.

---------------------------------------------------------------------------------------------------------------------

## 6. Header (`app-header`)

Structure (desktop, 1440px – heights identical to the original: 41.6 + 90 + 56):

1. **Topbar** – dark, "Exclusive Furniture Sale Up To 50% Off" (14px/500, centred).
2. **Main row** (white) – phone box left ("Need Help ? +123 456 789", `tel:` link), logo centre (`assets/images/logo.svg`), icons right:
   search · wishlist (`/wishlist`, badge = `WishlistService.count()`) · account (`/my-account`) · cart (`/cart`, badge = `CartService.count()`).
   Badges only render when the count is > 0.
3. **Nav bar** (cream) – Home · Shop (mega menu) · Collection (dropdown of the 5 categories → `/product-category/:slug`) · My Account ·
   Pages (Cart, Checkout, About Us, Testimonials, FAQs, 404) · Blog · Contact Us. All from `SITE_CONFIG.mainNav`.

Behaviour
* **Menus** open on hover, on keyboard focus (Tab into the item) and on click/tap; close on Escape, on mouse/focus leave and after every
  navigation. On touch devices the first tap on "Shop" opens the mega menu, the second follows the link.
* **Active state** via `routerLinkActive` (Home is `exact`). Parent items (Collection, Pages) highlight when one of their children is
  active; product pages / brand archives keep **Shop** highlighted and blog category/tag archives keep **Blog**
  (`NavLink.alsoActive`).
* **Search**: the search icon opens a blurred full-screen overlay (focus goes into the field, Escape / × / backdrop close it).
  Submitting a non-empty text navigates to **`/shop?search=<text>`** – the shop page reads the `search` query param.
* **≤ 1024px** (the original's ElementsKit "tablet" breakpoint – **not** 991px, see §10): phone box + logo + icons stay in the white row, the
  nav bar disappears and a hamburger (accent square) opens the **off-canvas menu**: full-screen accent panel sliding in from the left
  with the white logo and a close button; sub menus are an accordion (one open at a time); *Shop* expands to the complete mega menu
  content in a white box (same as the original). ≤ 767px hides the phone box (logo left, icons + hamburger right).
  The panel traps the keyboard focus, closes on Escape / navigation / resize to desktop, locks the page scroll while open and gives the
  focus back to the hamburger.
* **Sticky header**: once the static header (+100px, like the theme's `header-sticky` "hide" threshold) has scrolled out of view, a
  **compact bar** (76px desktop: logo · menu · icons; 64px tablet/mobile: logo · icons · hamburger) slides in from the top; it slides out again
  when scrolling back up. While it is visible the static header is `inert`, while it is hidden the compact bar is. The mega menu / dropdowns
  work in the compact bar too.
* **Layout offsets**: the header publishes the compact bar's height as `--header-height` on `<html>` (76px / 64px) and sets
  `scroll-padding-top` to that + 16px, so anchor links and `router` fragment scrolling never end up under the bar. **Sticky sidebars /
  panels should use `top: calc(var(--header-height, 0px) + 20px)`** (the FAQ section already does).

`LayoutService` (`@layout/layout.service`, `providedIn: 'root'`) – only needed if you want to open/close the overlays from code:
`openSearch()` `closeSearch()` `openMobileMenu()` `closeMobileMenu()` `closeAll()` · signals `searchOpen` `mobileMenuOpen` `url`.

## 7. Footer (`app-footer`)

Dark (`--color-primary`), 70px top padding, three rows (50px apart): **social** (Pinterest, X, Facebook, Instagram – round outlined icons,
open the network's site in a new tab) · white **logo** · **"Call 24/7"** phone box; **about text + newsletter** · **Quick Links** ·
**Customer Services** (→ `/policy/:slug`) · **Contact Information** (address, phone, email); **copyright** ("Copyright © 2026 Livora. All
Rights Reserved.") · six **payment icons**. 820px: about + newsletter full width, three link columns; 390px: logo, call, social stacked,
two-column link lists, payment icons above the copyright.

Newsletter: no backend – it validates the address (empty / invalid → red border + message under the field, `aria-invalid`) and on success
clears the field and shows `ToastService.show('Thank you for subscribing! …')`.

## 8. Toasts (`app-toast-container`)

Same logic as before (renders `ToastService.toasts()`, dismiss button, the action link dismisses the toast). New look: fixed bottom-right
(full width with 15px margin on mobile), dark rounded card, coloured left edge and round icon per type (`success` accent ✓ · `info` white i ·
`error` red !), accent underlined action link, slide-in animation. `role="status"` (`role="alert"` for errors).

## 9. `SITE_CONFIG` (`core/data/site.data.ts`) and model additions

`SITE_CONFIG: SiteConfig` – name, topbar message, `contact` (footer values: address `245 Modern Avenue, Manhattan, New York, USA`, phone
`+91 12345 6789`, email `support@domain.com`, hours), logo paths, `social`, `paymentIcons` (`icon-payment-options-1..6.svg`), `mainNav`, `footer`.
Note: the original's header phone (`+123 456 789`) differs from the footer phone – it lives in `SITE_CONFIG.header`.
The contact *page* has its own address/phone/email wording (`… USA - 00258`, `+91 123 456 789`, `info@dominname.com`) – copy it from the original.

Additive optional fields added to `site.model.ts`: `NavLink.alsoActive`, `MegaMenu.promo.image`, `SiteConfig.header` (`helpLabel`, `helpPhone`,
`helpPhoneHref`, `searchPlaceholder`), `SiteConfig.footer.{quickLinksTitle, customerServicesTitle, contactTitle, callLabel,
newsletterPlaceholder, newsletterButtonLabel, copyrightYear}`.

Shop mega menu: "Shop By Collection" (Bedroom, Living Room, Dining Room, Office Furniture, Luxury Collection), "Shop Features" (Leather
Recliner, Storage Cabinet, Wooden Cabinet, Wooden Cupboard, **Lounge Chair** – the original's 5th entry "Natural Oak Side Table" is not in
the reduced catalog), tiles "Modern Furniture" (→ Living Room) and "Luxury Interior" (→ Luxury Collection), promo "-special offer- BIG SALE
50% Off" (→ `/shop`). The tile text "Stylish furniture crafte for comfortable living spaces." keeps the original's typo.

---------------------------------------------------------------------------------------------------------------------

## 10. Decisions / deviations from the brief

* **Menu collapse at ≤ 1024px, not 991px** – the original's nav-menu widget (`ekit_menu_responsive_tablet`) collapses at 1024px (verified at
  1000px in the mirror); a 991px breakpoint would show the desktop menu where the original shows the hamburger.
* **Sticky = a separate compact bar** (not the whole header turning `position: fixed`): no layout jump, no measuring, no transformed ancestor
  around the menus, and a much slimmer bar (76px instead of 146px). The trade-off is a second instance of the menu/icons in the DOM (the hidden
  one is `inert`).
* **Off-canvas shows the white logo** in its top-left corner (the original panel has only the close button).
* Header/footer content is aligned to the global `.container` (85px at 1440px) instead of the original's 80px.
* Desktop dropdown panels have no shadow (like the original); the mega panel has a faint bottom shadow so it separates from light pages;
  the chevron of an open item flips.
* Search overlay backdrop is dark (72 %) instead of the original's 10 % wash – the original's white text is unreadable on light pages.
* Footer social links point to the networks' home pages (original: `#`).
* Tile links of the mega menu (`Modern Furniture`, `Luxury Interior`, promo) go to shop pages; the original tiles are not links.
* After a navigation to a *different path* the keyboard focus moves to `#content` (so it is not lost in a menu that just closed); query-param-only
  navigations (filters, pagination) never steal the focus.

## 11. Known gaps

* No "mini cart" dropdown – the cart icon links to `/cart` (the original has none either).
* The Elementor "position-aware" circle hover of the hero button is approximated by the left-to-right sweep used by `.btn-default`.
* Mega menu at 1025–1200px is cramped (titles wrap) – same behaviour as the original.
* Arrow-key navigation inside dropdowns is not implemented (Tab / Enter / Escape work).

## 12. Verifying

```
node tools/shot.mjs http://localhost:4201/lab/shell shots/shell/lab.png --width=1440 --full --slice=1100
node tools/shot.mjs http://localhost:8090/index.html shots/shell/orig-top.png --orig --width=1440 --height=900
```
Header/footer are on every route; `/lab/shell` shows the page header, section titles, every button and form variant and toast triggers.
