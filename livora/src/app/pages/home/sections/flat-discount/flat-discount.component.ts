import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { readStorage, writeStorage } from '@core/services/storage.util';
import { CountdownComponent } from '@shared/components/countdown/countdown.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/** localStorage key holding the ISO end date of the running "flat discount" campaign. */
const DEADLINE_KEY = 'livora.home.flat-discount.ends';
/** Length of one campaign. */
const CAMPAIGN_DAYS = 15;
const DAY_MS = 86_400_000;

/**
 * The countdown must keep ticking for every visitor (the original counts down to a fixed 2027 date). The end date is
 * therefore "15 days after the visitor's first visit", computed once and remembered in localStorage; when it has passed
 * (or storage is unavailable) a fresh 15-day campaign starts, so the timer never shows "finished" on the home page.
 * The extra second makes the very first render read "15 Days 00 Hours 00 Minutes 00 Seconds".
 */
function campaignDeadline(): string {
  const stored = readStorage<string | null>(DEADLINE_KEY, null);
  if (typeof stored === 'string' && Date.parse(stored) > Date.now()) {
    return stored;
  }
  const next = new Date(Date.now() + CAMPAIGN_DAYS * DAY_MS + 1000).toISOString();
  writeStorage(DEADLINE_KEY, next);
  return next;
}

/**
 * "Flat Discount / Discover Amazing Flat Furniture Discounts Today" on the dark band: paragraph, live countdown and
 * "Buy Now" button on the left, the photo masked into a five-tile mosaic (`discount-image-mask.svg`) on the right.
 * Original: Elementor container 09fc6c9.
 */
@Component({
  selector: 'app-home-flat-discount',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CountdownComponent, SectionTitleComponent],
  templateUrl: './flat-discount.component.html',
  styleUrl: './flat-discount.component.scss',
})
export class HomeFlatDiscountComponent {
  protected readonly deadline = campaignDeadline();
}
