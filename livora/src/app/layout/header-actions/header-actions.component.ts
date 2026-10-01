import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { LayoutService } from '../layout.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * The icon cluster of the header: search (opens the overlay), wishlist and account with a live wishlist count, plus the
 * hamburger that opens the off-canvas menu on tablet / mobile.
 */
@Component({
  selector: 'app-header-actions',
  imports: [RouterLink, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.scss',
})
export class HeaderActionsComponent {
  protected readonly layout = inject(LayoutService);
  protected readonly wishlist = inject(WishlistService);

  protected itemsLabel(count: number): string {
    return count === 1 ? '1 item' : `${count} items`;
  }
}
