/**
 * Tiny in-process static servers, so no long-running background process is needed.
 *
 *   startOriginalServer()      serves the ORIGINAL WordPress mirror (the parent folder of livora-angular)
 *   startAppServer(dir)        serves a built Angular app folder (e.g. tmp/<you>/browser) with SPA fallback to index.html
 *
 * Both listen on a random free port on 127.0.0.1 and return { origin, port, close() }. tools/shot.mjs uses them
 * automatically:  http://localhost:8090/…  → the original mirror,  --dist=<dir>  → your built app.
 * In your own Playwright/Node scripts:
 *     import { startOriginalServer } from './tools/orig-server.mjs';
 *     const orig = await startOriginalServer();  await page.goto(orig.origin + '/about-us/index.html');  …  await orig.close();
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ORIGINAL_ROOT = path.resolve(HERE, '..', '..'); // mirror root = parent of livora-angular

const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.map': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function makeServer(root, { spa }) {
  const rootNorm = path.resolve(root);
  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://x');
      const pathname = decodeURIComponent(url.pathname);
      let file = path.resolve(path.join(rootNorm, pathname));
      if (!file.toLowerCase().startsWith(rootNorm.toLowerCase())) {
        res.writeHead(403);
        return res.end('Forbidden');
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        if (!spa && !pathname.endsWith('/')) {
          // like http-server: directory without trailing slash → redirect, so relative URLs resolve correctly
          res.writeHead(301, { Location: pathname + '/' + url.search });
          return res.end();
        }
        file = path.join(file, 'index.html');
      }
      if (!fs.existsSync(file)) {
        if (spa && !path.extname(pathname)) {
          file = path.join(rootNorm, 'index.html'); // client-side route → app shell
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('Not found');
        }
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(500);
      res.end('Server error');
    }
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ origin: `http://127.0.0.1:${port}`, port, close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }) });
    });
  });
}

export const startOriginalServer = () => listen(makeServer(ORIGINAL_ROOT, { spa: false }));
export const startAppServer = (dir) => listen(makeServer(dir, { spa: true }));
