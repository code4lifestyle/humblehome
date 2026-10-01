import { DOCUMENT, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { Params, Router } from '@angular/router';
import { ProductQuery } from '@core/models';
import { PageTitleService } from '@core/services/page-title.service';
import { ProductService } from '@core/services/product.service';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { ShopFiltersComponent } from './shop-filters/shop-filters.component';
import {
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
  PriceRange,
  RawParam,
  SORT_OPTIONS,
  ShopMode,
  ShopParams,
  normalisePrice,
  parseList,
  parseOrderBy,
  parsePage,
  parsePerPage,
  parsePrice,
  parseRating,
  parseSearch,
  resultCountText,
} from './shop.utils';

/** `history.state` key holding the number of extra pages appended by "Load More". */
const HISTORY_KEY = 'shopLoadedPages';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The shop listing, served on three routes (`data.mode`): `/shop`, `/product-category/:slug` and `/brand/:slug`.
 *
 * The URL is the single source of truth. The router binds the route data, `:slug` and the query params to the inputs below
 * (`withComponentInputBinding`); everything on screen is derived from them with `computed()`, and every user action is a
 * `Router.navigate([], { queryParams, queryParamsHandling: 'merge' })` – so links, reloads and back/forward just work.
 * See docs/shop.md for the query-param contract.
 */
@Component({
  selector: 'app-shop-page',
  imports: [PageHeaderComponent, ProductCardComponent, PaginationComponent, ShopFiltersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ShopComponent {
  // ------------------------------------------------------------------------------------------- route bindings
  /** `data.mode` of the route. */
  readonly mode = input<ShopMode>('shop');
  /** `:slug` of /product-category/:slug and /brand/:slug. */
  readonly slug = input<string>();
  readonly search = input<RawParam>();
  readonly page = input<RawParam>();
  readonly orderby = input<RawParam>();
  readonly perPageParam = input<RawParam>(undefined, { alias: 'per_page' });
  readonly minPriceParam = input<RawParam>(undefined, { alias: 'min_price' });
  readonly maxPriceParam = input<RawParam>(undefined, { alias: 'max_price' });
  readonly rating = input<RawParam>();
  readonly categoryParam = input<RawParam>(undefined, { alias: 'category' });
  readonly brandParam = input<RawParam>(undefined, { alias: 'brand' });

  private readonly catalog = inject(ProductService);
  private readonly router = inject(Router);
  private readonly pageTitle = inject(PageTitleService);
  private readonly injector = inject(Injector);
  private readonly doc = inject(DOCUMENT);
  private readonly location = inject(Location);

  private readonly bounds = this.catalog.priceBounds();
  private readonly knownCategories = new Set(
    this.catalog.categories().map((category) => category.slug),
  );
  private readonly knownBrands = new Set(this.catalog.brands().map((brand) => brand.slug));

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly perPageOptions = PER_PAGE_OPTIONS;

  // --------------------------------------------------------------------------------------------------- route
  protected readonly category = computed(() =>
    this.mode() === 'category' ? this.catalog.categoryBySlug(this.slug() ?? '') : undefined,
  );
  protected readonly brand = computed(() =>
    this.mode() === 'brand' ? this.catalog.brandBySlug(this.slug() ?? '') : undefined,
  );
  /** Unknown category / brand slug → the 404 page. */
  protected readonly notFound = computed(
    () =>
      (this.mode() === 'category' && !this.category()) ||
      (this.mode() === 'brand' && !this.brand()),
  );
  /** The route's own filter: shown checked in the sidebar and never removable there. */
  protected readonly lockedCategory = computed(() => this.category()?.slug ?? null);
  protected readonly lockedBrand = computed(() => this.brand()?.slug ?? null);

  // ----------------------------------------------------------------------------------------------- URL state
  /** What the query string says, validated and normalised. */
  protected readonly params = computed<ShopParams>(() => {
    const mode = this.mode();
    const price = normalisePrice(
      parsePrice(this.minPriceParam()),
      parsePrice(this.maxPriceParam()),
      this.bounds,
    );
    return {
      search: parseSearch(this.search()),
      page: parsePage(this.page()),
      orderby: parseOrderBy(this.orderby()),
      perPage: parsePerPage(this.perPageParam()),
      minPrice: price.min,
      maxPrice: price.max,
      rating: parseRating(this.rating()),
      // a route-locked facet ignores its query param
      categories:
        mode === 'category'
          ? []
          : parseList(this.categoryParam()).filter((slug) => this.knownCategories.has(slug)),
      brands:
        mode === 'brand'
          ? []
          : parseList(this.brandParam()).filter((slug) => this.knownBrands.has(slug)),
    };
  });

  /** Identity of the listing (route + every parameter): "Load More" starts over whenever it changes. */
  private readonly listingKey = computed(() =>
    JSON.stringify([this.mode(), this.slug(), this.params()]),
  );

  /**
   * Pages appended below `params().page` by "Load More". Not part of the URL: it lives in the current history entry
   * (`history.state`), so Back / Forward and a reload bring the accumulated list back, while a new URL starts again at 0.
   */
  private readonly extraPages = linkedSignal<string, number>({
    source: this.listingKey,
    computation: () => this.loadedFromHistory(),
  });

  private readonly query = computed<ProductQuery>(() => {
    const params = this.params();
    const category = this.lockedCategory();
    const brand = this.lockedBrand();
    return {
      category: category ? [category] : params.categories,
      brand: brand ? [brand] : params.brands,
      minPrice: params.minPrice ?? undefined,
      maxPrice: params.maxPrice ?? undefined,
      minRating: params.rating ?? undefined,
      search: params.search || undefined,
      orderby: params.orderby,
      perPage: params.perPage,
      page: params.page,
    };
  });

  /** The visible products: the requested page plus every page loaded with "Load More". */
  protected readonly view = computed(() => {
    const query = this.query();
    const first = this.catalog.query(query);
    const loadedThrough = Math.min(first.pages, first.page + this.extraPages());
    let items = first.items;
    for (let page = first.page + 1; page <= loadedThrough; page++) {
      items = items.concat(this.catalog.query({ ...query, page }).items);
    }
    return {
      items,
      total: first.total,
      page: first.page,
      pages: first.pages,
      perPage: first.perPage,
      loadedThrough,
    };
  });

  protected readonly resultText = computed(() => {
    const { total, page, perPage, loadedThrough } = this.view();
    return resultCountText(
      total,
      (page - 1) * perPage + 1,
      Math.min(total, loadedThrough * perPage),
    );
  });

  // ---------------------------------------------------------------------------------------------- header
  /** "Search results for “x”" wins over the category / brand name; `null` on the plain shop. */
  private readonly heading = computed(() => {
    const search = this.params().search;
    return search
      ? `Search results for “${search}”`
      : (this.category()?.name ?? this.brand()?.name ?? null);
  });

  protected readonly title = computed(() => this.heading() ?? 'Premium Furniture');

  /** Curtains and Marble use their own photo behind the title. Other pages keep the default banner. */
  protected readonly headerImage = computed(() => {
    const category = this.category();
    if (category?.slug === 'curtains' || category?.slug === 'marble') {
      return category.image;
    }
    return undefined;
  });

  protected readonly crumbs = computed<PageHeaderCrumb[]>(() => {
    const trail: PageHeaderCrumb[] = [{ label: 'Home', link: '/' }];
    const category = this.category();
    const brand = this.brand();
    if (category) {
      trail.push(
        { label: 'Products', link: '/shop' },
        { label: category.name, link: ['/product-category', category.slug] },
      );
    } else if (brand) {
      trail.push(
        { label: 'Products', link: '/shop' },
        { label: brand.name, link: ['/brand', brand.slug] },
      );
    } else {
      trail.push({ label: 'Shop', link: '/shop' });
    }
    if (this.params().search) {
      trail.push({ label: 'Search results' });
    }
    return trail;
  });

  // -------------------------------------------------------------------------------------------- filter state
  /** Anything a shopper can clear: search, price, rating, categories, brands (not the route's own category / brand). */
  protected readonly hasFilters = computed(() => {
    const p = this.params();
    return (
      !!p.search ||
      p.minPrice !== null ||
      p.maxPrice !== null ||
      p.rating !== null ||
      p.categories.length > 0 ||
      p.brands.length > 0
    );
  });

  /** Number on the "Filter By" button: price counts once, then rating, then every checked category / brand. */
  protected readonly filterCount = computed(() => {
    const p = this.params();
    return (
      (p.minPrice !== null || p.maxPrice !== null ? 1 : 0) +
      (p.rating !== null ? 1 : 0) +
      p.categories.length +
      p.brands.length
    );
  });

  // ------------------------------------------------------------------------------------------ filter drawer
  /** ≤ 1024px: the sidebar is an off-canvas drawer behind the "Filter By" button. */
  protected readonly drawerMode = signal(false);
  protected readonly drawerOpen = signal(false);

  private readonly sidebar = viewChild<ElementRef<HTMLElement>>('sidebar');
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('filterToggle');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('drawerClose');
  private readonly toolbar = viewChild<ElementRef<HTMLElement>>('toolbar');
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');

  constructor() {
    // the router's title strategy resets the static "Shop" title on every navigation, so re-apply ours after each one
    effect(() => {
      this.listingKey();
      if (!this.notFound()) {
        this.pageTitle.set(this.heading() ?? 'Shop');
      }
    });

    effect(() => {
      if (this.notFound()) {
        void this.router.navigateByUrl('/404', { skipLocationChange: true });
      }
    });

    // drawer ⇄ sidebar follows the viewport; growing past 1024px closes the drawer
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const media = window.matchMedia('(max-width: 1024px)');
      this.drawerMode.set(media.matches);
      const onChange = (event: MediaQueryListEvent) => {
        this.drawerMode.set(event.matches);
        if (!event.matches) {
          this.drawerOpen.set(false);
        }
      };
      media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
    }

    // no page scroll behind the open drawer (the header uses the same technique for its menu)
    effect((onCleanup) => {
      if (!this.drawerOpen()) {
        return;
      }
      const root = this.doc.documentElement;
      const previous = root.style.overflow;
      root.style.overflow = 'hidden';
      onCleanup(() => (root.style.overflow = previous));
    });
  }

  protected openDrawer(): void {
    this.drawerOpen.set(true);
    afterNextRender(() => this.focusCloseButton(4), { injector: this.injector });
  }

  /** The drawer only becomes focusable once its `visibility` has flipped – try again on the next frame if it was too early. */
  private focusCloseButton(attempts: number): void {
    requestAnimationFrame(() => {
      const button = this.closeButton()?.nativeElement;
      if (!button || !this.drawerOpen()) {
        return;
      }
      button.focus({ preventScroll: true });
      if (this.doc.activeElement !== button && attempts > 1) {
        this.focusCloseButton(attempts - 1);
      }
    });
  }

  protected closeDrawer(): void {
    if (!this.drawerOpen()) {
      return;
    }
    this.drawerOpen.set(false);
    this.toggleButton()?.nativeElement.focus({ preventScroll: true });
  }

  protected onEscape(): void {
    if (this.drawerOpen()) {
      this.closeDrawer();
    }
  }

  /** Keeps Tab / Shift+Tab inside the open drawer. */
  protected onDrawerKeydown(event: KeyboardEvent): void {
    const panel = this.sidebar()?.nativeElement;
    if (event.key !== 'Tab' || !panel || !this.drawerOpen()) {
      return;
    }
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.getClientRects().length > 0,
    );
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.doc.activeElement;
    const outside = !panel.contains(active);
    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  }

  // ------------------------------------------------------------------------------------------------ actions
  protected onSort(event: Event): void {
    const value = parseOrderBy((event.target as HTMLSelectElement).value);
    this.go({ orderby: value === 'default' ? null : value });
  }

  protected onPerPage(perPage: number): void {
    this.go({ per_page: perPage === DEFAULT_PER_PAGE ? null : perPage });
  }

  protected onPage(page: number): void {
    this.go({ page: page <= 1 ? null : page }, true);
  }

  protected onPrice(range: PriceRange): void {
    this.go({ min_price: range.min, max_price: range.max });
  }

  protected onRating(rating: number | null): void {
    this.go({ rating });
  }

  protected onCategories(slugs: string[]): void {
    this.go({ category: slugs.length > 0 ? slugs.join(',') : null });
  }

  protected onBrands(slugs: string[]): void {
    this.go({ brand: slugs.length > 0 ? slugs.join(',') : null });
  }

  /** Clears every filter (search, price, rating, categories, brands); sorting and page size stay. */
  protected resetAll(): void {
    this.go({
      search: null,
      min_price: null,
      max_price: null,
      rating: null,
      category: null,
      brand: null,
    });
  }

  /** Appends the next page below the current items. */
  protected onLoadMore(): void {
    const before = this.view().items.length;
    this.extraPages.update((extra) => extra + 1);
    this.location.replaceState(this.location.path(true), '', {
      ...(this.location.getState() as object | null),
      [HISTORY_KEY]: this.extraPages(),
    });
    // the button disappears on the last page – hand the keyboard focus to the first new product instead of losing it
    afterNextRender(
      () => {
        const { loadedThrough, pages } = this.view();
        if (loadedThrough < pages) {
          return;
        }
        const card = this.grid()?.nativeElement.children.item(before);
        card
          ?.querySelector<HTMLElement>('a[href]:not([tabindex="-1"])')
          ?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  /**
   * Writes the change into the query string (merged with the other params; `null` removes one). Anything but a page change
   * starts again at page 1. The router's own scroll-to-top is switched off: after the new list is rendered we scroll to
   * the top of the toolbar / grid instead (unless it is already in view).
   */
  private go(patch: Record<string, string | number | null>, keepPage = false): void {
    const queryParams: Params = keepPage ? patch : { page: null, ...patch };
    void this.router
      .navigate([], { queryParams, queryParamsHandling: 'merge', scroll: 'manual' })
      .then((navigated) => {
        if (navigated) {
          afterNextRender(() => this.scrollToResults(), { injector: this.injector });
        }
      });
  }

  private loadedFromHistory(): number {
    const value = Number(
      (this.location.getState() as Record<string, unknown> | null)?.[HISTORY_KEY],
    );
    return Number.isInteger(value) && value > 0 ? value : 0;
  }

  private scrollToResults(): void {
    const toolbar = this.toolbar()?.nativeElement;
    if (!toolbar) {
      return;
    }
    // the sticky header publishes its height as scroll-padding-top on <html>, which scrollIntoView honours
    const offset = parseFloat(getComputedStyle(this.doc.documentElement).scrollPaddingTop) || 0;
    if (toolbar.getBoundingClientRect().top < offset - 1) {
      toolbar.scrollIntoView({ block: 'start' });
    }
  }
}
