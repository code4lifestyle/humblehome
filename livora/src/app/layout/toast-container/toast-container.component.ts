import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

/**
 * Renders the `ToastService` queue as Livora toasts: dark rounded card, type icon, accent action link, dismiss button.
 * Logic is owned by the orchestrator (ToastService); this component is only the presentation.
 */
@Component({
  selector: 'app-toast-container',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
