import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, IconDef, IconName } from './icon-paths';

/**
 * Inline SVG icon (header/footer icons of the original theme). Sized with `font-size` (1em × 1em) and coloured with
 * `color` (fill = currentColor):   <app-svg-icon name="search" />
 */
@Component({
  selector: 'app-svg-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    [attr.viewBox]="icon().viewBox"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="icon().d" [attr.fill-rule]="icon().fillRule ?? 'nonzero'" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 1em;
      height: 1em;
      line-height: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class SvgIconComponent {
  readonly name = input.required<IconName>();
  protected readonly icon = computed(() => ICONS[this.name()] as IconDef);
}
