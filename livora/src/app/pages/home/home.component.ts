import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '@core/services/content.service';
import { BestSellerSectionComponent } from '@shared/sections/best-seller-section/best-seller-section.component';
import { ProductVideoSectionComponent } from '@shared/sections/product-video-section/product-video-section.component';
import { TestimonialSliderComponent } from '@shared/sections/testimonial-slider/testimonial-slider.component';
import { TrendingSectionComponent } from '@shared/sections/trending-section/trending-section.component';
import { HomeCategoriesComponent } from './sections/categories/categories.component';
import { HomeHeroComponent } from './sections/hero/hero.component';
import { HomeLuxuryComponent } from './sections/luxury/luxury.component';
import { HomeNewArrivalsComponent } from './sections/new-arrivals/new-arrivals.component';
import { HomeTopRatedComponent } from './sections/top-rated/top-rated.component';

/**
 * Home page (`/`): hero, categories, top rated, product video, trending, new arrivals,
 * best sellers, luxury cabinets, and testimonials.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeHeroComponent,
    HomeCategoriesComponent,
    HomeTopRatedComponent,
    ProductVideoSectionComponent,
    TrendingSectionComponent,
    HomeNewArrivalsComponent,
    BestSellerSectionComponent,
    HomeLuxuryComponent,
    TestimonialSliderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly content = inject(ContentService);
}
