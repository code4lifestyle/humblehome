import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

interface ApproachItem {
  image: string;
  badge: string;
  title: string;
  text: string;
}

/**
 * "Our Approach / Thoughtfully Designed For Modern Living" – three highlight pills followed by three image cards with
 * an "UP TO 40% OFF" badge. Used on About and Testimonials.
 */
@Component({
  selector: 'app-approach-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './approach-section.component.html',
  styleUrl: './approach-section.component.scss',
})
export class ApproachSectionComponent {
  protected readonly highlights: string[] = [
    'Design With Purpose',
    'Premium Material',
    'Expert Craftsmanship',
  ];

  protected readonly items: ApproachItem[] = [
    {
      image: 'assets/images/approach-item-image-1.jpg',
      badge: 'UP TO 40% OFF',
      title: 'Design With Purpose',
      text: 'Only high-quality materials are chosen to ensure durability long-lasting performance.',
    },
    {
      image: 'assets/images/approach-item-image-2.jpg',
      badge: 'UP TO 40% OFF',
      title: 'Premium Material Selection',
      text: 'Only high-quality materials are chosen to ensure durability long-lasting performance.',
    },
    {
      image: 'assets/images/approach-item-image-3.jpg',
      badge: 'UP TO 40% OFF',
      title: 'Expert Craftsmanship',
      text: 'Only high-quality materials are chosen to ensure durability long-lasting performance.',
    },
  ];
}
