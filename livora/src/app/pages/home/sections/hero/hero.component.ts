import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/**
 * Home hero – full-bleed photo with a 50 % dark overlay, the "Modern Living Starts Here" pill, the huge white h1 and the
 * "Shop Now" button (original: Elementor container 6348e1f, 800px min-height).
 */
@Component({
  selector: 'app-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HomeHeroComponent {}
