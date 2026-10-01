import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '@core/services/content.service';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { ApproachSectionComponent } from '@shared/sections/approach-section/approach-section.component';
import { FaqPreviewSectionComponent } from '@shared/sections/faq-preview-section/faq-preview-section.component';
import { ProductVideoSectionComponent } from '@shared/sections/product-video-section/product-video-section.component';
import { TrendingSectionComponent } from '@shared/sections/trending-section/trending-section.component';

/**
 * /testimonials – banner, a grid with the six customer testimonials (5 stars, quote, avatar, name + role, faint quotation
 * mark) and then the shared marketing sections of the original page: product video, trending, approach, FAQ preview.
 */
@Component({
  selector: 'app-testimonials-page',
  imports: [
    PageHeaderComponent,
    StarRatingComponent,
    ProductVideoSectionComponent,
    TrendingSectionComponent,
    ApproachSectionComponent,
    FaqPreviewSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
  private readonly content = inject(ContentService);

  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Testimonials' },
  ];
  protected readonly testimonials = this.content.testimonials();
  protected readonly faqPreview = this.content.faqPreview();
}
