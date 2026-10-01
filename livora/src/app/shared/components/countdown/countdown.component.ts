import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

/** Accepts a Date, an ISO string, or the original site's "2027-05-21 12:00" format (read as local time). */
function toMillis(value: string | Date): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  const text = String(value).trim();
  return new Date(
    /^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}/.test(text) ? text.replace(' ', 'T') : text,
  ).getTime();
}

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Days / Hours / Minutes / Seconds countdown (the "Flat Discount" block on the home page). Ticks once a second and
 * stops by itself; when the target has passed it shows "Countdown is finished!".
 *
 *   <app-countdown target="2027-05-21T12:00:00" />
 *
 * Text is white by default (it is designed for the dark section) – override with `--countdown-color`.
 */
@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent {
  /** End of the countdown – ISO string or Date. */
  readonly target = input.required<string | Date>();
  /** Message shown once the target has passed. */
  readonly finishedText = input('Countdown is finished!');

  private readonly now = signal(Date.now());
  private readonly ready = signal(false);
  private timer: ReturnType<typeof setInterval> | undefined;

  private readonly targetMs = computed(() => toMillis(this.target()));

  /** Milliseconds left, never negative. */
  private readonly remaining = computed(() => Math.max(0, this.targetMs() - this.now()));

  protected readonly finished = computed(
    () => !Number.isFinite(this.targetMs()) || this.remaining() <= 0,
  );

  protected readonly units = computed(() => {
    const total = Math.floor(this.remaining() / 1000);
    return [
      { key: 'days', label: 'Days', value: pad(Math.floor(total / 86400)) },
      { key: 'hours', label: 'Hours', value: pad(Math.floor((total % 86400) / 3600)) },
      { key: 'minutes', label: 'Minutes', value: pad(Math.floor((total % 3600) / 60)) },
      { key: 'seconds', label: 'Seconds', value: pad(total % 60) },
    ];
  });

  protected readonly summary = computed(() =>
    this.units()
      .map((u) => `${Number(u.value)} ${u.label.toLowerCase()}`)
      .join(', '),
  );

  constructor() {
    afterNextRender(() => this.ready.set(true));

    // (re)start the once-a-second tick whenever the target changes; it stops itself when the time is up
    effect(() => {
      const target = this.targetMs();
      if (!this.ready()) {
        return;
      }
      untracked(() => {
        this.stop();
        this.now.set(Date.now());
        if (Number.isFinite(target) && target > Date.now()) {
          this.timer = setInterval(() => this.tick(), 1000);
        }
      });
    });

    inject(DestroyRef).onDestroy(() => this.stop());
  }

  private tick(): void {
    const now = Date.now();
    this.now.set(now);
    if (now >= this.targetMs()) {
      this.stop();
    }
  }

  private stop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
