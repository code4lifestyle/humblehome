import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { NavLink } from '../core/models';

/**
 * UI state shared by the header pieces: off-canvas menu and search overlay. Both close on every navigation, lock the
 * page scroll while open and hand the keyboard focus back to the element that opened them.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly doc = inject(DOCUMENT);

  readonly mobileMenuOpen = signal(false);
  readonly searchOpen = signal(false);
  /** Current URL (after redirects) – lets the menus highlight the section a page belongs to. */
  readonly url = signal('/');

  private opener: HTMLElement | null = null;

  constructor() {
    const router = inject(Router);
    this.url.set(router.url);
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.url.set(e.urlAfterRedirects);
        this.closeAll(false);
      });

    effect(() => {
      const lock = this.mobileMenuOpen() || this.searchOpen();
      this.doc.documentElement.style.overflow = lock ? 'hidden' : '';
    });
  }

  /** True when the current page belongs to the menu item without being its own link target (product pages → Shop). */
  isSectionActive(item: NavLink): boolean {
    const url = this.url();
    return !!item.alsoActive?.some((prefix) => url.startsWith(prefix));
  }

  openMobileMenu(): void {
    this.rememberOpener();
    this.searchOpen.set(false);
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(restoreFocus = true): void {
    if (!this.mobileMenuOpen()) return;
    this.mobileMenuOpen.set(false);
    if (restoreFocus) this.restoreFocus();
  }

  openSearch(): void {
    this.rememberOpener();
    this.mobileMenuOpen.set(false);
    this.searchOpen.set(true);
  }

  closeSearch(restoreFocus = true): void {
    if (!this.searchOpen()) return;
    this.searchOpen.set(false);
    if (restoreFocus) this.restoreFocus();
  }

  closeAll(restoreFocus = true): void {
    this.closeMobileMenu(restoreFocus);
    this.closeSearch(restoreFocus);
  }

  private rememberOpener(): void {
    const active = this.doc.activeElement;
    this.opener = active instanceof HTMLElement && active !== this.doc.body ? active : null;
  }

  private restoreFocus(): void {
    const el = this.opener;
    this.opener = null;
    // wait for the overlay to become inert/hidden before moving the focus back
    setTimeout(() => el?.isConnected && el.focus({ preventScroll: true }));
  }
}
