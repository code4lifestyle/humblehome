# Blog agent – blog list / archives, blog post, policy pages, 404

Four lazy page components (standalone · OnPush · zoneless – all state comes from route-bound `input()` signals and
`computed`s, no timers). They read data only through `BlogService` / `ContentService` and use the shared components
`app-page-header`, `app-blog-card`, `app-pagination`, `app-section-title`, `app-toc-card`, `app-help-card` and the global
`.btn-default`.

| Route | Class · selector | Files (`src/app/pages/…`) | Original |
|---|---|---|---|
| `/blog` · `/category/:slug` · `/tag/:slug` | `BlogListComponent` · `app-blog-list-page` | `blog-list/blog-list.component.{ts,html,scss}` + `_blog-card-original.scss` | `blog/`, `category/uncategorized/`, `tag/<slug>/` |
| `/blog/:slug` | `BlogDetailComponent` · `app-blog-detail-page` | `blog-detail/blog-detail.component.{ts,html,scss}` | `modern-interior-trends/` … |
| `/policy/:slug` | `PolicyComponent` · `app-policy-page` | `policy/policy.component.{ts,html,scss}` | `privacy-policy/`, `terms-conditions/`, … |
| `/404` · `**` | `NotFoundComponent` · `app-not-found-page` (host `data-page="not-found"`) | `not-found/not-found.component.{ts,html,scss}` | `404/` |

## Route inputs (`withComponentInputBinding`)

| Component | Inputs |
|---|---|
| `BlogListComponent` | `mode: 'blog' \| 'category' \| 'tag'` (route `data`), `slug` (path param), `page` (`?page=`, string) |
| `BlogDetailComponent` | `slug` |
| `PolicyComponent` | `slug` |
| `NotFoundComponent` | – |

No public methods or outputs; nothing else in the app needs to import these components.

## Behaviour

### Blog list (`/blog`, `/category/:slug`, `/tag/:slug`)
* Banner (`app-page-header`): **"Our Blog"** (crumbs Home / Blog) · category name (e.g. **"Uncategorized"**) · **"Tag: Luxury"** –
  the last two with crumbs Home / Blog / *name*. Tab title: `Blog` / category name / tag name (as in the original).
* `BlogService.query({ category | tag, page, perPage: 6 })`, 3-column grid (≥ 1200px, Bootstrap `col-xl-4`), 2 columns ≥ 768px,
  1 below; 30px gutters. Cards are `<app-blog-card [showMeta]="false">` – the original list card has **no** date / category line.
* `app-pagination` (renders nothing for one page – the reduced content set has 4 posts, so it never shows today). It writes
  `?page=n` (page 1 = no parameter, other query parameters are kept). Bad values (`abc`, `0`, `-1`, `99`, `1.9`) are clamped by the
  service. Router scroll restoration returns to the top on a page change.
* Empty archive (a valid category / tag without posts): "No posts found" + "View All Posts" button. Not reachable with the current data.
* Unknown category / tag → `router.navigateByUrl('/404', { skipLocationChange: true })` (URL stays, 404 page renders).

### Blog post (`/blog/:slug`)
* Banner with the title and a meta line: calendar icon + `MMMM d, y`, tag icon + category link(s) → `/category/:slug` (the original
  shows no breadcrumb on a post). The shared `app-page-header` has no slot for that line, so the banner is rebuilt locally with the
  same values (see "Requests").
* Featured image (`post.image`, radius 20px, theme "shiny glass" hover sweep), then the article in a 1100px column:
  `heading → <h2>`, `list → <ul>` (17px items, disc bullets), `paragraph → <p>`, `paragraph` with `quote: true` → `<blockquote>`
  (cream box, gold quotation icon `assets/icons/icon-blockquote.svg`, 18px/600 text).
* Below a divider: **Tags:** chips (`/tag/:slug`, accent pills) and three share icons (Facebook, WhatsApp, LinkedIn). The links are
  built from the current **absolute** URL (`Location.prepareExternalUrl` + `Router.createUrlTree`, so base-href / hash routing work),
  with the same query parameters as the original (`sharer.php?u=&t=`, `send?text=`, `shareArticle?mini=true&url=&title=&summary=` –
  summary = first paragraph cut at 250 characters); `target="_blank" rel="noopener nofollow"`, `aria-label="Share on …"`.
* Extras in the theme style (not in the original): **previous / next post** cards (`BlogService.adjacent()`; *previous* = next older
  post on the left, *next* = newer on the right, a missing side stays empty) and **Related Posts** (`BlogService.related(post, 3)`,
  `app-section-title` + `app-blog-card`).
* Tab title `post.title`. Unknown slug → 404 as above. The component instance is reused between posts, everything is `computed`
  from `slug`, so prev / next / related / tags / share URL follow the navigation.

### Policy pages (`/policy/:slug`)
* Banner: h1 `policy.title`, crumbs Home / `policy.breadcrumb ?? policy.title`; tab title = the same last crumb (e.g. "Terms & Conditions").
* Two columns (33.33 % / 66.67 % of a 1300px row, exactly the original's Elementor geometry): **sidebar** = `app-toc-card`
  (`section.tocLabel ?? section.heading` → `section.id`) + `app-help-card`, **sticky** at `top: calc(var(--header-height, 0px) + 20px)`
  on desktop, stacked above the text (not sticky) ≤ 1024px; **text** = "Effective Date: …" (h3), intro (`introRuns ?? intro`), sections.
* Section = `<h3 id="privacy-N">`, then blocks: paragraph → `<p>` (`runs ?? [{text}]`), sub-heading → `<h4>` ("a. Personal Information"),
  list → `<ul>` with 5px dot bullets or **plain lines** when `bullets === false` (`itemRuns ?? [{text}]`).
* Inline runs: plain text · highlighted phrase (darker text; **labels that end with ":"** – "E-mail:", "Phone:" – are bold, like the
  original) · links: `href` starting with `/` → `routerLink` (the "Livora" link in the intro), everything else (`mailto:`, `tel:`) a plain
  `<a [href]>`. Links are dark in paragraphs and body-coloured in lists (accent on hover); highlighted links are bold.
* **Spacing rhythm** (the flat `blocks` are grouped like the Elementor containers of the original; measured on all five pages at
  1440 / 820 / 390 – every block within 1.5px of the original, block for block):

  | | desktop | ≤ 1024px | ≤ 767px |
  |---|---|---|---|
  | between top-level blocks (intro, sections) | 60 | 40 | 30 (+10 under the intro) |
  | between the parts of a section | 40 | 30 | 20 |
  | heading + its first paragraph | 15 | 10 | 10 |
  | heading + plain lines (e.g. "You may request a return if:") | 20 | 20 | 20 |
  | inside a part (sub-heading → list, list → paragraph …) | 20 | 15 | 15 |
  | paragraph → plain lines ("For any queries, contact us at:" → e-mail) | 15 | 10 | 10 |

  A *part* starts at every sub-heading; the paragraph or plain-lines list directly below the section heading belongs to the heading
  (numbered steps "1. …" do not – "4. Return Process" keeps its 40px gap); everything up to the next sub-heading is one part.
* Anchors: `TocCardComponent` re-aligns the target below the sticky bar (Angular's `ViewportScroller` ignores `scroll-padding-top`) –
  measured: the section heading lands at 92px (76px bar + 16px) on desktop and 80px on phones, also for `/policy/…#privacy-8` direct loads and
  repeated clicks on the same entry.
* Unknown slug → 404 as above.

### 404 (`/404`, `**`)
Banner "Page Not Found" (crumbs Home / 404 Error Page), `assets/images/404-error-img.png` (drawn 520px wide like the original,
470px file), h2 "Oops! Page not found", "The page you are looking for does not exist.", `btn-default` "Back To Homepage" → `/`.
Used by the three components above through `skipLocationChange`, so the address bar keeps the URL that was typed.

## Decisions / deviations
* **Layout containers.** The blog list, the post and the 404 sit in the theme's Bootstrap container (1300px + 15px gutters → content at
  x = 85 on a 1440px screen, 15px on tablets / phones), built locally as `max-width: 1300px; padding-inline: 15px` – not the global
  `.container` (1320px box + 20px gutters, the Elementor inset), exactly like the original. The policy page *is* an Elementor page: it uses
  the global `.container` and a row that is 20px wider (`margin-inline: -10px`) with 10px column padding (sidebar 10 / 35px), which
  reproduces the original's geometry to the pixel at 390 / 820 / 1100 / 1366 / 1440 / 1700px.
* **Blog card workaround** (`blog-list/_blog-card-original.scss`, `::ng-deep` overrides with absolute values, used by the list and the
  related posts): the shared card lacks the original's 10px gap between image and text, has 20px body padding below 992px (original
  10px) and 20px above / below the "Read More" divider on phones (original 15px, 22px arrow disc). Delete the mixin + its two
  `@include`s once the shared card is fixed.
* Post banner is local (no slot in `app-page-header`); headings inside the policy are `h3` / `h4` (the original uses h3 for both), the
  banner keeps the only `h1`.
* `PageTitleService.set()` is called from an `effect` on every page (also `Blog`, identical to the route's static title).
* Policy highlight rules and the spacing heuristics above are derived from measuring the original (computed styles of every run and
  the y-position of every block); the data files were not touched.

## Requests for shared files (not done – not my files)
1. `app-page-header`: add `<ng-content />` (e.g. between the `<h1>` and the crumbs) so a page can project extra banner content – the blog
   post banner (date + category links) could then use the component instead of a local copy of its CSS.
2. `app-page-header`: since the global `.container` got its 20px gutter, `.page-header { padding: 150px 10px }` (90px 10px ≤ 1024px) gives a
   30px side inset (original 20px; the text box is 20px narrower than the original's at ≤ 1320px). `padding: 150px 0` / `90px 0` fixes it
   (the local post banner already does that and matches the original to the pixel).
3. `app-blog-card`: the three details above (10px `gap` between `.media` and `.body`, body padding 10px ≤ 991px, "Read More" row 15px ≤ 767px).
   Also: the image always has `loading="lazy"`, so in dev mode Angular may log the (harmless, dev-only) `NG0913` "LCP image is lazy"
   warning for a first-row card of `/blog`.

## Verification
* Side-by-side screenshots of original vs. new at 1440 / 820 / 390 (`shots/blog/`): blog, post, tag page, privacy / refunds /
  cancellation / terms, 404; element-by-element position/size/style comparison against the original with a Playwright script
  (list, post and policy: 0 – 1px differences at all three widths, except the intentional extras).
* Playwright behaviour suite (227 checks, dev and production build): list / category / tag content, `?page=` handling (with a temporary
  2-per-page build: page links, prev / next arrows, history back / forward, other query parameters kept, 37 checks), unknown slugs →
  404 with the URL kept, post structure / tags / category link / share URLs (follow the slug) / prev-next / related, policy text equal to
  the original **word for word** (all five pages, TOC labels included), TOC anchors + sticky sidebar, footer policy links, 404 page,
  hover colours and weights, no console messages, no horizontal overflow at 22 viewport widths from 320 to 1920px.
* `ng build` (development and production) is green, no budget warnings.

## Known gaps
* Only the 4-post reduced content set: the list never paginates today (verified with a temporary per-page value) and the empty state is
  not reachable (verified with a temporary override).
* The original's scroll / text animations (GSAP heading reveal, image clip reveal) and the desktop parallax of the banner
  (`background-attachment: fixed`) are not reproduced; the blog card hover is the shared card's zoom without the "shiny glass" sweep
  (the featured image of a post has it).
* A post shows date and categories only (the original has no author / comments either).
* The sticky sidebar of the Terms page (14 entries) is taller than a 900px viewport, so the help card below the table of contents
  only comes into view at the end of the page – same as the original.
* The last plain-lines list of the delivery policy is 2.8px taller in the original at ≤ 820px (unexplained Elementor rounding).
