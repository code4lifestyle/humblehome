import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MegaMenu } from '../../core/models';

/**
 * Content of the Shop mega menu: "Shop By Collection" + "Shop Features" link lists, two image tiles and the promo tile.
 * Used inside the desktop panel of `app-main-nav` and inside the accordion of `app-mobile-menu`.
 */
@Component({
  selector: 'app-mega-menu',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mega-menu.component.html',
  styleUrl: './mega-menu.component.scss',
})
export class MegaMenuComponent {
  readonly data = input.required<MegaMenu>();
}
