import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HELP_ICONS } from './help-card.icons';

/**
 * "Need some help or want to chat" card of the FAQ page and the policy pages (lives in the sticky sidebar under the
 * table-of-contents card). No inputs – the text and contact details are the original's placeholders.
 *
 *   <app-help-card />
 *
 * Look (original Elementor template 9714): outlined 20px card, 20px/700 heading (max 240px wide), divider, then a phone
 * and an e-mail line with 20px icons; the text turns accent on hover.
 */
@Component({
  selector: 'app-help-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-card.component.html',
  styleUrl: './help-card.component.scss',
})
export class HelpCardComponent {
  protected readonly icons = HELP_ICONS;
}
