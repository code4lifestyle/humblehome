import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '@core/services/content.service';
import { BestSellerSectionComponent } from '@shared/sections/best-seller-section/best-seller-section.component';
import { ProductVideoSectionComponent } from '@shared/sections/product-video-section/product-video-section.component';
import { TestimonialSliderComponent } from '@shared/sections/testimonial-slider/testimonial-slider.component';
import { TrendingSectionComponent } from '@shared/sections/trending-section/trending-section.component';
import { HomeCategoriesComponent } from './sections/categories/categories.component';
import { HomeDesignStoriesComponent } from './sections/design-stories/design-stories.component';
import { HomeFlatDiscountComponent } from './sections/flat-discount/flat-discount.component';
import { HomeHeroComponent } from './sections/hero/hero.component';
import { HomeLatestNewsComponent } from './sections/latest-news/latest-news.component';
import { HomeLuxuryComponent } from './sections/luxury/luxury.component';
import { HomeNewArrivalsComponent } from './sections/new-arrivals/new-arrivals.component';
import { HomePromoComponent } from './sections/promo/promo.component';
import { HomeTopRatedComponent } from './sections/top-rated/top-rated.component';

/**
 * Home page (`/`) – the original index.html, section by section:
 * hero · categories slider · promo boxes · top rated products · product video* · trending* · new arrivals · best seller* ·
 * luxury TV cabinets · flat discount countdown · design stories · testimonials* · latest news   (* = shared section).
 * The route title ("Livora") is set by the router.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeHeroComponent,
    HomeCategoriesComponent,
    HomePromoComponent,
    HomeTopRatedComponent,
    ProductVideoSectionComponent,
    TrendingSectionComponent,
    HomeNewArrivalsComponent,
    BestSellerSectionComponent,
    HomeLuxuryComponent,
    HomeFlatDiscountComponent,
    HomeDesignStoriesComponent,
    TestimonialSliderComponent,
    HomeLatestNewsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly content = inject(ContentService);
}
