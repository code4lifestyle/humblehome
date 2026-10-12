import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '@core/services/content.service';
import { TestimonialSliderComponent } from '@shared/sections/testimonial-slider/testimonial-slider.component';
import { HomeCategoriesComponent } from './sections/categories/categories.component';
import { HomeHeroComponent } from './sections/hero/hero.component';
import { HomeStoryComponent } from './sections/story/story.component';

/**
 * Home page (`/`): hero, Humble Home story, categories, and testimonials.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeHeroComponent,
    HomeStoryComponent,
    HomeCategoriesComponent,
    TestimonialSliderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly content = inject(ContentService);
}
