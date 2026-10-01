/**
 * Screenshot helper for visual QA (uses the system Chrome through playwright-core – no browser download).
 *
 *   node tools/shot.mjs <url> <out.png> [options]
 *
 * Options
 *   --width=1440        viewport width  (use 390 for a mobile check, 820 for tablet)
 *   --height=900        viewport height
 *   --full              capture the full scrollable page instead of just the viewport
 *   --slice=1300        with --full: split the page into N-px-tall files (out-1.png, out-2.png …) so they stay readable
 *   --clip=x,y,w,h      capture only this rectangle (page coordinates, implies --full)
 *   --selector=CSS      capture only the first element matching this selector
 *   --orig              the page is the ORIGINAL WordPress mirror: hide preloader/cursor and force scroll-reveal
 *                       elements visible so the screenshot shows the finished design
 *   --wait=800          extra ms to wait after load/scrolling (animations, images)
 *   --actions=js        JS run in the page before the shot (e.g. click a menu:  --actions="document.querySelector('.x').click()")
 *
 *   --dist=<folder>     serve a BUILT app folder (e.g. tmp/<you>/browser after `ng build --output-path tmp/<you>`) from a private
 *                       in-process server with SPA fallback; <url> is then just the route, e.g. /shop  (use it when no dev
 *                       server is running)
 *
 * Where the page comes from
 *   http://localhost:8090/…   the ORIGINAL WordPress mirror – you never have to start anything: this command serves the mirror
 *                             itself from a private in-process server (random port) for the duration of the run
 *   http://localhost:<port>/  your own `ng serve` dev server
 *   --dist=<folder>           see above
 *
 * Examples
 *   node tools/shot.mjs http://localhost:8090/index.html shots/orig-home.png --full --slice=1300 --orig
 *   node tools/shot.mjs http://localhost:4201/ shots/new-home.png --full --slice=1300
 *   node tools/shot.mjs /shop shots/new-shop.png --dist=tmp/shop/browser --full --slice=1300
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startAppServer, startOriginalServer } from './orig-server.mjs';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const [url, out] = positional;
if (!url || !out) {
  console.error('usage: node tools/shot.mjs <url> <out.png> [--width=1440] [--full] [--slice=1300] [--orig] ...');
  process.exit(1);
}
const opts = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const i = a.indexOf('=');
      return i === -1 ? [a.slice(2), 'true'] : [a.slice(2, i), a.slice(i + 1)];
    }),
);

const width = Number(opts.width) || 1440;
const height = Number(opts.height) || 900;
const wait = opts.wait !== undefined ? Number(opts.wait) : 800;

// private in-process servers (closed at the end) – see the header comment
const servers = [];
let target = url;
const originalMatch = /^https?:\/\/(?:localhost|127\.0\.0\.1):8090(\/.*)?$/i.exec(url);
if (opts.dist) {
  const srv = await startAppServer(path.resolve(opts.dist));
  servers.push(srv);
  target = srv.origin + (url.startsWith('/') ? url : '/' + url.replace(/^https?:\/\/[^/]+\/?/i, ''));
} else if (originalMatch) {
  const srv = await startOriginalServer();
  servers.push(srv);
  target = srv.origin + (originalMatch[1] ?? '/');
}
const isLocal = (u) => u.startsWith('http://localhost') || u.startsWith('http://127.0.0.1');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await context.newPage();

const problems = [];
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`[console.error] ${m.text()}`);
});
page.on('requestfailed', (r) => {
  const u = r.url();
  if (isLocal(u)) problems.push(`[requestfailed] ${u}`);
});
page.on('response', (r) => {
  if (r.status() >= 400 && isLocal(r.url())) problems.push(`[http ${r.status()}] ${r.url()}`);
});

await page.goto(target, { waitUntil: 'load', timeout: 60000 });
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

if (opts.orig) {
  await page.addStyleTag({
    content: `
      .theme-preloader, #magic-cursor { display: none !important; }
      .elementor-invisible { visibility: visible !important; opacity: 1 !important; animation: none !important; }
      /* GSAP/SplitText heading + image reveal animations start hidden */
      .at-heading-animation, .at-heading-animation * { opacity: 1 !important; visibility: visible !important; transform: none !important; }
      .at-animation-image-style-1 img, .at-image-animation img, .at-image-animation { clip-path: none !important; opacity: 1 !important; visibility: visible !important; transform: none !important; }
      /* WebGL "distortion" images: show the plain <img> instead of the (headless-broken) canvas */
      .at-distortion-effect canvas { display: none !important; }
      .at-distortion-effect img { opacity: 1 !important; visibility: visible !important; display: block !important; }
    `,
  });
}

if (opts.orig) {
  // the mirror's <img srcset> still points at the live demo site – use the local `src` and load everything eagerly
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach((img) => {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.loading = 'eager';
      const lazy = img.getAttribute('data-src');
      if (lazy) img.src = lazy;
    });
  });
}

// scroll through the page so lazy images / scroll-reveal animations run
const total = await page.evaluate(async () => {
  const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
  let y = 0;
  const max = () => document.documentElement.scrollHeight;
  while (y < max()) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
    y += step;
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 200));
  return max();
});

// wait (max 8s) until every image finished loading
await page
  .evaluate(
    () =>
      Promise.race([
        Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })))),
        new Promise((r) => setTimeout(r, 8000)),
      ]),
  )
  .catch(() => {});

if (opts.actions) {
  await page.evaluate(opts.actions);
}
await page.waitForTimeout(wait);

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

if (opts.selector) {
  await page.locator(opts.selector).first().screenshot({ path: out });
  console.log(`saved ${out} (selector ${opts.selector})`);
} else if (opts.clip) {
  const [x, y, w, h] = opts.clip.split(',').map(Number);
  await page.screenshot({ path: out, fullPage: true, clip: { x, y, width: w, height: h } });
  console.log(`saved ${out} (clip ${opts.clip})`);
} else if (opts.full && opts.slice) {
  // one full-page capture, then crop it into readable slices with Pillow (much faster than one capture per slice)
  const slice = Number(opts.slice) || 1300;
  const whole = out.replace(/\.png$/i, '') + '-whole.png';
  await page.screenshot({ path: whole, fullPage: true });
  const sliceScript = path.join(path.dirname(fileURLToPath(import.meta.url)), 'slice.py');
  const py = spawnSync('python', [sliceScript, whole, String(slice), out.replace(/\.png$/i, '')], { encoding: 'utf8' });
  console.log(py.stdout.trim() || py.stderr.trim());
  fs.rmSync(whole, { force: true });
} else {
  await page.screenshot({ path: out, fullPage: !!opts.full });
  console.log(`saved ${out}${opts.full ? ` (full page ${total}px)` : ''}`);
}

if (problems.length) {
  console.log('--- browser problems ---');
  for (const p of [...new Set(problems)].slice(0, 25)) console.log(p);
}
await browser.close();
for (const s of servers) await s.close();
