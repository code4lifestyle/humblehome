# Catalog – products, categories, brands, `ProductService`

Owner: **catalog agent**. Everything the shop, product page, home page, wishlist, cart and header search need to know
about products lives here. Pages and components must go through `ProductService` (never import the data arrays).

## 1. Files

| File | What |
|---|---|
| `src/app/core/data/products.data.ts` | `PRODUCTS: Product[]` – the 12 products, plus `PRODUCT_SLUG_ALIASES` (old WordPress slugs) |
| `src/app/core/data/categories.data.ts` | `PRODUCT_CATEGORIES: ProductCategory[]` – 5 categories |
| `src/app/core/data/brands.data.ts` | `BRANDS: Brand[]` – 5 brands |
| `src/app/core/services/product.service.ts` | `ProductService` (`providedIn: 'root'`, synchronous, pure) |
| `src/app/core/models/product.model.ts` | additive only: `Product.brands?`, `ProductAttribute.swatches?`, `ProductReview.verified?` |
| `src/app/pages/lab/lab-catalog.component.ts` | sandbox page `/lab/catalog` (table of all data + a `query()` playground) – **delete at integration** |

## 2. The data

### 2.1 Where it comes from

Extracted programmatically (throw-away Python/BeautifulSoup script, not in the repo) from the original mirror:

* `product/<original-slug>/index.html` – title (h1), short description, Description tab, gallery, `Category:` / `Brand:`
  / `SKU:` meta, Additional-information table, reviews, the `data-product_variations` JSON of the variation form and the
  colour swatch buttons;
* `shop/index.html`, `shop/page/2`, `shop/page/3` (loop cards: title, rating, review count, price, `product_cat-*`
  classes) and `product-category/*`, `brand/*` archive pages – used as an independent cross-check. Categories and
  brands are **not** taken from the mega menu that every page carries.

Text is verbatim, including the original's quirks: bullets that run a short label and its sentence together
(`Space-Friendly Design Optimized dimensions suitable for…`), the typo *"making it a perfect for your living room"*,
curly quotes in the review of Contemporary Leather Sofa, and the "leather" review on the velvet sofa.

### 2.2 Field decisions

| Field | Decision |
|---|---|
| `id` | original WooCommerce product id (variation ids are the original variation ids) |
| `slug` | kebab-case of the displayed name. Three products were renamed – their old WordPress slug still resolves through `bySlug()` (see `PRODUCT_SLUG_ALIASES`) |
| `name` | h1 of the original page, e.g. slug `modern-wooden-table` = original page `modern-linen-fabric-sofa`, which is titled "Modern Wooden Table" |
| `excerpt`, `highlights` | the single `<p>` and the `<ul>` of the WooCommerce short description |
| `description`, `features` | paragraphs and bullets of the Description tab (its `<h2>Description</h2>` is not stored) |
| `images` | gallery in original order, **base** file names (`assets/images/product-image-N.jpg`), de-duplicated (the page repeats the gallery inside a `<template>`). `-300x300` and `-600x600` variants of every one exist (verified); use `imageVariant()` |
| `categories` | from the product's own `Category:` meta, in the original's alphabetical order (matches the shop list cards: *Dining Room, Living Room, Office Furniture*) |
| `brand`, `brands` | **three products carry two brands** in the original (`Brand: Livora Home, Nordic Living`) and the original brand archives list them under both. `brands` (new optional field, always filled) holds all of them in meta order, `brand === brands[0]`. Filtering, counts and search use `brands`; when *displaying* brands use `productService.brandsOf(p)` or `p.brands ?? [p.brand]` |
| `price`, `salePrice` | simple products: regular price and sale price from the price markup. **Variable products**: no `salePrice`; `price` = lowest *regular* variation price (same as `regularPrice()` in `product.utils`). Always derive display/charge prices with the utils (`priceRange`, `currentPrice`, `isOnSale`, …) |
| `attributes` | variable products have exactly one attribute `Color` / `color`; `options` in the original `<select>` order; `swatches` = colour of each original swatch button (`Accent #b08d57`, `Black #161616`, `Gray #e4e3e3`, `Light #ddcfb9`, `Pink #f1a9a9`) |
| `variations` | one per option (sorted like the options). `attributes: { color: 'Black' }` – the option **label**, not the WooCommerce slug – so `findVariation()` / `CartService` work as is. `image` = the product's main image (as in the original), `sku` only where the original has one, `inStock: true` for all |
| `sku` | omitted when the original prints "N/A" (only *Premium Relax Accent Chair* has one: `Relax Chair`) |
| `rating`, `reviewCount`, `reviews` | reviews are the original ones (14 in total; author `awaiken` except one `vishva Awaiken`). `reviewCount = reviews.length`, `rating` = mean (2 decimals). Both match the original stars and the "(n)" counts. `date` is a calendar date (`2026-06-27`; `DatePipe` shows it without timezone shifts). `verified: true` on the one review the original marks "verified owner". `avatar` is omitted (the original uses external Gravatar "mystery man" images – render a neutral icon) |
| `tags` | none of the 12 products has tags → omitted |

### 2.3 Derived values (not exposed by the original – deterministic, documented)

Products sorted by **ascending original product id** get a position `i = 0…11`
(9857, 9879, 9880, 9882, 9886, 9975, 9977, 10008, 10035, 10037, 10039, 17595):

* `createdAt = 2026-06-01T10:00:00Z + 2 days × i` → 1 June … 23 June 2026 (the upload month of the original, all before the
  27 June reviews). "Sort by latest" therefore equals "highest original id first"; the newest product is
  *Wooden Coffee Table*.
* `popularity = reviewCount × 100 + round(rating × 40) + i` → 261 … 384, no ties. The position `i` only breaks ties
  inside a (reviewCount, rating) group; the last-created product wins, exactly like WooCommerce's own
  `total_sales DESC, id DESC` fallback. Best seller = *Premium Relax Accent Chair* (384), then *Luxury Tufted Velvet
  Sofa* (362).
* `featured: true` = the four products of the original home page block "Top Rated Product / Discover Our Newest
  Arrivals": Modern Wooden Table, Scandinavian Wooden Table, Luxury Tufted Velvet Sofa, Wooden Dining Chair.

### 2.4 The 12 products

Alphabetical (= `all()` / "Default sorting"). Price: `$a → $b` = regular → sale, `$a – $b` = range of effective prices.

| # | ID | Slug (original slug) | Name | Categories | Brand(s) | Price | Var. | Rating (reviews) | Popularity | createdAt | Featured |
|--:|--:|---|---|---|---|---|--:|---|--:|---|:-:|
| 1 | 9975 | `contemporary-leather-sofa` | Contemporary Leather Sofa | Luxury Collection, Office Furniture | Livora Home | $99 → $89 | – | 5 (1) | 305 | 2026-06-11 |  |
| 2 | 9977 | `leather-recliner` | Leather Recliner | Luxury Collection | WoodCraft Studio | $59 → $49 | 5 | 5 (1) | 306 | 2026-06-13 |  |
| 3 | 10037 | `lounge-chair` | Lounge Chair | Luxury Collection | Elite Comfort, Nordic Living | $49 → $39 | – | 4 (1) | 269 | 2026-06-19 |  |
| 4 | 9880 | `luxury-tufted-velvet-sofa` | Luxury Tufted Velvet Sofa | Dining Room, Living Room, Office Furniture | Elite Comfort | $49 | 3 | 4 (2) | 362 | 2026-06-05 | yes |
| 5 | 9857 | `modern-wooden-table` (was `modern-linen-fabric-sofa`) | Modern Wooden Table | Living Room | WoodCraft Studio | $79 → $69 | – | 5 (1) | 300 | 2026-06-01 | yes |
| 6 | 9886 | `premium-relax-accent-chair` | Premium Relax Accent Chair | Luxury Collection | UrbanNest | $39 – $59 | 5 | 4.5 (2) | 384 | 2026-06-09 |  |
| 7 | 9879 | `scandinavian-wooden-table` | Scandinavian Wooden Table | Living Room | Nordic Living | $79 → $69 | 3 | 4 (1) | 261 | 2026-06-03 | yes |
| 8 | 10039 | `storage-cabinet` | Storage Cabinet | Bedroom | Livora Home, Nordic Living | $79 → $69 | 5 | 5 (1) | 310 | 2026-06-21 |  |
| 9 | 10035 | `wooden-cabinet` (was `multi-purpose-shelf`) | Wooden Cabinet | Living Room | Livora Home, Nordic Living | $69 | 3 | 4 (1) | 268 | 2026-06-17 |  |
| 10 | 17595 | `wooden-coffee-table` (was `wooden-coffee-table-2`) | Wooden Coffee Table | Dining Room | UrbanNest | $40 | – | 5 (1) | 311 | 2026-06-23 |  |
| 11 | 10008 | `wooden-cupboard` | Wooden Cupboard | Bedroom | Livora Home | $30 – $49 | 5 | 4 (1) | 267 | 2026-06-15 |  |
| 12 | 9882 | `wooden-dining-chair` | Wooden Dining Chair | Dining Room | Nordic Living | $69 → $59 | – | 4 (1) | 263 | 2026-06-07 | yes |

Products per category: Bedroom 2 · Dining Room 3 · Living Room 4 · Luxury Collection 4 · Office Furniture 2.
Products per brand: Elite Comfort 2 · Livora Home 4 · Nordic Living 5 · UrbanNest 2 · WoodCraft Studio 2.

### 2.5 Categories and brands

| Slug | Name | Products | Image |
|---|---|--:|---|
| `bedroom` | Bedroom | 2 | `assets/images/category-item-image-2.jpg` |
| `dining-room` | Dining Room | 3 | `assets/images/category-item-image-3.jpg` |
| `living-room` | Living Room | 4 | `assets/images/category-item-image-1.jpg` |
| `luxury-collection` | Luxury Collection | 4 | `assets/images/best-seller-img-4.jpg` |
| `office-furniture` | Office Furniture | 2 | `assets/images/category-item-image-4.jpg` |

Images: the original home page "Shop By Category" tiles are `category-item-image-1` Living Room, `-2` Bedroom, `-3` Dining
Room, `-4` Office, `-5` Outdoor, `-6` Home Storage, `-7` Kitchen (180×180). The four matching ones are reused. *Luxury
Collection* has no tile in the original, so it uses the brown Chesterfield leather sofa photo `best-seller-img-4.jpg`
(620×588) – the closest match for its leather/premium products. The original category pages have no description text,
so `description` is not set.

| Slug | Name | Products |
|---|---|--:|
| `elite-comfort` | Elite Comfort | 2 |
| `livora-home` | Livora Home | 4 |
| `nordic-living` | Nordic Living | 5 |
| `urbannest` | UrbanNest | 2 |
| `woodcraft-studio` | WoodCraft Studio | 2 |

The original brand archives have no description or logo (the `logo-brand-*.png` files are unrelated third-party logos:
IKEA, Pepperfry …), so `description` / `logo` are not set. Categories and brands are stored alphabetically – the order
of the original shop sidebar filters.

## 3. `ProductService`

```ts
import { ProductService } from '@core/services/product.service';
private readonly catalog = inject(ProductService);
```

Everything is synchronous and pure; lookup maps are built once. **Arrays are returned as copies** (safe to `sort()`),
the `Product` objects are shared – treat them as read-only.

### 3.1 API

| Method | Returns / semantics |
|---|---|
| `all()` | all 12 products, alphabetical by name (case/accent-insensitive) = the original "Default sorting" |
| `bySlug(slug)` | product or `undefined`. Case-insensitive, trims, and also resolves the old slugs `modern-linen-fabric-sofa`, `multi-purpose-shelf`, `wooden-coffee-table-2` |
| `byId(id)` | product or `undefined` (numeric strings are accepted) |
| `byIds(ids)` | products in the order of `ids`; unknown ids skipped, duplicates collapsed (wishlist / cart) |
| `categories()` | the 5 categories (alphabetical) with `count` = number of products |
| `categoryBySlug(slug)` | `ProductCategory` or `undefined` (case-insensitive) |
| `brands()` | the 5 brands (alphabetical) with `count` (a two-brand product counts for both) |
| `brandBySlug(slug)` | `Brand` or `undefined` |
| `query(q)` | `Paginated<Product>` – see 3.2 |
| `related(product, limit = 3)` | never the product itself; most shared categories first, then most shared brands, then the rest; ties keep A→Z order |
| `featured(limit?)` | products with `featured: true`, in the original home-page order (ascending original id): Modern Wooden Table, Scandinavian Wooden Table, Luxury Tufted Velvet Sofa, Wooden Dining Chair |
| `latest(limit?)` | by `createdAt` descending |
| `topRated(limit?)` | rating descending, then review count, then A→Z |
| `bestSellers(limit?)` | by `popularity` descending |
| `priceBounds()` | `{ min: 30, max: 89 }` – floor(lowest effective price) … ceil(highest effective price), for the price filter |
| `ratingCounts()` | `{ 1: 0, 2: 0, 3: 0, 4: 6, 5: 6 }` – products per **rounded** average rating (4.5 counts as 5) |
| `categoriesOf(product)` | *(extra)* the product's `ProductCategory` objects in its own order – for "Category: …" links |
| `brandsOf(product)` | *(extra)* the product's `Brand` objects (one or two) |

`limit`: omitted / `NaN` = everything, `Infinity` = everything, negative = nothing, fractions are floored.

### 3.2 `query(q: ProductQuery)`

All fields optional; steps run in this order: **filter → sort → paginate**.

| Field | Rule |
|---|---|
| `category` | slugs, **OR** inside the list; a single string is tolerated; unknown slug ⇒ no results; empty list ⇒ no filter |
| `brand` | slugs, **OR** inside the list; a product with two brands matches either. Category and brand filters are **AND**ed |
| `minPrice`, `maxPrice` | inclusive, tested against the product's *effective* price range (`priceBounds()` from `product.utils`): a variable product matches when `[lowest, highest] ∩ [minPrice, maxPrice] ≠ ∅` (Wooden Cupboard $30–$49 matches `minPrice: 45`) |
| `minRating` | rounded average rating ≥ n (`Math.round(4.5) = 5`) |
| `search` | case- and accent-insensitive; whitespace-separated terms are **ANDed**; each term must **start a word** in *name + excerpt + category names + brand names*. `wood` finds "Wooden" and "WoodCraft", `decor` finds "décor", but `table` does **not** match "comfortable"/"stable". Blank = no filter |
| `orderby` | `default` (A→Z) · `popularity` · `rating` · `latest` · `price-asc` · `price-desc` · `title-asc` · `title-desc`. Price sorts use the **lowest effective price** (`currentPrice`). Every tie keeps the alphabetical order (stable sort). The original select values `menu_order`, `date`, `price`, `title` are accepted as aliases; unknown values fall back to `default` |
| `perPage` | default **9**; integers ≥ 1 (anything else ⇒ 9); `Infinity` = one page with everything |
| `page` | 1-based, floored, **clamped** to `1…pages` (NaN, 0, negatives ⇒ 1; too large ⇒ last page) |

Result: `{ items, total, page, perPage, pages }` with `pages >= 1` **even when nothing matches** (`total: 0`, `page: 1`,
`pages: 1`, `items: []`), so `1 <= page <= pages` always holds. `page`/`perPage` in the result are the effective
(clamped) values – bind the pagination component to them.

### 3.3 Examples

```ts
const shop = this.catalog.query({ category: ['bedroom', 'office-furniture'], orderby: 'price-asc', page: 1 });
shop.items;   // Wooden Cupboard ($30), Luxury Tufted Velvet Sofa, Storage Cabinet, Contemporary Leather Sofa ($89)
shop.total;   // 4
shop.pages;   // 1

this.catalog.query({ brand: ['nordic-living'], minRating: 5 }).items;      // [Storage Cabinet]
this.catalog.query({ search: 'wooden table' }).items;                       // Modern / Scandinavian Wooden Table, Wooden Coffee Table
this.catalog.query({ minPrice: 35, maxPrice: 45, orderby: 'rating' }).total; // 4 (ranges overlap for variable products)
this.catalog.query({ page: 99 }).page;                                      // 2 (clamped: 12 products / 9 per page)

this.catalog.bySlug(slug)?.name;                 // product page; undefined ⇒ redirect to /404
this.catalog.categoryBySlug(slug)?.name;         // shop page in "category" mode; undefined ⇒ /404
this.catalog.byIds(wishlist.ids());              // wishlist page
this.catalog.featured(4);                        // home page "Top Rated Product"
this.catalog.related(product, 4);                // product page "Related products"
this.catalog.categories();                       // shop sidebar: name + count; home "Shop By Category" tiles: name + image
```

### 3.4 Rendering notes taken from the original

* **Price**: `priceRange(p)` ≠ null ⇒ "$30.00 – $49.00"; else `isOnSale(p)` ⇒ `regularPrice` struck through + `currentPrice`;
  else `currentPrice`. The utils reproduce the price text of every original shop card (verified).
* **Discount labels**: the original home list shows `-13%` / `-14%` on *simple* products; the shop list layout shows
  "10% OFF" next to the price. On the product page of a *variable* product the badge ("17% OFF") is the discount of the
  **selected variation** (the first variation on load); `discountPercent()` in `product.utils` returns the *largest*
  variation discount (Wooden Cupboard: 25 vs. the original's initial 17), so the product page should compute it
  from the chosen variation. Three non-sale products (Luxury Tufted Velvet Sofa, Wooden Cabinet, Wooden Coffee Table) carry
  a hidden "Sale!" badge in the original DOM but their prices are not reduced – `isOnSale()` is correctly `false`.
* **SKU line** (product page meta): WooCommerce prints `SKU: N/A` for *variable* products without SKU and prints no SKU line
  for simple products without SKU → `@if (p.sku || isVariable(p)) { SKU: {{ p.sku ?? 'N/A' }} }`.
* **Additional information tab** exists only when `attributes` is present (variable products): row *Color* →
  `attributes[0].options.join(', ')`. Simple products have only the *Description* and *Reviews (n)* tabs.
* **Gallery alt text** in the original: first image `"<name>"`, then `"<name> - Image 2"`, `"<name> - Image 3"` …
* **Shop list layout excerpt**: the original trims the excerpt to **20 words** and appends `…`; the product page shows the
  full `excerpt` + `highlights`.
* **Reviews tab**: average rating + "n Review(s)" + a 5…1 star percentage breakdown (computable from `reviews`), then the
  review list (author, date, stars, text). The star rating is *not* shown in the product summary.
* **Categories on a card** are listed in `categories` order (all of them in the list layout; the home list shows only
  the first one).

## 4. Known gaps / deviations

* `createdAt` and `popularity` are synthetic (the original does not expose them) – see 2.3.
* No review avatars, category/brand descriptions or brand logos – the original has none (or only external Gravatars).
* The catalog only contains the `Color` attribute (as the original does); the model supports more.
* `discountPercent()` (shared util, not edited) differs from the original's product-page badge for variable products – see 3.4.
* `search` is a plain word-start matcher: no relevance ranking, no fuzzy matching.
* `pages` is never 0 (contract does not say) – deliberate, see 3.2.
* `featured()` orders by original id (the original home order), not alphabetically.
* Old WordPress slugs are resolved by `bySlug()` but the canonical URL is the new slug – links should always use `product.slug`.

## 5. Verification (done)

A temporary Node script (esbuild-bundled, not committed) ran ~970 assertions against the real service and data:
unique ids/slugs, every category/brand reference valid, ≥ 1 category and brand per product, every category and brand has
≥ 2 products, **every referenced image plus its `-300x300` and `-600x600` variant exists** in `public/assets/images`,
rating/review count = reviews, text fields byte-equal to the extraction, price display equal to the original shop card text
for all 12 products (e.g. Leather Recliner $59 → $49, Wooden Cupboard $30–$49, Premium Relax Accent Chair $39–$59),
`all()` equal to the original "Default sorting" order, category and brand archives equal to the original archive pages
(restricted to the 12), and `query()` filters / sorts / pagination / edge cases. `/lab/catalog` shows the same data
visually (screenshots in `shots/catalog/`). `npx ng build --configuration development` is green.
