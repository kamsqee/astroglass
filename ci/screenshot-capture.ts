/**
 * Screenshot Capture — Playwright-based visual snapshot tool
 *
 * Starts a static file server on the built project's `dist/` directory,
 * navigates Playwright to representative pages, and captures screenshots
 * at multiple viewport sizes.
 *
 * Usage:
 *   npx tsx ci/screenshot-capture.ts \
 *     --project /path/to/scaffolded-project \
 *     --output  /path/to/screenshots \
 *     --id      single-liquid
 */

import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type Server } from 'node:http';
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

// ─── CLI args ────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    project: { type: 'string' },
    output:  { type: 'string' },
    id:      { type: 'string', default: 'unknown' },
  },
});

if (!args.project || !args.output) {
  console.error('Usage: --project <path> --output <path> [--id <name>]');
  process.exit(1);
}

const PROJECT_DIR = resolve(args.project);
const DIST_DIR    = join(PROJECT_DIR, 'dist');
const OUTPUT_DIR  = resolve(args.output);
const CONFIG_ID   = args.id!;

// ─── MIME types ──────────────────────────────────────────────

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml',
};

// ─── Static file server ─────────────────────────────────────

function startServer(distDir: string, port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      let url = req.url || '/';
      // Strip query string
      url = url.split('?')[0];

      // Default to index.html
      let filePath = join(distDir, url);
      if (url.endsWith('/')) filePath = join(filePath, 'index.html');

      // Try with .html extension
      if (!existsSync(filePath) && !extname(filePath)) {
        if (existsSync(filePath + '.html')) filePath += '.html';
        else if (existsSync(join(filePath, 'index.html'))) filePath = join(filePath, 'index.html');
      }

      if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        // Fallback to 404.html
        const notFound = join(distDir, '404.html');
        if (existsSync(notFound)) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(readFileSync(notFound));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
        return;
      }

      const ext = extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(readFileSync(filePath));
    });

    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

// ─── Discover routes from dist/ ─────────────────────────────

function discoverRoutes(distDir: string): string[] {
  const routes: string[] = [];

  function walk(dir: string, prefix: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('_')) continue; // skip _astro, _assets, etc.
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name === 'index.html') {
        routes.push(prefix || '/');
      }
    }
  }

  walk(distDir, '/');
  return routes;
}

// ─── Key pages to screenshot ────────────────────────────────

function selectKeyPages(routes: string[]): string[] {
  const priority = [
    '/',                          // Home / showcase
    '/liquid/',                   // Theme pages
    '/glass/',
    '/neo/',
    '/luxury/',
    '/minimal/',
    '/aurora/',
    '/blog/',                     // Blog index
    '/docs/',                     // Docs index
    '/liquid/portfolio/',         // Portfolio pages
    '/glass/portfolio/',
    '/404.html',                  // 404 page
  ];

  // Match priority routes that exist in the build
  const selected: string[] = [];
  for (const p of priority) {
    if (routes.includes(p)) {
      selected.push(p);
    }
  }

  // Cap at 8 pages max to keep CI fast
  return selected.slice(0, 8);
}

// ─── Viewports ──────────────────────────────────────────────

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 375,  height: 812 },
] as const;

// ─── Main ───────────────────────────────────────────────────

async function main() {
  // Validate dist/ exists
  if (!existsSync(DIST_DIR)) {
    console.error(`dist/ not found at ${DIST_DIR}. Build the project first.`);
    process.exit(1);
  }

  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Discover and select routes
  const allRoutes = discoverRoutes(DIST_DIR);
  const pages = selectKeyPages(allRoutes);

  console.log(`[${CONFIG_ID}] Found ${allRoutes.length} routes, capturing ${pages.length} key pages`);

  // Start server
  const PORT = 4200 + Math.floor(Math.random() * 800);
  const server = await startServer(DIST_DIR, PORT);
  console.log(`[${CONFIG_ID}] Server running on http://localhost:${PORT}`);

  // Launch browser
  const browser: Browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      const page: Page = await context.newPage();

      for (const route of pages) {
        const url = `http://localhost:${PORT}${route}`;
        const safeName = route === '/'
          ? 'index'
          : route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-');

        const filename = `${safeName}--${viewport.name}.png`;
        const filepath = join(OUTPUT_DIR, filename);

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
          // Wait for fonts and animations to settle
          await page.waitForTimeout(500);

          await page.screenshot({
            path: filepath,
            fullPage: true,
          });

          console.log(`  ✓ ${filename}`);
        } catch (err) {
          console.warn(`  ✗ ${filename} — ${(err as Error).message}`);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[${CONFIG_ID}] Done — ${pages.length * VIEWPORTS.length} screenshots saved to ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
