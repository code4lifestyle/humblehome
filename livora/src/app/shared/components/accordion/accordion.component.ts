import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';

let nextUid = 0;

/**
 * Accessible accordion in the look of the original ElementsKit FAQ accordion: cream rows with a numbered question,
 * a black +/− disc on the right, divider between question and answer. Plain-text content.
 *
 *   <app-accordion [items]="faq" [multi]="false" [openFirst]="true" />   // or [openIndex]="2" for the 3rd row
 *
 * Keyboard: Enter/Space toggle (native buttons); ↑/↓/Home/End move between the questions.
 */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  readonly items = input<{ title: string; content: string }[]>([]);
  /** Allow several rows to be open at the same time. */
  readonly multi = input(false);
  /** Open the first row initially. */
  readonly openFirst = input(true);
  /**
   * Row (0-based) to open initially. When set it takes precedence over `openFirst` – e.g. the original FAQ page
   * opens the 3rd question of every group (`[openIndex]="2"`). An index outside the list opens nothing.
   */
  readonly openIndex = input<number | null>(null);
  /** Prefix the questions with "1." "2." … like the original. */
  readonly numbered = input(true);

  protected readonly uid = `acc-${nextUid++}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Only a real change of the questions (not a new array with the same content) or of the initial row resets the state.
  private readonly resetKey = computed(
    () =>
      `${this.openIndex() ?? (this.openFirst() ? 'first' : 'none')}|${this.items()
        .map((i) => i.title)
        .join('\u0001')}`,
  );

  /** Indexes of the open rows. */
  protected readonly open = linkedSignal<string, ReadonlySet<number>>({
    source: this.resetKey,
    computation: () => {
      const count = this.items().length;
      const index = this.openIndex() ?? (this.openFirst() ? 0 : null);
      return index !== null && Number.isInteger(index) && index >= 0 && index < count
        ? new Set([index])
        : new Set<number>();
    },
  });

  protected isOpen(index: number): boolean {
    return this.open().has(index);
  }

  protected toggle(index: number): void {
    this.open.update((current) => {
      if (current.has(index)) {
        const next = new Set(current);
        next.delete(index);
        return next;
      }
      return this.multi() ? new Set(current).add(index) : new Set([index]);
    });
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const last = this.items().length - 1;
    let target: number;
    switch (event.key) {
      case 'ArrowDown':
        target = index === last ? 0 : index + 1;
        break;
      case 'ArrowUp':
        target = index === 0 ? last : index - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.trigger')[target]?.focus();
  }
}
