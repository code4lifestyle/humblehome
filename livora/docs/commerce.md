# Commerce – cart, checkout, order received, wishlist, my account, `AuthService`, `OrderService`

Owner: **commerce agent**. The shopping flow of the site: `/cart` → `/checkout` (→ "order received" at the same URL), `/wishlist`, and
`/my-account` (login / sign up / dashboard) + `/my-account/lost-password`. Everything is standalone, OnPush, zoneless-safe (all async
state is a signal) and uses the shell's global `.btn-*` / `.form-*` styles, `app-page-header`, `app-section-title`,
`app-product-card`, `app-quantity-input` and the catalog / cart / wishlist / toast services – nothing shared was edited.

> **There is no backend.** Cart, wishlist, orders and "accounts" live in the browser's `localStorage` / `sessionStorage`.
> `AuthService` is a **MOCK** (see §5) – never treat it as security.

## 1. Files

| File | What |
|---|---|
| `src/app/pages/cart/cart.component.{ts,html,scss}` | `CartComponent` (`app-cart-page`) – `/cart` |
| `src/app/pages/checkout/checkout.component.{ts,html,scss}` | `CheckoutComponent` (`app-checkout-page`) – `/checkout` (form **and** order-received view) |
| `src/app/pages/checkout/checkout.data.ts` | `PAYMENT_METHODS` (3), `COUNTRIES` (30) |
| `src/app/pages/checkout/order-summary/*` | `OrderSummaryComponent` (`app-order-summary`) – the WooCommerce "Product / Subtotal" table, used by checkout **and** order received |
| `src/app/pages/checkout/order-received/*` | `OrderReceivedComponent` (`app-order-received`) – the thank-you view |
| `src/app/pages/wishlist/wishlist.component.{ts,html,scss}` | `WishlistComponent` (`app-wishlist-page`) – `/wishlist` |
| `src/app/pages/account/account.component.{ts,html,scss}` | `AccountComponent` (`app-account-page`) – `/my-account` and `/my-account/lost-password` |
| `src/app/core/services/order.service.ts` | `OrderService` |
| `src/app/core/services/auth.service.ts` | `AuthService` (demo only) |
| `src/app/core/models/order.model.ts` · `auth.model.ts` | `Order`, `OrderItem`, `OrderAddress`, `OrderBilling`, `NewOrder`, `PaymentMethodId`, `OrderStatus` · `AuthUser`, `AuthResult`, `AuthErrorField` (both re-exported from `core/models/index.ts`) |

## 2. Pages

### `/cart` – `CartComponent`
* **Empty** – mirrors `cart/index.html`: banner h1 "Nothing In Here!", crumbs *Home / Cart*, `empty-cart-img.png` (370 / 250 / 150 px), h3 "Your cart is
  empty!", "The page you are looking for does not exist" (sic), **Back To Shop** → `/shop`. Cream section, 100px padding (as measured on the original).
* **With items** (not mirrored, theme style) – banner h1 "Cart"; card with a table *Product* (thumbnail `imageVariant(…,'300x300')`, name → `/product/:slug`, variation
  label) · *Price* (struck-through regular price when discounted) · *Quantity* (`app-quantity-input`, applied instantly through `CartService.setQuantity`) ·
  *Subtotal* · × remove. Below: coupon form (`CartService.applyCoupon`; inline error / success message in a live region; the demo codes
  `LIVORA10 · WELCOME15 · SAVE20` are one-click chips that fill the field), **Clear cart**. Right: *Cart totals* card (Subtotal, `Coupon: CODE −$x [Remove]`,
  Shipping "Flat rate: $15.00" / "Free shipping", Total) with **Proceed to checkout** → `/checkout` and **Continue shopping** → `/shop`.
  "You may be interested in…" (4 × `app-product-card`: `related()` of the cart products, then featured / best sellers, never a product already in the cart).
* Layout by width: ≥ 1280px table + coupon on the left and a sticky totals card on the right; 1025–1279px table full width, coupon left / totals right below it; ≤ 1024px one column (the table needs ≈ 760px, so it never gets squeezed).
* ≤ 767px the table turns into one stacked card per product (`td[data-label]::before`; ARIA table roles are set so the semantics survive `display: block`).
* Removing a row / clearing the cart shows a toast and moves the keyboard focus to the next remove button / the empty-state heading.

### `/checkout` – `CheckoutComponent`
Three states, computed from `CartService.isEmpty()` and the "just placed" order:

| Cart | Recent order | Result |
|---|---|---|
| items | – | **form** (banner "Checkout") |
| empty | yes (`OrderService.recent()`: the last order, placed < 1 h ago, or the one placed in this session) | **order received** view (banner "Order Received", crumbs *Home / Checkout / Order received*, document title "Order Received – Livora") |
| empty | no | redirect to `/cart` (`replaceUrl`, so *Back* does not bounce) |

* **Form** – two columns (stacked ≤ 1024px). *Billing details*: first / last name*, company (optional), country/region* (select, default United States), street address* + apartment (optional), town / city*,
  state / county*, postcode / ZIP*, phone*, email*; **"Ship to a different address?"** reveals the same fields for shipping (its `FormGroup` is `disable()`d otherwise, so it is neither validated nor submitted);
  order notes (optional). *Your order* (sticky card): `app-order-summary` (rows × qty, subtotal, coupon, shipping, total), payment methods as radios
  (**Direct bank transfer**, **Cash on delivery**, **Credit / debit card (demo)**, the description of the selected one is shown), privacy text, terms checkbox (→ `/policy/terms-conditions`) and **Place order**.
* **Validation** – Reactive Forms, custom trimming validators (`"   "` is empty), format checks for email / phone (7–15 digits) / postcode. Errors appear under a field once it was touched or after a submit
  attempt (`.form-error`, `aria-invalid`, `aria-describedby`); a failed submit focuses the first invalid field and shows "Please review the highlighted fields and try again." next to the button.
  A signed-in user gets email + name prefilled.
* **Place order** → `OrderService.place()` (snapshot of the cart incl. coupon / shipping / total, stored, cart cleared) → the view switches to *received*: success notice "Thank you. Your order has been received." (focused for screen readers),
  overview strip (order number `LV-10460`, date, email, total, payment method), payment instructions (bank transfer names the order number), *Order details* table (product links, subtotal, coupon,
  shipping, payment method, total), *Billing address* (+ phone / email), *Shipping address* and *Order notes* cards when given, **Continue Shopping** → `/shop`, **My Account** → `/my-account`.
  The page scrolls to the top; a second click on "Place order" cannot create a second order.
* Reloading `/checkout` after an order (empty cart) shows the received view again – the order is in `localStorage`.

### `/wishlist` – `WishlistComponent`
Banner "Wishlist" (*Home / Wishlist*). Toolbar "n products in your wishlist" (live region) + **Add all to cart** + **Clear wishlist**. 3-column grid (same breakpoints as the shop grid: 3 columns down to 769px, 2 columns ≤ 768px) of `app-product-card` (`ProductService.byIds(wishlist.ids())` – unknown ids are ignored),
each with a round **×** remove button on the image and an **Add to cart** (simple) / **Select options** (variable → `/product/:slug`) button underneath. **Add all to cart** adds the simple products only, replaces the per-product toasts of
`CartService.add()` by one summary toast ("3 products have been added to your cart" + *View cart*) and shows an info toast naming the variable products that were skipped ("… have options to choose and were not added: …"). Removing focuses the next remove button.
Empty: cream section with a heart icon, h2 "Your wishlist is empty", "Tap the heart on any product to save it here for later." and **Back To Shop**.

### `/my-account` and `/my-account/lost-password` – `AccountComponent`
One component, `view = input<'auth' | 'lost-password'>('auth')` bound from the route data.
* **auth, signed out** – banner "Login & Sign Up" (*Home / My account*); two columns (48 % / 52 %, right one 70px inset – measured on the original): *Login your account* (username or email\*, password\* with show/hide eye, Remember me, **Log in**,
  "Lost your password?" → `/my-account/lost-password`) and *Sign up your account* (email\*, password\* with eye, privacy note linking to `['/policy','privacy-policy']`, full-width **Register**). All texts are copied from the original;
  spacing / sizes match it at 1440 / 820 / 390 (46px fields and 20px row gaps ≤ 1024px, 14px labels on phones).
* **auth, signed in** – banner "My Account"; nav card (Dashboard · Wishlist n · Cart n · Shop · Log out, theme icons), "Hello *Jane Doe*", three quick-link tiles (Wishlist, Cart, Shop with counts), **Recent order** card
  (`OrderService.last()`: number, date, status pill, total, lines, payment, ship-to city – or "You have not placed an order yet." + Browse Products) and **Log out**.
* **lost-password** – banner "Forgot Password"; 860px column: "Forgot your password", the original text, *Username or email*, **Reset Password**. There is no mail server: an empty field shows "Enter a username or email address.", otherwise
  the toast **"A password reset link has been sent to your email (demo)"** appears, the field is cleared and "Password reset email has been sent." is shown. A small "Back to login" link was added. The WooCommerce notice that the mirror happens to show above the form
  ("Wooden Dining Chair has been added to your cart") is a transient page state and is not reproduced.

## 3. Storage keys

| Key | Where | Written by | Content |
|---|---|---|---|
| `livora.cart.v1` | localStorage | `CartService` | `CartItem[]` (the applied coupon is **not** persisted – it lives in memory only) |
| `livora.wishlist.v1` | localStorage | `WishlistService` | product ids |
| `livora.orders.v1` | localStorage | `OrderService` | `Order[]`, newest first, max 20 |
| `livora.auth.accounts.v1` | localStorage | `AuthService` | `{ id, email, username, name, salt, hash, createdAt }[]` |
| `livora.auth.session.v1` | sessionStorage (default) or localStorage (**Remember me** ticked at login) | `AuthService` | `{ userId }` |

All reads go through `readStorage()` / validate their shape (corrupt or foreign JSON is ignored, nothing throws).

## 4. `OrderService` (`@core/services/order.service`)

```ts
readonly orders: Signal<Order[]>;       // newest first
readonly last: Signal<Order | null>;    // orders()[0]
place(details: NewOrder): Order | null; // snapshots CartService (items, subtotal, discount, coupon, shipping, total), stores the order, clears the cart.
                                        // returns null (does nothing) when the cart is empty. Storage is written synchronously.
byId(id: string): Order | undefined;    // 'LV-10460' (case-insensitive)
recent(now = Date.now()): Order | null; // last order if it was placed less than 1 hour ago (what /checkout shows after a reload)
```
`NewOrder = { billing: OrderBilling; shippingAddress?: OrderAddress; notes?: string; payment: { id: 'bacs' | 'cod' | 'card'; title: string } }`.
Order ids are `LV-` + number, the first is **LV-10460** and every new one is `max(existing) + 1`. `status` is `on-hold` for bank transfer, `processing` otherwise.
An `Order` is a full snapshot (`items[]` with name, image, unit / regular price, variation label, line total; totals; addresses; notes; payment) – later catalog or price changes never touch it.

## 5. `AuthService` (`@core/services/auth.service`) – **demo only**

```ts
readonly user: Signal<AuthUser | null>;    // { id, email, username, name, createdAt } – never any password data
readonly isLoggedIn: Signal<boolean>;
register({ email, password }): Promise<AuthResult>;                   // creates the account AND signs it in (session-only)
login({ identifier, password, remember? }): Promise<AuthResult>;      // identifier = email or username (= the email's local part)
logout(): void;
// AuthResult = { ok: true; user } | { ok: false; error: string; field?: 'email' | 'identifier' | 'password' }
```
* **This is a mock.** No server, no real sessions. Accounts are stored in this browser's localStorage, so anyone with access to the browser / devtools can read, change or delete them, and
  nothing prevents editing `livora.auth.session.v1` to "sign in" as somebody else. Passwords are **never stored in clear text**: each account keeps a random 16-byte salt and `SHA-256(salt + password)`
  (`crypto.subtle` in secure contexts, a small pure-JS SHA-256 – verified against Node's crypto – on plain-http LAN testing). That is still far from production-grade (single fast hash, client side): replace the service with a real backend before going live.
* Rules / messages (WooCommerce wording): valid email required ("Please provide a valid email address."), password ≥ 6 characters, duplicate email (case-insensitive) → "An account is already registered with your email address. Please log in.",
  unknown user → "Unknown username or email address. Check again or try your email address.", wrong password → "The password you entered for … is incorrect.", empty fields → "Username is required." / "The password field is empty.".
* The display name is derived from the username (`jane.doe@x.com` → "Jane Doe"). "Remember me" decides where the session lives: unticked = `sessionStorage` (gone when the tab closes), ticked = `localStorage`.
  A session that points to a deleted account counts as signed out.

## 6. Components

| Selector | Inputs | Notes |
|---|---|---|
| `app-order-summary` | `lines: OrderSummaryLine[]` (`{ key, name, slug, image?, quantity, lineTotal, variation? }`), `subtotal`, `discount = 0`, `couponCode?`, `shipping`, `total`, `paymentTitle?`, `linkProducts = false`, `showImages = true` | table with `Subtotal`, `Coupon: CODE`, `Shipping` ("Flat rate: $15.00" / "Free shipping"), optional `Payment method`, `Total` |
| `app-order-received` | `order: Order` (required) | focuses its notice on creation; used by `CheckoutComponent`, could be reused for an order page |

## 7. Decisions / deviations from the brief

* **"Just placed" = the last order younger than 1 hour** (`OrderService.recent()`), so `/checkout` with an empty cart redirects to `/cart` again the next day, while a reload right after the purchase still shows the confirmation.
* **State / County is required for every country** and the country list has 30 entries (demo). No tax, one currency (USD via `CurrencyPipe`).
* **"Add all to cart" is always shown** (also when every saved product is variable – then it only shows the hint), because the brief asks for the "skipped with a toast hint" behaviour.
* The wishlist grid is 3 columns as briefed; the card image is the 300px variant, so it is scaled ≈ 1.35× at 1440 (see gaps).
* Password fields of **both** forms have the show/hide eye (the mirror only shows it on the register field).
* The dashboard, checkout, order received, cart-with-items and wishlist are not mirrored by the original, so they were designed with the theme's tokens (20px radius cards on cream, pill buttons, section rhythm 90 / 40px).
* Side insets come from the global `.container` (max 1320px, 20px gutters → content x = 80 at 1440px, 43 at 1366px, 20px below ≈ 1320px – the original's values); the account page's two-column box is the original's 1300px Elementor box (`margin-inline: -10px` + 10px column padding), so its content lines up with the global container at every width.

## 8. Verification (done)

* **Screenshots** (`shots/commerce/`): originals `orig-account|cart|lost-*` (1440 = `-N.png`, plus `-820-N` / `-390-N`) next to mine `account|cart-empty|lost-{1440,820,390}-N.png`; the pages that have no mirror
  (`cart-items`, `checkout`, `checkout-errors`, `received`, `wish-items`, `wish-empty`, `dash`) exist at the same three widths. Numeric comparison against the original (Playwright, boxes of headings / fields / buttons) at 820 / 1100 / 1366 / 1440 / 1700px:
  account page x / width identical, y within 1px, page height 1977 vs 1979 (1440), 2446 vs 2448 (390); empty cart image / texts / button at the same y, page height 1966 vs 1966 (the +10px at 820 is the shell footer, not the page).
* **Playwright** (throw-away scripts, 298 checks, all green, incl. the pure-JS SHA-256 fallback with `crypto.subtle` removed): cart (empty state texts / link, quantity + / − / typing, totals math, coupons incl. errors, remove, clear, keyboard, no overflow), checkout (redirect, every validation branch,
  shipping toggle, whitespace, double click, order snapshot, numbering LV-10460 → LV-10461, coupon + bank transfer, reload persistence, stale-order redirect, keyboard, prefill), wishlist (empty / items, add, remove, add-all with summary toast, clear, stale ids, keyboard),
  account (all original texts, eye toggles, every register / login error, hashed storage, reload, logout, remember-me across browser sessions, dashboard data, lost password, corrupted storage) and a complete client-side journey
  *register → wishlist → add all → cart → coupon → checkout → received → dashboard*. No console errors / warnings, no horizontal overflow at 1440 / 820 / 390.
* **Overflow scan** (throw-away script): every state of my pages (empty / filled / errors / received / dashboard) at 320, 360, 390, 480, 600, 767, 768, 820, 1024, 1025, 1100, 1279, 1280, 1320, 1366, 1440px – no element sticks out and `body.scrollWidth <= viewport`
  (the cart table is checked separately for clipped columns at 19 widths, with 99 units of one product to force a 4-digit subtotal). The same scan over 27 routes of the whole site at 390 / 820: clean.
* `ng build` (development and production) green, no budget warnings.

## 9. Known gaps / requests

* `CartService` does not persist the **coupon** (a reload on `/checkout` drops it) – suggest storing `AppliedCoupon` next to the items. `CartService.add()` always shows its own toast (worked around in "Add all to cart" by dismissing the toasts it created).
* `app-product-card` always uses the `-300x300` image; a wide layout (wishlist at 1440) would look crisper with `-600x600` (e.g. a `size` input or `srcset`).
* Orders and accounts are per browser: the dashboard shows the last order stored in this browser regardless of who placed it, and there is no order-history list (only `OrderService.orders()` holds up to 20).
* Password reset only shows the confirmation (no mail); sessions are not synchronised between tabs; no password strength meter.
* Checkout has no "Have a coupon?" / "Returning customer?" rows (the coupon is entered on the cart page).

### Finding outside my files (not changed)
* **`html, body { overflow-x: clip }` (`_base.scss`) makes `document.documentElement.scrollWidth` blind**: a 2000px wide element leaves it at the viewport width, only `document.body.scrollWidth` grows.
  `tools/check-links.mjs` (and any check based on `documentElement.scrollWidth`) therefore never reports horizontal overflow – use `Math.max(body.scrollWidth, documentElement.scrollWidth) - innerWidth`.
