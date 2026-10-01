import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqItem } from '@core/models/content.model';
import { AccordionComponent } from '@shared/components/accordion/accordion.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/**
 * "Frequently Asked Questions / Common Questions About Furniture Collections" – intro + "View All FAQ's" button on the
 * left, accordion of the first questions on the right. Used on About and Testimonials; the caller supplies the
 * questions (`ContentService.faqPreview()`).
 *
 *   <app-faq-preview-section [items]="content.faqPreview()" />
 */
@Component({
  selector: 'app-faq-preview-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AccordionComponent, SectionTitleComponent],
  templateUrl: './faq-preview-section.component.html',
  styleUrl: './faq-preview-section.component.scss',
})
export class FaqPreviewSectionComponent {
  readonly items = input<FaqItem[]>([]);

  /** `FaqItem` → the accordion's `{ title, content }`. */
  protected readonly accordionItems = computed(() =>
    this.items().map((item) => ({ title: item.question, content: item.answer })),
  );
}
