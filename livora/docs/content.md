# Content agent – blog, FAQ, testimonials, team, brand logos, policies

Static marketing content of the original Livora site, extracted programmatically from the mirror (`..`) and kept
**verbatim** (placeholder wording, dates and typos included), plus the two services that serve it.
Everything is synchronous, pure and read-only.

| File | What |
|---|---|
| `src/app/core/data/blog.data.ts` | `BLOG_POSTS` (4), `BLOG_CATEGORIES` (1), `BLOG_TAGS` (3) |
| `src/app/core/data/faq.data.ts` | `FAQ_GROUPS` (5 × 5 Q&A), `FAQ_PREVIEW` (5) |
| `src/app/core/data/testimonials.data.ts` | `TESTIMONIALS` (6), `BRAND_LOGOS` (5) |
| `src/app/core/data/team.data.ts` | `TEAM` (4) |
| `src/app/core/data/policies.data.ts` | `POLICIES` (5 pages, 43 sections) |
| `src/app/core/services/blog.service.ts` | `BlogService` |
| `src/app/core/services/content.service.ts` | `ContentService` |
| `src/app/core/models/{blog,content}.model.ts` | additive extensions only (see "Model additions") |
| `src/app/pages/lab/lab-content.component.ts` | sandbox page `/lab/content` (deleted at integration) |

Pages should use the **services**, not the data files.

---------------------------------------------------------------------------------------------------------------------

## Services

Both are `@Injectable({ providedIn: 'root' })`.
**Every method returns the same instance for the same arguments** (module constants / a small memo cache), so results can
be bound to inputs (`[items]="content.testimonials()"`, `[posts]="blog.latest(3)"`) without NG0100 in dev mode. Treat
returned arrays/objects as immutable.

### `BlogService`

```ts
posts(): BlogPost[]                         // newest first (all 4 share 2026-06-22 → the original blog-page order is kept)
bySlug(slug): BlogPost | undefined
categories(): (BlogCategory & { count })[]  // [{ slug: 'uncategorized', name: 'Uncategorized', count: 4 }]
categoryBySlug(slug): BlogCategory | undefined
tags(): (BlogTag & { count })[]             // luxury / performance / quality, count 4 each
tagBySlug(slug): BlogTag | undefined
query(q: BlogQuery = {}): Paginated<BlogPost>   // { category?, tag?, page?, perPage? } → { items, total, page, perPage, pages }
latest(limit = 3): BlogPost[]
adjacent(slug): { prev?: BlogPost; next?: BlogPost }   // prev = next OLDER post, next = next NEWER post
related(post, limit = 3): BlogPost[]        // shares most categories (×2) / tags, then newest first; never `post` itself
```

* `query`: `perPage` defaults to 6 and is at least 1; `page` is 1-based and clamped to `1…pages` (NaN → 1); an empty
  result has `pages: 1`, `page: 1`. An unknown category/tag slug yields no items – use `categoryBySlug` / `tagBySlug` to
  decide on a 404.
* `adjacent`: unknown slug → `{}`; first (newest) post has no `next`, last (oldest) has no `prev`.

```ts
private readonly blog = inject(BlogService);

// /blog, /category/:slug, /tag/:slug   (route inputs: mode, slug, page)
readonly result = computed(() => this.blog.query({
  category: this.mode() === 'category' ? this.slug() : undefined,
  tag: this.mode() === 'tag' ? this.slug() : undefined,
  page: Number(this.page() ?? 1),
}));

// /blog/:slug
readonly post = computed(() => this.blog.bySlug(this.slug() ?? ''));   // undefined → redirect to /404
readonly nav = computed(() => this.blog.adjacent(this.slug() ?? ''));  // nav().prev / nav().next
// Home "Latest News"
readonly latest = this.blog.latest(3);
```

### `ContentService`

```ts
faqGroups(): FaqGroup[]                       // 5 groups: general · orders-payments · shipping-delivery · returns-warranty · product-care
faqPreview(): FaqItem[]                       // the 5 questions of the About / Testimonials accordion (= the "general" group)
testimonials(): Testimonial[]                 // 6
team(): TeamMember[]                          // 4
brandLogos(): { name: string; image: string }[]  // 5 (assets/images/logo-brand-1..5.png)
policies(): PolicyPage[]                      // 5, ordered like the footer "Customer Services" list
policyBySlug(slug): PolicyPage | undefined    // undefined → 404
```

```ts
<app-testimonial-slider [items]="content.testimonials()" />
<app-faq-preview-section [items]="content.faqPreview()" />
readonly policy = computed(() => this.content.policyBySlug(this.slug() ?? ''));
```

---------------------------------------------------------------------------------------------------------------------

## Content inventory

### Blog posts (`/blog/:slug`)

| slug | title | image | date |
|---|---|---|---|
| `modern-interior-trends` | Modern Interior Trends | `assets/images/post-1-1024x576.jpg` | 2026-06-22 (June 22, 2026) |
| `home-styling-tips` | Home Styling Tips | `assets/images/post-2-1024x576.jpg` | 2026-06-22 |
| `furniture-care-guides` | Furniture Care Guides | `assets/images/post-3-1024x576.jpg` | 2026-06-22 |
| `space-saving-ideas` | Space-Saving Ideas | `assets/images/post-4-1024x576.jpg` | 2026-06-22 |

All four: category `uncategorized`, tags `luxury` `performance` `quality`, excerpt
`A watch is far more than a simple tool for telling time […]`, no author (the original shows none). The four article
bodies are identical in the original (verified); each post still owns its own `body`. Body = 8 blocks:
paragraph, paragraph, **quote** (paragraph with `quote: true`), paragraph, heading "Create living space", paragraph,
list (5 items), closing paragraph.

### FAQ groups (`/faqs`)

| id (anchor) | title | original anchor |
|---|---|---|
| `general` | General Questions | `#faq-1` |
| `orders-payments` | Orders & Payments | `#faq-2` |
| `shipping-delivery` | Shipping & Delivery | `#faq-3` |
| `returns-warranty` | Returns & Warranty | `#faq-4` |
| `product-care` | Product Care group | `#faq-5` |

Five questions each. The original repeats **one placeholder answer for all five questions of a group** – kept as is.
`faqPreview()` is the "general" group: it is the accordion of the About and Testimonials pages (the original Home page has
no FAQ section).

### Policies (`/policy/:slug`)

| slug | `title` (banner h1) | `breadcrumb` (crumb + tab title) | `footerLabel` | sections |
|---|---|---|---|---|
| `delivery-policy` | Shipping & Delivery Policy | Delivery Policy | Shipping Information | 8 |
| `refunds-returns-policy` | Refunds & Returns Policy | Refunds Returns Policy | Return Policy | 7 |
| `cancellation-policy` | Cancellation Policy | *(= title)* | Cancellation Policy | 5 |
| `privacy-policy` | Privacy Policy | *(= title)* | Privacy Policy | 9 |
| `terms-conditions` | Term & Condition (sic) | Terms & Conditions | Terms & Conditions | 14 |

Others: 6 testimonials (Olivia Bennett – Homeowner, Emma Wilson – Store Manager, Charlotte Taylor – Sales Executive,
Amelia Johnson – Showroom Coordinator, Grace Thompson – Product Stylist, Isabella Martin – Operations Manager; rating 5,
`author-1..6.jpg`), team (Ethan Carter – Creative Director, Sophia Bennett – Interior Designer, Daniel Wilson – Product
Designer, Olivia Harris – Furniture Consultant; `team-1..4.jpg`), brand logos "Brand 1..5" (`logo-brand-1..5.png`).

---------------------------------------------------------------------------------------------------------------------

## Model additions (all optional – nothing renamed or removed)

`blog.model.ts`
* `BlogBlock` paragraph: **`quote?: boolean`** – `true` = the original renders the paragraph as a `<blockquote>`
  (block 3 of every post). A renderer that ignores the flag just shows a normal paragraph, nothing is lost.
* `BlogQuery` – the argument type of `BlogService.query()`.

`content.model.ts`
* `PolicyRun { text; highlight?; href? }` – inline fragment. The `text` of all runs concatenated equals the plain string.
* `PolicyBlock` paragraph: `runs?: PolicyRun[]` · list: **`bullets?: boolean`** (`false` = plain lines, no bullet markers)
  and `itemRuns?: PolicyRun[][]` (same length/order as `items`).
* `PolicySection.tocLabel?` – text of the table-of-contents entry when it differs from `heading`.
* `PolicyPage.breadcrumb?` and `PolicyPage.introRuns?` (parallel to `intro`).
* Doc comments only: `Testimonial.quote` (includes the “ ” marks), `PolicyPage.effectiveDate` (date only).

---------------------------------------------------------------------------------------------------------------------

## Rendering notes for the page authors

**Blog detail** – `post.body` in order: `heading` → `<h2>`, `list` → `<ul>`, `paragraph` → `<p>` (or `<blockquote>` when
`quote`). Meta line: `{{ post.date | date: 'MMMM d, y' }}` + category link (`/category/:slug`, name via
`categoryBySlug`); tags row "Tags:" with `/tag/:slug` links (name via `tagBySlug`). Card image: `post.image` is already the
`-1024x576` variant (`imageVariant` leaves it unchanged).

**FAQ page** – anchor of each group = `group.id`; TOC labels = `group.title`. The original opens the **3rd** question of
every group by default (About/Testimonials accordions open the 1st). The "Need some help or want to chat" card (phone
`+00 (123) 4567` → `tel:+123456789`, `info@example.com`) is a template shared by `/faqs` and the policy pages – it is
**not** part of this data.

**Testimonials** – `quote` already contains the typographic quotes; `rating` is 5 for all. The About/Home slider of the
original uses the same text with a straight apostrophe, the testimonials page (source of this data) the curly one.

**Policy page** (two columns in the original: sticky sidebar = TOC card + help card, main = "Effective Date: …" heading,
intro, sections):
* Effective date: `Effective Date: {{ policy.effectiveDate }}` (value is `9rd June, 2026`, sic, on all five).
* TOC: `section.tocLabel ?? section.heading`, `href="#" + section.id`; section anchors are `privacy-1…N` on **every**
  policy (as in the original). Each section: `<h3 [id]="section.id">{{ section.heading }}</h3>` then `blocks`.
* Blocks: `paragraph` → `<p>`; `subheading` ("a. Personal Information") → smaller heading; `list` → `<ul>` with bullets, or
  plain lines when `bullets === false` (the original mixes both inside one section, e.g. Returns 1.: three plain lines,
  then one bulleted item – rendered as two consecutive `list` blocks).
* Rich text (optional): `block.runs ?? [{ text: block.text }]`, `block.itemRuns?.[i] ?? [{ text: block.items[i] }]`,
  `policy.introRuns?.[i] ?? [{ text: policy.intro[i] }]`. A run with `highlight` is darker text (bold when it is a
  link); `href` is `mailto:` / `tel:` (plain `<a>`) or starts with `/` (→ `routerLink`, used for the "Livora" link
  in the intro). Ignoring runs is safe – the plain strings are complete.
* Terms and Returns keep the copy-pasted "Welcome to Livora Your privacy is important to us…" intro of the original.

---------------------------------------------------------------------------------------------------------------------

## Verification (done)

* Independent comparison of the served data with the original HTML: the whole visible text of each policy page's content
  region, every TOC label and anchor, h1 + breadcrumb, all 4 article bodies, dates, tags, hero images, list-card
  excerpts, all 25 FAQ Q&As (+ group titles), the 6 testimonials, team and logos – all identical.
* Service behaviour (ordering, pagination and clamping, filters, adjacent/related, counts, stable identities), no HTML
  entities/tags in any string, all 19 image paths exist in `public/assets/images`, `runs` concatenate to `text` (31 rich
  texts). Rendered on `/lab/content` (screenshots in `shots/content/lab-*.png`).

## Known gaps

* Only 4 of the original's 6 posts (`comfort-lifestyle`, `design-inspiration` are outside the reduced set).
* Article, excerpt, FAQ and testimonial texts are the original's placeholders (e.g. the "watch" article) – intentionally
  unchanged, as are "[Currency]", "[X] days", "[India / Worldwide - specify]" in the policies.
* No post time of day in the original: equal dates keep the blog-page order. The original Home page shows post 1 with the
  un-suffixed `post-1.jpg`; the data uses the `-1024x576` file everywhere.
* Logos have no alt text in the original → neutral names (the artwork shows IKEA, Pepperfry, Roche Bobois, Godrej; #1 is
  unidentified). The team members' social icons (`href="#"`) are not modelled.
* Inline formatting in policies is limited to highlight + link; the privacy page's `tel:%20+123456789` was normalised to
  `tel:+123456789`.
