import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';
import { SliderBreakpoints, SliderComponent } from '@shared/components/slider/slider.component';

/** One tile of the original slider. `slug` = a category of our catalog; without one the tile links to the shop. */
interface CategoryTileSource {
  label: string;
  image: string;
  slug?: string;
  /** Item count printed by the original – only used for tiles that have no real category. */
  count: number;
}

interface CategoryTile {
  label: string;
  image: string;
  caption: string;
  link: string | string[];
}

/** A slide of the looping slider: every tile is rendered twice (see `HomeCategoriesComponent.slides`). */
interface CategorySlide extends CategoryTile {
  key: string;
  /** `true` for the second, purely visual copy (hidden from assistive technology and the tab order). */
  copy: boolean;
}

/** Same order, images and captions as the original home page slider (category-item-image-1 … 7). */
const TILES: readonly CategoryTileSource[] = [
  {
    label: 'Living Room',
    image: 'assets/images/category-item-image-1.jpg',
    slug: 'living-room',
    count: 18,
  },
  {
    label: 'Bedroom',
    image: 'assets/images/category-item-image-2.jpg',
    slug: 'bedroom',
    count: 20,
  },
  {
    label: 'Dining Room',
    image: 'assets/images/category-item-image-3.jpg',
    slug: 'dining-room',
    count: 10,
  },
  {
    label: 'Office',
    image: 'assets/images/category-item-image-4.jpg',
    slug: 'office-furniture',
    count: 12,
  },
  { label: 'Outdoor', image: 'assets/images/category-item-image-5.jpg', count: 15 },
  { label: 'Home Storage', image: 'assets/images/category-item-image-6.jpg', count: 20 },
  { label: 'Kitchen', image: 'assets/images/category-item-image-7.jpg', count: 20 },
];

/**
 * "Shop By Category / Explore Furniture Categories" – a looping, auto-playing slider of circular category tiles
 * (6 per view on desktop, 4 on tablet, 2 on phones) with the "N items" caption revealed on hover and one dot per tile.
 * Tiles of real catalog categories show the real product count and link to `/product-category/:slug`; the others
 * (Outdoor, Home Storage, Kitchen) keep the original caption and link to the shop.
 *
 * Swiper's loop mode needs slides to spare: with 7 tiles and 6 per view it only half works (dots jump to the wrong slide,
 * the tab order visits the tiles again and again). The original solves this with cloned slides – so do we: the tiles are
 * rendered twice, the second copy is `aria-hidden` and out of the tab order, and the dots are our own (one per tile).
 */
@Component({
  selector: 'app-home-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent, SliderComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class HomeCategoriesComponent {
  private readonly catalog = inject(ProductService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly slider = viewChild.required(SliderComponent);

  /** Original ElementsKit options: 2 → 4 (≥ 767px, no gap) → 6 (≥ 1024px) slides, autoplay 3 s, speed 1 s, loop. */
  protected readonly breakpoints: SliderBreakpoints = {
    767: { slidesPerView: 4, spaceBetween: 0 },
    1024: { slidesPerView: 6, spaceBetween: 20 },
  };

  protected readonly tiles = computed<CategoryTile[]>(() => {
    const counts = new Map(this.catalog.categories().map((c) => [c.slug, c.count]));
    return TILES.map(({ label, image, slug, count }) => {
      const items = slug ? (counts.get(slug) ?? count) : count;
      return {
        label,
        image,
        caption: `${items} ${items === 1 ? 'item' : 'items'}`,
        link: slug ? ['/product-category', slug] : '/shop',
      };
    });
  });

  protected readonly slides = computed<CategorySlide[]>(() => {
    const tiles = this.tiles();
    return [false, true].flatMap((copy) =>
      tiles.map((tile) => ({ ...tile, copy, key: `${tile.label}-${copy ? 'copy' : 'main'}` })),
    );
  });

  /** Index of the active slide as reported by the slider (0 … 2 × tiles − 1). */
  private readonly realIndex = signal(0);
  /** The dot that is lit: the active slide's tile. */
  protected readonly activeDot = computed(() => this.realIndex() % this.tiles().length);

  constructor() {
    afterNextRender(() => this.keepFocusInPlace());
  }

  protected onSlideChange(index: number): void {
    this.realIndex.set(index);
  }

  /** Dot click: slide to that tile, taking the nearer of its two copies so the shortest way round is used. */
  protected goTo(tileIndex: number): void {
    const count = this.tiles().length;
    const from = this.realIndex();
    const target = [tileIndex, tileIndex + count].reduce((best, candidate) =>
      Math.abs(candidate - from) < Math.abs(best - from) ? candidate : best,
    );
    this.slider().slideTo(target);
  }

  /**
   * Swiper's accessibility module slides the carousel to every slide that receives keyboard focus – also to tiles that are
   * already fully visible, which makes the whole row jump on each Tab press. Focus on a visible tile is therefore kept away
   * from Swiper (capture phase on the slider element); tiles outside the view still make the slider move them into sight.
   */
  private keepFocusInPlace(): void {
    const slider = this.host.nativeElement.querySelector('app-slider');
    const viewport = slider?.querySelector<HTMLElement>('.swiper');
    if (!slider || !viewport) {
      return;
    }
    slider.addEventListener(
      'focus',
      (event) => {
        const slide = (event.target as Element).closest('.swiper-slide');
        if (!slide) {
          return;
        }
        const view = viewport.getBoundingClientRect();
        const box = slide.getBoundingClientRect();
        if (box.left >= view.left - 1 && box.right <= view.right + 1) {
          event.stopPropagation();
        }
      },
      true,
    );
  }
}
