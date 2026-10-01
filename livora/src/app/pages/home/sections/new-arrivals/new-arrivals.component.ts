import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

interface ArrivalTile {
  name: string;
  /** Modifier class carrying the photo (see the SCSS): arrivals-item-image-2 … 5. */
  photo: 2 | 3 | 4 | 5;
}

/**
 * "New Arrivals / Newly Arrived Furniture" on a cream band: intro paragraph, one large "Style Meets Comfort" card with the
 * "Up to 40% Off" pill and a "Shop Now" button, and four photo tiles (Marble Side Table, Minimal Study Desk,
 * Living Room Sofa, Wooden TV Console). Original: Elementor container 6a8a040.
 */
@Component({
  selector: 'app-home-new-arrivals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './new-arrivals.component.html',
  styleUrl: './new-arrivals.component.scss',
})
export class HomeNewArrivalsComponent {
  protected readonly tiles: readonly ArrivalTile[] = [
    { name: 'Marble Side Table', photo: 2 },
    { name: 'Minimal Study Desk', photo: 3 },
    { name: 'Living Room Sofa', photo: 4 },
    { name: 'Wooden TV Console', photo: 5 },
  ];
}
