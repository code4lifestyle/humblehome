import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '@core/data/site.data';
import { ContentService } from '@core/services/content.service';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';
import { ApproachSectionComponent } from '@shared/sections/approach-section/approach-section.component';
import { BestSellerSectionComponent } from '@shared/sections/best-seller-section/best-seller-section.component';
import { FaqPreviewSectionComponent } from '@shared/sections/faq-preview-section/faq-preview-section.component';
import { TestimonialSliderComponent } from '@shared/sections/testimonial-slider/testimonial-slider.component';
import { OFFER_BANNERS, OFFER_CHIPS, VISION_MISSION } from './about.data';

/**
 * /about-us – banner, then in the order of the original: best offer (two banners + six chips) with the vision & mission
 * cards, the shared "Our Approach" and "Best Seller" sections, the "Authorised Dealer" logo ticker, the team, the shared
 * testimonial slider and FAQ preview.
 */
@Component({
  selector: 'app-about-page',
  imports: [
    RouterLink,
    PageHeaderComponent,
    SectionTitleComponent,
    ApproachSectionComponent,
    BestSellerSectionComponent,
    TestimonialSliderComponent,
    FaqPreviewSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly content = inject(ContentService);

  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'About Us' },
  ];

  protected readonly offers = OFFER_BANNERS;
  protected readonly chips = OFFER_CHIPS;
  protected readonly visionMission = VISION_MISSION;

  /** The brand logos are rendered in 6 identical groups: the ticker slides by half of the track (3 groups) and loops. */
  protected readonly logos = this.content.brandLogos();
  protected readonly tickerCopies = [0, 1, 2, 3, 4, 5];

  protected readonly team = this.content.team();
  /** Social links of the team cards (the original leaves them as "#"; here they go to the networks, like the footer). */
  protected readonly social = SITE_CONFIG.social.map((link) => ({
    ...link,
    label: link.name === 'x' ? 'X' : link.name.charAt(0).toUpperCase() + link.name.slice(1),
  }));

  protected readonly testimonials = this.content.testimonials();
  protected readonly faqPreview = this.content.faqPreview();
}
