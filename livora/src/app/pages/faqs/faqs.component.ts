import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { ContentService } from '@core/services/content.service';
import { SeoService } from '@core/services/seo.service';
import { AccordionComponent } from '@shared/components/accordion/accordion.component';
import { HelpCardComponent } from '@shared/components/help-card/help-card.component';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { TocCardComponent, TocItem } from '@shared/components/toc-card/toc-card.component';

/**
 * /faqs – banner, then two columns like the original: a sticky sidebar (table of contents with the five group titles +
 * "Need some help or want to chat" card) and the main column with one `<h2 id=…>` + accordion per FAQ group. The
 * original opens the 3rd question of every group (`[openIndex]="2"`).
 */
@Component({
  selector: 'app-faqs-page',
  imports: [PageHeaderComponent, TocCardComponent, HelpCardComponent, AccordionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.scss',
})
export class FaqsComponent implements OnDestroy {
  private readonly content = inject(ContentService);

  private readonly seo = inject(SeoService);

  constructor() {
    // FAQPage JSON-LD from the FAQ data, questions and answers verbatim (25 questions).
    this.seo.setFaqJsonLd(this.content.faqGroups().flatMap((group) => group.items));
  }

  ngOnDestroy(): void {
    this.seo.clearJsonLd();
  }

  protected readonly crumbs: PageHeaderCrumb[] = [{ label: 'Home', link: '/' }, { label: 'FAQs' }];

  /** Static content – computed once, so the accordions get stable input arrays. */
  protected readonly groups = this.content.faqGroups().map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => ({ title: item.question, content: item.answer })),
  }));

  protected readonly toc: TocItem[] = this.groups.map((group) => ({
    label: group.title,
    fragment: group.id,
  }));
}
