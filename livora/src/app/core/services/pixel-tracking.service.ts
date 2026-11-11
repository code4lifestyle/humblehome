import { Injectable } from '@angular/core';
import { TRACKING_PIXEL_IDS } from '../data/tracking.data';

interface MetaPixel {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
}

interface TikTokPixel extends Array<unknown> {
  methods?: string[];
  setAndDefer?: (target: TikTokPixel, method: string) => void;
  load?: (pixelId: string, options?: Record<string, unknown>) => void;
  page?: (...args: unknown[]) => void;
  _i?: Record<string, unknown>;
  _t?: Record<string, number>;
  _o?: Record<string, Record<string, unknown>>;
}

interface SnapchatPixel {
  (...args: unknown[]): void;
  queue: unknown[][];
  handleRequest?: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    fbq?: MetaPixel;
    ttq?: TikTokPixel;
    snaptr?: SnapchatPixel;
  }
}

@Injectable({ providedIn: 'root' })
export class PixelTrackingService {
  private initializedMetaId = '';
  private initializedTikTokId = '';
  private initializedSnapchatId = '';

  trackPageView(): void {
    const { meta, tiktok, snapchat } = TRACKING_PIXEL_IDS;

    if (meta) {
      this.trackMetaPageView(meta);
    }

    if (tiktok) {
      this.trackTikTokPageView(tiktok);
    }

    if (snapchat) {
      this.trackSnapchatPageView(snapchat);
    }
  }

  private trackMetaPageView(pixelId: string): void {
    let fbq = window.fbq;

    if (!fbq) {
      fbq = ((...args: unknown[]) => {
        if (fbq?.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq?.queue.push(args);
        }
      }) as MetaPixel;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.push = (...args: unknown[]) => fbq?.queue.push(args);
      window.fbq = fbq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }

    if (this.initializedMetaId !== pixelId) {
      fbq('init', pixelId);
      this.initializedMetaId = pixelId;
    }
    fbq('track', 'PageView');
  }

  private trackTikTokPageView(pixelId: string): void {
    const ttq = window.ttq ?? this.createTikTokQueue();
    window.ttq = ttq;

    if (this.initializedTikTokId !== pixelId) {
      ttq.load?.(pixelId);
      this.initializedTikTokId = pixelId;
    }
    ttq.page?.();
  }

  private createTikTokQueue(): TikTokPixel {
    const ttq: TikTokPixel = Object.assign([], {
      methods: [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie',
        'holdConsent',
        'revokeConsent',
        'grantConsent',
      ],
    });
    ttq.setAndDefer = (target: TikTokPixel, method: string) => {
      Object.assign(target, {
        [method]: (...args: unknown[]) => target.push([method, ...args]),
      });
    };
    for (const method of ttq.methods ?? []) {
      ttq.setAndDefer(ttq, method);
    }
    ttq.load = (id: string, options?: Record<string, unknown>) => {
      ttq._i ??= {};
      if (ttq._i[id]) {
        return;
      }
      ttq._i[id] = [];
      ttq._t ??= {};
      ttq._t[id] = Date.now();
      ttq._o ??= {};
      ttq._o[id] = options ?? {};

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`;
      document.head.appendChild(script);
    };
    return ttq;
  }

  private trackSnapchatPageView(pixelId: string): void {
    let snaptr = window.snaptr;

    if (!snaptr) {
      snaptr = ((...args: unknown[]) => {
        if (snaptr?.handleRequest) {
          snaptr.handleRequest(...args);
        } else {
          snaptr?.queue.push(args);
        }
      }) as SnapchatPixel;
      snaptr.queue = [];
      window.snaptr = snaptr;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://sc-static.net/scevent.min.js';
      document.head.appendChild(script);
    }

    if (this.initializedSnapchatId !== pixelId) {
      snaptr('init', pixelId);
      this.initializedSnapchatId = pixelId;
    }
    snaptr('track', 'PAGE_VIEW');
  }
}
