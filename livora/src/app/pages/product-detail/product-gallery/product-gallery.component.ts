import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ProductVariation } from '@core/models';
import { imageVariant } from '@core/utils/image.utils';
import { scrollBehavior } from '../product-detail.utils';
import { ProductLightboxComponent } from '../product-lightbox/product-lightbox.component';

interface Thumb {
  index: number;
  src: string;
  label: string;
}

/**
 * Product gallery (the original's ShopEngine "gallery slider"): one large image on a cream rounded box with the
 * discount badge (top-left) and an expand button (top-right), a strip of four thumbnails below it whose arrow
 * overlays step through the images, hover zoom on mouse devices and a lightbox with the full-size images.
 *
 *   <app-product-gallery [images]="p.images" [alt]="p.name" [badge]="'17% OFF'" [variation]="chosenVariation" />
 *
 * Choosing a variation shows its image (like WooCommerce): when the image is part of the gallery that slide is shown,
 * otherwise it is displayed on its own until the choice is cleared. Clearing the choice keeps the current slide.
 */
@Component({
  selector: 'app-product-gallery',
  imports: [ProductLightboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-gallery.component.html',
  styleUrl: './product-gallery.component.scss',
})
export class ProductGalleryComponent {
  readonly images = input.required<string[]>();
  /** Product name → alt text of the first image, "<name> - Image 2" … of the others (as in the original). */
  readonly alt = input.required<string>();
  /** "17% OFF" – omitted / null = no badge. */
  readonly badge = input<string | null>(null);
  /** The chosen variation (its `image` is brought on stage), null = none chosen. */
  readonly variation = input<ProductVariation | null>(null);

  protected readonly index = signal(0);
  /** A variation image that is not part of the gallery. */
  private readonly extra = signal<string | null>(null);
  protected readonly lightboxOpen = signal(false);
  protected readonly lightboxIndex = signal(0);
  /** Becomes true on the first mouse hover: only then the full-size image for the zoom layer is requested. */
  protected readonly zoomReady = signal(false);

  private readonly strip = viewChild<ElementRef<HTMLElement>>('strip');

  protected readonly count = computed(() => this.images().length);
  /** Full-size path of the image on display. */
  protected readonly current = computed(() => this.extra() ?? this.images()[this.index()] ?? '');
  protected readonly mainSrc = computed(() => imageVariant(this.current(), '600x600'));
  /** High-density screens get the 1200px original for the 610px stage. */
  protected readonly mainSrcset = computed(() => `${this.mainSrc()} 1x, ${this.current()} 2x`);
  protected readonly mainAlt = computed(() =>
    this.extra() || this.index() === 0 ? this.alt() : `${this.alt()} - Image ${this.index() + 1}`,
  );
  protected readonly thumbs = computed<Thumb[]>(() =>
    this.images().map((src, index) => ({
      index,
      src: imageVariant(src, '300x300'),
      label: `Show image ${index + 1} of ${this.images().length}`,
    })),
  );
  /** True while a variation image that is not part of the gallery is on display (no thumbnail is active then). */
  protected readonly detached = computed(() => this.extra() !== null);
  protected readonly atStart = computed(() => this.index() === 0 && !this.detached());
  protected readonly atEnd = computed(() => this.index() >= this.count() - 1 && !this.detached());
  protected readonly lightboxImages = computed(() => {
    const extra = this.extra();
    return extra ? [extra] : this.images();
  });

  constructor() {
    // follow the chosen variation's image
    effect(() => {
      const preferred = this.variation()?.image ?? null;
      const images = this.images();
      untracked(() => {
        const at = preferred ? images.indexOf(preferred) : -1;
        if (at >= 0) {
          this.index.set(at);
          this.extra.set(null);
        } else {
          this.extra.set(preferred);
        }
      });
    });

    // keep the active thumbnail inside the (horizontally scrollable) strip
    effect(() => {
      const at = this.index();
      const strip = this.strip()?.nativeElement;
      const item = strip?.children[at] as HTMLElement | undefined;
      if (strip && item) {
        strip.scrollTo({
          left: item.offsetLeft - (strip.clientWidth - item.offsetWidth) / 2,
          behavior: scrollBehavior(),
        });
      }
    });
  }

  protected select(index: number): void {
    this.extra.set(null);
    this.index.set(index);
  }

  protected step(delta: number): void {
    const from = this.extra() ? 0 : this.index();
    this.select(Math.min(this.count() - 1, Math.max(0, from + delta)));
  }

  protected openLightbox(): void {
    this.lightboxIndex.set(this.detached() ? 0 : this.index());
    this.lightboxOpen.set(true);
  }

  /** The main image follows whatever was last looked at in the lightbox. */
  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
    if (!this.detached()) {
      this.index.set(this.lightboxIndex());
    }
  }

  // ------------------------------------------------------------------- swipe (touch / pen)

  private swipeStart: number | null = null;
  private swiped = false;

  protected onPointerDown(event: PointerEvent): void {
    this.swipeStart = event.pointerType === 'mouse' ? null : event.clientX;
    this.swiped = false;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.swipeStart === null) {
      return;
    }
    const dx = event.clientX - this.swipeStart;
    this.swipeStart = null;
    if (Math.abs(dx) > 40) {
      this.swiped = true;
      this.step(dx < 0 ? 1 : -1);
    }
  }

  /** A click on the image opens the lightbox – unless it is the tail of a swipe. */
  protected onViewerClick(): void {
    if (this.swiped) {
      this.swiped = false;
      return;
    }
    this.openLightbox();
  }

  // ------------------------------------------------------------------- hover zoom (mouse only)

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === 'mouse') {
      this.zoomReady.set(true);
    }
  }

  /** The zoomed layer scales around the pointer: the point under the cursor stays put while the rest slides. */
  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') {
      return;
    }
    const el = event.currentTarget as HTMLElement;
    const box = el.getBoundingClientRect();
    el.style.setProperty('--zoom-x', `${((event.clientX - box.left) / box.width) * 100}%`);
    el.style.setProperty('--zoom-y', `${((event.clientY - box.top) / box.height) * 100}%`);
  }
}
