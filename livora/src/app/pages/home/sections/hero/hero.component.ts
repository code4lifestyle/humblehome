import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/**
 * Home hero – left-aligned copy with the living-room photo on the right (stacked on tablet / mobile).
 */
@Component({
  selector: 'app-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HomeHeroComponent {}
