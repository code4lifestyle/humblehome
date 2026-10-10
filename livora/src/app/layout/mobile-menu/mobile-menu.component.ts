import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';
import { LayoutService } from '../layout.service';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * Off-canvas navigation: full-screen accent panel sliding in from the left with an
 * accordion for the sub menus (Shop shows the whole mega menu content). Opened through `LayoutService.openMobileMenu()`,
 * closes on Escape, on the close button and after every navigation; traps the keyboard focus while open.
 */
@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, RouterLinkActive, SvgIconComponent, MegaMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class MobileMenuComponent {
  protected readonly layout = inject(LayoutService);
  protected readonly site = SITE_CONFIG;
  protected readonly items = SITE_CONFIG.mainNav;

  /** Index of the expanded sub menu (one at a time). */
  protected readonly expanded = signal<number | null>(null);

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    // move the focus into the panel once it is visible (one frame later – the panel is still hidden in this one)
    afterRenderEffect(() => {
      if (this.layout.mobileMenuOpen()) {
        const button = this.closeButton().nativeElement;
        requestAnimationFrame(() => button.focus({ preventScroll: true }));
      }
    });

    // collapse the accordion whenever the menu closes
    effect(() => {
      if (!this.layout.mobileMenuOpen()) untracked(() => this.expanded.set(null));
    });
  }

  protected toggle(index: number): void {
    this.expanded.update((current) => (current === index ? null : index));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.layout.mobileMenuOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.layout.closeMobileMenu();
      return;
    }
    if (event.key !== 'Tab') return;

    // trap the focus inside the panel (ignoring collapsed accordion sections)
    const focusable = Array.from(
      this.panel().nativeElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((el) => !el.closest('[inert]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !this.panel().nativeElement.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
