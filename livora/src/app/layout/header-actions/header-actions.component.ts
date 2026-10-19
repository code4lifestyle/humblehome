import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LayoutService } from '../layout.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * The icon cluster of the header: hamburger that opens the off-canvas menu.
 */
@Component({
  selector: 'app-header-actions',
  imports: [SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.scss',
})
export class HeaderActionsComponent {
  protected readonly layout = inject(LayoutService);
}
