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
  output,
  untracked,
  viewChild,
} from '@angular/core';
import Swiper from 'swiper';
import { A11y, Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

export interface SliderBreakpoint {
  slidesPerView?: number;
  spaceBetween?: number;
}

/**
 * Key = minimum viewport width in px. Angular templates cannot write numeric object keys, so inside a template quote
 * them – `[breakpoints]="{ '768': { slidesPerView: 2 } }"` – or define the object in the component class.
 */
export type SliderBreakpoints = Record<number, SliderBreakpoint> | Record<string, SliderBreakpoint>;

const DEFAULT_AUTOPLAY_DELAY = 5000;

/**
 * Swiper wrapper. The consumer projects the slides, each wrapped in `<div class="swiper-slide">`:
 *
 *   <app-slider [slidesPerView]="1" [breakpoints]="{ '768': { slidesPerView: 2 }, '1025': { slidesPerView: 4 } }"
 *               [spaceBetween]="20" [loop]="true" [autoplay]="4000" [navigation]="true" [pagination]="true">
 *     @for (item of items(); track item.id) {
 *       <div class="swiper-slide">…</div>
 *     }
 *   </app-slider>
 *
 * The Swiper instance is created after render, updated when an input changes, re-created whenever slides are added or
 * removed (e.g. an `@for` list that loads later) and destroyed with the component. Autoplay is switched off for
 * visitors who prefer reduced motion. Arrows and dots follow the theme (accent colour); on a dark background set
 * `--slider-dot-color` for the inactive dots.
 */
@Component({
  selector: 'app-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // autoplay rests while the pointer is over the slider (arrows and dots included) or a keyboard user is inside it
  host: {
    '(pointerenter)': 'onPointer($event, true)',
    '(pointerleave)': 'onPointer($event, false)',
    '(focusin)': 'onFocus($event, true)',
    '(focusout)': 'onFocus($event, false)',
  },
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent {
  readonly slidesPerView = input<number | 'auto'>(1);
  readonly spaceBetween = input(20);
  /** Swiper breakpoints: key = min viewport width in px (quote the keys inside templates). */
  readonly breakpoints = input<SliderBreakpoints | undefined>(undefined);
  readonly loop = input(false);
  /** `true` = 5 s, a number = delay in ms. */
  readonly autoplay = input<boolean | number>(false);
  readonly speed = input(600);
  readonly navigation = input(false);
  readonly pagination = input(false);
  readonly centeredSlides = input(false);
  /** `fade` cross-fades the slides (use with `slidesPerView = 1`). */
  readonly effect = input<'slide' | 'fade'>('slide');
  /** Accessible name of the carousel. */
  readonly label = input('Slider');
  /** Emits the (real, loop-safe) index of the active slide whenever it changes. */
  readonly slideChange = output<number>();

  private readonly injector = inject(Injector);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly wrapper = viewChild.required<ElementRef<HTMLElement>>('wrapper');
  private readonly prevEl = viewChild<ElementRef<HTMLElement>>('prev');
  private readonly nextEl = viewChild<ElementRef<HTMLElement>>('next');
  private readonly dotsEl = viewChild<ElementRef<HTMLElement>>('dots');

  private swiper: Swiper | undefined;
  private observer: MutationObserver | undefined;
  private frame = 0;
  private initQueued = false;
  private destroyed = false;
  private pointerInside = false;
  private focusInside = false;
  private autoplayEnabled = false;
  /** The slide elements the current Swiper instance was created for. */
  private known = new Set<Element>();

  /**
   * Every input that requires a new Swiper instance – the effect below re-runs when one changes. Compared by value, so
   * a parent that hands in an equal-but-new `breakpoints` object on every change detection does not rebuild the slider.
   */
  private readonly config = computed(
    () => ({
      slidesPerView: this.slidesPerView(),
      spaceBetween: this.spaceBetween(),
      breakpoints: this.breakpoints(),
      loop: this.loop(),
      autoplay: this.autoplay(),
      speed: this.speed(),
      navigation: this.navigation(),
      pagination: this.pagination(),
      centeredSlides: this.centeredSlides(),
      effect: this.effect(),
    }),
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );

  constructor() {
    effect(() => {
      this.config();
      untracked(() => this.queueInit());
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      cancelAnimationFrame(this.frame);
      this.observer?.disconnect();
      this.destroySwiper(true);
    });
  }

  protected onPointer(event: PointerEvent, inside: boolean): void {
    if (event.pointerType === 'mouse') {
      this.pointerInside = inside;
      this.syncAutoplay();
    }
  }

  protected onFocus(event: FocusEvent, inside: boolean): void {
    // only keyboard focus counts – a mouse click on an arrow must not park the autoplay
    if (!inside || (event.target as Element).matches(':focus-visible')) {
      this.focusInside = inside;
      this.syncAutoplay();
    }
  }

  /**
   * Stops the autoplay while the pointer / keyboard focus is inside and restarts it afterwards. (Swiper's own
   * `autoplay.pause()` resumes by itself when a transition ends, so it cannot hold the slider in place.)
   */
  private syncAutoplay(): void {
    const swiper = this.swiper;
    if (!swiper || !this.autoplayEnabled) {
      return;
    }
    const hold = this.pointerInside || this.focusInside;
    if (hold && swiper.autoplay.running) {
      swiper.autoplay.stop();
    } else if (!hold && !swiper.autoplay.running) {
      swiper.autoplay.start();
    }
  }

  /** Programmatic control, e.g. from a custom pager: `readonly slider = viewChild(SliderComponent)`. */
  next(): void {
    this.swiper?.slideNext();
  }

  prev(): void {
    this.swiper?.slidePrev();
  }

  slideTo(index: number): void {
    const swiper = this.swiper;
    if (!swiper) {
      return;
    }
    // loop mode addresses the slides through their "real" index
    if (swiper.params.loop) {
      swiper.slideToLoop(index);
    } else {
      swiper.slideTo(index);
    }
  }

  /** (Re)creates Swiper after the current render, so the view queries (arrows, dots) are up to date. */
  private queueInit(): void {
    if (this.initQueued) {
      return;
    }
    this.initQueued = true;
    afterNextRender(
      () => {
        this.initQueued = false;
        if (!this.destroyed) {
          this.init(true);
        }
      },
      { injector: this.injector },
    );
  }

  private init(restoreOrder: boolean): void {
    this.destroySwiper(restoreOrder);
    const slides = this.slideElements();
    this.known = new Set(slides);
    const options = this.buildOptions(slides.length);
    this.autoplayEnabled = !!options.autoplay;
    const swiper = new Swiper(this.root().nativeElement, options);
    swiper.on('slideChange', () => {
      if (!this.destroyed) {
        this.slideChange.emit(swiper.realIndex);
      }
    });
    this.swiper = swiper;
    this.syncAutoplay();
    this.watchSlides();
  }

  private destroySwiper(restoreOrder: boolean): void {
    const swiper = this.swiper;
    this.swiper = undefined;
    if (!swiper || swiper.destroyed) {
      return;
    }
    // tearing the instance down slides once more (loop mode) – that must not be reported as a slide change
    swiper.off('slideChange');
    if (!restoreOrder) {
      // the slide list itself changed: don't let Swiper "restore" an order that no longer exists
      swiper.params.loop = false;
    }
    swiper.destroy(true, true);
  }

  /** The real (non-cloned) slides, in DOM order. */
  private slideElements(): HTMLElement[] {
    return Array.from(this.wrapper().nativeElement.children).filter(
      (el): el is HTMLElement =>
        el.classList.contains('swiper-slide') && !el.classList.contains('swiper-slide-duplicate'),
    );
  }

  /** Re-creates the slider when the projected slides are added or removed (Swiper's own DOM moves are ignored). */
  private watchSlides(): void {
    if (this.observer) {
      return;
    }
    this.observer = new MutationObserver(() => {
      const slides = this.slideElements();
      const unchanged =
        slides.length === this.known.size && slides.every((slide) => this.known.has(slide));
      if (unchanged || this.frame) {
        return;
      }
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        if (!this.destroyed) {
          this.init(false);
        }
      });
    });
    this.observer.observe(this.wrapper().nativeElement, { childList: true });
  }

  private buildOptions(slideCount: number): SwiperOptions {
    const slidesPerView = this.slidesPerView();
    const breakpoints = this.breakpoints();
    const autoplay = this.autoplay();
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Swiper's loop mode needs more slides than are visible at once
    const widest = Math.max(
      typeof slidesPerView === 'number' ? slidesPerView : 1,
      ...Object.values(breakpoints ?? {}).map((bp) => bp.slidesPerView ?? 0),
    );
    const canLoop = this.loop() && slideCount > (slidesPerView === 'auto' ? 2 : widest);
    const fade = this.effect() === 'fade';

    return {
      modules: [Navigation, Pagination, Autoplay, EffectFade, A11y],
      slidesPerView: fade ? 1 : slidesPerView,
      spaceBetween: fade ? 0 : this.spaceBetween(),
      centeredSlides: this.centeredSlides(),
      breakpoints:
        breakpoints && !fade ? ({ ...breakpoints } as SwiperOptions['breakpoints']) : undefined,
      loop: canLoop,
      speed: this.speed(),
      grabCursor: true,
      watchOverflow: true,
      effect: fade ? 'fade' : 'slide',
      fadeEffect: { crossFade: true },
      autoplay:
        autoplay && !reducedMotion
          ? {
              delay: typeof autoplay === 'number' ? autoplay : DEFAULT_AUTOPLAY_DELAY,
              disableOnInteraction: false,
              pauseOnMouseEnter: false, // handled on the whole component, see onPointer()
            }
          : false,
      navigation:
        this.navigation() && this.prevEl() && this.nextEl()
          ? { prevEl: this.prevEl()!.nativeElement, nextEl: this.nextEl()!.nativeElement }
          : false,
      pagination:
        this.pagination() && this.dotsEl()
          ? { el: this.dotsEl()!.nativeElement, clickable: true }
          : false,
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        paginationBulletMessage: 'Go to slide {{index}}',
      },
    };
  }
}
