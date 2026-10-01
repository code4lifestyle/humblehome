import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '@core/data/site.data';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

interface Story {
  /** Modifier class carrying the tile photo (see the SCSS). */
  photo: 1 | 2 | 3 | 4;
  label: string;
  url: string;
  /** Font Awesome classes, e.g. `fa-brands fa-instagram`. */
  icon: string;
}

/** Same order as the original tiles: Instagram, Facebook, Pinterest, X. The links are the ones of the footer. */
const NETWORKS: readonly { name: string; label: string }[] = [
  { name: 'instagram', label: 'Instagram' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'pinterest', label: 'Pinterest' },
  { name: 'x', label: 'X' },
];

/**
 * "Design Stories / Modern Living Inspirations" – four portrait tiles with a social icon that pops up on hover, followed
 * by the "Free · Let's make something great work together. Get Free Quote." line.
 * Original: Elementor container b50ba1b (the tiles autoplay a short muted clip there; here the poster photo is shown).
 */
@Component({
  selector: 'app-home-design-stories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './design-stories.component.html',
  styleUrl: './design-stories.component.scss',
})
export class HomeDesignStoriesComponent {
  protected readonly stories: readonly Story[] = NETWORKS.flatMap(({ name, label }, index) => {
    const link = SITE_CONFIG.social.find((s) => s.name === name);
    return link
      ? [{ photo: (index + 1) as Story['photo'], label, url: link.url, icon: link.icon }]
      : [];
  });
}
