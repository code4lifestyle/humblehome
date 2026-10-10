import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';
import { HeaderActionsComponent } from '../header-actions/header-actions.component';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * Site header (owner: shell agent).
 *  – white row (phone box · logo · search / wishlist) and a hamburger that opens the off-canvas menu;
 *  – sticky: once the header has scrolled out of view a compact bar (logo · icons) slides in from the top;
 *  – publishes the compact bar's height as `--header-height` (and `scroll-padding-top`) on <html>, so anchors and
 *    `position: sticky` sidebars never sit under it.
 */
@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    SvgIconComponent,
    HeaderActionsComponent,
    MobileMenuComponent,
    SearchModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly site = SITE_CONFIG;

  /** The compact sticky bar is slid into view. */
  protected readonly stickyVisible = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly stickyBar = viewChild.required<ElementRef<HTMLElement>>('stickyBar');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const root = document.documentElement;
      let showAfter = 0;

      const measure = () => {
        // static header height (+100px, like the theme's `header-sticky` "hide" threshold)
        showAfter = this.host.nativeElement.offsetHeight + 100;
        const barHeight = this.stickyBar().nativeElement.offsetHeight;
        root.style.setProperty('--header-height', `${barHeight}px`);
        root.style.scrollPaddingTop = `${barHeight + 16}px`;
        update();
      };
      const update = () => this.stickyVisible.set(window.scrollY > showAfter);

      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(this.host.nativeElement);
      resizeObserver.observe(this.stickyBar().nativeElement);
      window.addEventListener('scroll', update, { passive: true });
      measure();

      destroyRef.onDestroy(() => {
        resizeObserver.disconnect();
        window.removeEventListener('scroll', update);
        root.style.removeProperty('--header-height');
        root.style.scrollPaddingTop = '';
      });
    });
  }
}
