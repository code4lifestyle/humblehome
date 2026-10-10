import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '@core/services/content.service';
import { BestSellerSectionComponent } from '@shared/sections/best-seller-section/best-seller-section.component';
import { ProductVideoSectionComponent } from '@shared/sections/product-video-section/product-video-section.component';
import { TestimonialSliderComponent } from '@shared/sections/testimonial-slider/testimonial-slider.component';
import { HomeCategoriesComponent } from './sections/categories/categories.component';
import { HomeHeroComponent } from './sections/hero/hero.component';
import { HomeStoryComponent } from './sections/story/story.component';

/**
 * Home page (`/`): hero, Humble Home story, categories, product video,
 * best sellers, and testimonials.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeHeroComponent,
    HomeStoryComponent,
    HomeCategoriesComponent,
    ProductVideoSectionComponent,
    BestSellerSectionComponent,
    TestimonialSliderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly content = inject(ContentService);
}
