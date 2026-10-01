/**
 * Site-wide QA crawler (Playwright + system Chrome).
 *
 *   node tools/check-links.mjs [baseUrl=http://localhost:4200 | --dist=tmp/<you>/browser] [--width=1440] [--max=250] [--quiet]
 *
 * Starts from a fixed list of seed routes (every route/param combination of the app) and then follows every internal
 * <a href>. For each visited page it reports:
 *   - pages that render the "Page Not Found" template although they are linked to (broken internal links + who links there)
 *   - JS console errors / uncaught exceptions
 *   - failed requests and images that did not load (naturalWidth === 0)
 *   - links that leave the SPA (plain href="…html", empty href="#" placeholders are counted separately)
 *   - horizontal overflow (page wider than the viewport – use --width=390 for the mobile check)
 *   - pages without any <h1>
 * Exit code 1 when something is broken.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { startAppServer } from './orig-server.mjs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const i = a.indexOf('='); return i < 0 ? [a.slice(2), 'true'] : [a.slice(2, i), a.slice(i + 1)]; }));
// --dist=<built app folder, e.g. tmp/orch/browser> serves that build in-process (no dev server needed)
const distServer = opt.dist ? await startAppServer(path.resolve(opt.dist)) : null;
const base = (distServer?.origin ?? args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4200').replace(/\/$/, '');
const width = Number(opt.width) || 1440;
const max = Number(opt.max) || 250;

const productSlugs = ['modern-wooden-table', 'scandinavian-wooden-table', 'luxury-tufted-velvet-sofa', 'wooden-dining-chair', 'leather-recliner', 'storage-cabinet', 'wooden-cabinet', 'wooden-cupboard', 'premium-relax-accent-chair', 'lounge-chair', 'contemporary-leather-sofa', 'wooden-coffee-table'];
const categories = ['bedroom', 'dining-room', 'living-room', 'luxury-collection', 'office-furniture'];
const brands = ['elite-comfort', 'livora-home', 'nordic-living', 'urbannest', 'woodcraft-studio'];
const posts = ['modern-interior-trends', 'home-styling-tips', 'furniture-care-guides', 'space-saving-ideas'];
const policies = ['privacy-policy', 'terms-conditions', 'cancellation-policy', 'delivery-policy', 'refunds-returns-policy'];

const seeds = [
  '/', '/about-us', '/shop', '/shop?page=2', '/shop?orderby=price-asc', '/cart', '/checkout', '/wishlist', '/my-account', '/my-account/lost-password',
  '/blog', '/category/uncategorized', '/tag/luxury', '/tag/performance', '/tag/quality', '/contact-us', '/faqs', '/testimonials', '/404',
  ...productSlugs.map((s) => `/product/${s}`),
  ...categories.map((s) => `/product-category/${s}`),
  ...brands.map((s) => `/brand/${s}`),
  ...posts.map((s) => `/blog/${s}`),
  ...policies.map((s) => `/policy/${s}`),
];

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({ viewport: { width, height: 900 } });

const norm = (u) => { const x = new URL(u, base); x.hash = ''; return x.pathname.replace(/\/$/, '') + x.search || '/'; };
const queue = [...new Set(seeds.map(norm))];
const seen = new Set(queue);
const linkedFrom = new Map(); // target -> Set(source)
const report = { notFound: [], errors: [], badImages: [], external: new Set(), placeholders: 0, overflow: [], noH1: [], visited: 0 };

while (queue.length && report.visited < max) {
  const path = queue.shift();
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`exception: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && problems.push(`console.error: ${m.text().slice(0, 200)}`));
  page.on('response', (r) => r.status() >= 400 && r.url().startsWith(base) && problems.push(`HTTP ${r.status()} ${r.url().replace(base, '')}`));
  try {
    await page.goto(base + path, { waitUntil: 'load', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(400);
    // scroll to trigger lazy images
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(300);

    const info = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.textContent?.trim() ?? '';
      const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '');
      const badImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.getAttribute('src'));
      // html/body use `overflow-x: clip`, which hides overflow from documentElement.scrollWidth – body.scrollWidth still grows
      const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      return { h1, links, badImgs, overflow: width - window.innerWidth, path: location.pathname + location.search };
    });
    report.visited++;

    if (/page not found/i.test(info.h1) && path !== '/404') {
      report.notFound.push({ path, from: [...(linkedFrom.get(path) ?? [])].slice(0, 4) });
    }
    if (!info.h1 && path !== '/404') report.noH1.push(path);
    if (problems.length) report.errors.push({ path, problems: [...new Set(problems)].slice(0, 6) });
    if (info.badImgs.length) report.badImages.push({ path, images: [...new Set(info.badImgs)].slice(0, 6) });
    if (info.overflow > 2) report.overflow.push({ path, by: info.overflow });

    for (const href of info.links) {
      if (!href || href === '#') { report.placeholders++; continue; }
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
      if (/^https?:\/\//i.test(href) && !href.startsWith(base)) { report.external.add(href); continue; }
      if (href.startsWith('#')) continue;
      if (/\.html?(\?|$)/i.test(href)) { problems.push(`legacy .html link: ${href}`); report.errors.push({ path, problems: [`legacy .html link: ${href}`] }); continue; }
      const target = norm(href);
      if (!linkedFrom.has(target)) linkedFrom.set(target, new Set());
      linkedFrom.get(target).add(path);
      if (!seen.has(target)) { seen.add(target); queue.push(target); }
    }
  } catch (e) {
    report.errors.push({ path, problems: [`navigation failed: ${e.message.split('\n')[0]}`] });
  } finally {
    await page.close();
  }
}
await browser.close();
await distServer?.close();

const line = (s) => console.log(s);
line(`\n=== Link check @ ${base}  (viewport ${width}px)  visited ${report.visited} page(s), ${seen.size} unique URLs discovered ===`);
line(`Broken internal links (render "Page Not Found"): ${report.notFound.length}`);
report.notFound.forEach((x) => line(`  ✗ ${x.path}   ← linked from ${x.from.join(', ') || '(seed)'}`));
line(`Pages with errors: ${report.errors.length}`);
report.errors.forEach((x) => line(`  ✗ ${x.path}\n      ${x.problems.join('\n      ')}`));
line(`Broken images: ${report.badImages.length}`);
report.badImages.forEach((x) => line(`  ✗ ${x.path}: ${x.images.join(', ')}`));
line(`Horizontal overflow: ${report.overflow.length}`);
report.overflow.forEach((x) => line(`  ✗ ${x.path} (+${x.by}px)`));
line(`Pages without <h1>: ${report.noH1.length}${report.noH1.length ? '  ' + report.noH1.join(', ') : ''}`);
line(`Empty "#" placeholder links: ${report.placeholders}   External links: ${report.external.size}`);
if (!opt.quiet && report.external.size) [...report.external].slice(0, 15).forEach((u) => line(`   → ${u}`));

const bad = report.notFound.length + report.errors.length + report.badImages.length;
process.exit(bad ? 1 : 0);
