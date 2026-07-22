#!/usr/bin/env node
/**
 * Documentation Screenshot Generator
 *
 * Usage:  node scripts/screenshots.mjs
 *         npm run screenshots
 *
 * Starts the dev server, seeds demo data, navigates to each page,
 * and captures screenshots into /docs/images/.
 */

import { chromium } from 'playwright-core';
import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMAGES_DIR = join(ROOT, 'docs', 'images');
const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;

// Ensure output directory exists
if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

// ── Helpers ──────────────────────────────────────────────

function log(msg) { console.log(`\x1b[36m[shots]\x1b[0m ${msg}`); }
function logOK(msg) { console.log(`\x1b[32m[  ok ]\x1b[0m ${msg}`); }
function logErr(msg) { console.error(`\x1b[31m[ err ]\x1b[0m ${msg}`); }

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

function startDevServer() {
  log('Starting dev server...');
  const child = spawn('npx', ['react-scripts', 'start'], {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, PORT: String(PORT), BROWSER: 'none' },
  });

  child.stdout?.on('data', (d) => {
    const s = d.toString();
    if (s.includes('Compiled') || s.includes('ERROR') || s.includes('warning')) {
      // only surface compilation messages
    }
  });

  return child;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Pages that need books in the Zustand store use ensureBookLoaded now,
// but we still warm up the library once so the store is pre-populated
// and the Dexie fallback isn't needed (faster rendering).

// ── Screenshot definitions ───────────────────────────────

const PYTHON_ID = 'book-python-crash-course';
const TS_ID = 'book-typescript-handbook';
const CC_ID = 'book-clean-code';

/**
 * Each entry: { name, url, waitFor?, actions?, fullPage? }
 *   waitFor  — CSS selector or 'networkidle' to wait for
 *   actions  — async function(page) to run before screenshot
 *   fullPage — capture entire scrollable page
 */
const screenshots = [
  // ── 01: Landing Page ──
  { name: '01-landing-page', url: '/' },

  // ── 02: Features Section (WhyTsBooks) ──
  { name: '02-features', url: '/', waitFor: '.home', actions: async (page) => {
    await page.evaluate(() => {
      const el = document.querySelector('[class*="why"]') || document.querySelector('[class*="features"]') || document.querySelector('[class*="benefits"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, document.body.scrollHeight * 0.6);
    });
    await sleep(500);
  }},

  // ── 03: Library ──
  { name: '03-library', url: '/library' },

  // ── 04: Import Page ──
  { name: '04-import-page', url: '/library/import' },

  // ── 05: Book Details (Python) ──
  { name: '05-book-details', url: `/library/${PYTHON_ID}`, actions: async (page) => { await sleep(2000); }},

  // ── 06: Reading Plan (shown on book details) ──
  { name: '06-reading-plan', url: `/library/${PYTHON_ID}`, actions: async (page) => {
    await sleep(2000);
    await page.evaluate(() => {
      const planSection = document.querySelector('[class*="plan"]') || document.querySelector('[class*="reading-plan"]');
      if (planSection) planSection.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(500);
  }},

  // ── 07: PDF Reader ──
  { name: '07-reader', url: `/library/${PYTHON_ID}/read`, waitFor: '.pdf-reader-page', actions: async (page) => {
    await sleep(4000);
  }},

  // ── 08: Reader with sidebar open ──
  { name: '08-reader-sidebar', url: `/library/${PYTHON_ID}/read`, waitFor: '.pdf-reader-page', actions: async (page) => {
    await sleep(3000);
    const outlineTab = await page.$('.pdf-left-tab:first-child');
    if (outlineTab) await outlineTab.click();
    await sleep(500);
  }},

  // ── 09: Study Workspace ──
  { name: '09-study-workspace', url: `/library/${PYTHON_ID}/study`, waitFor: '.study-workspace-page', actions: async (page) => {
    await sleep(3000);
  }},

  // ── 10: Study — Notes ──
  { name: '10-study-notes', url: `/library/${PYTHON_ID}/study`, waitFor: '.study-workspace-page', actions: async (page) => {
    await sleep(2000);
    const notesBtn = await page.$('button:has-text("Notes"), [data-tab="notes"]');
    if (notesBtn) await notesBtn.click();
    await sleep(800);
  }},

  // ── 11: Study — Highlights ──
  { name: '11-study-highlights', url: `/library/${PYTHON_ID}/study`, waitFor: '.study-workspace-page', actions: async (page) => {
    await sleep(2000);
    const hlBtn = await page.$('button:has-text("Highlights"), [data-tab="highlights"]');
    if (hlBtn) await hlBtn.click();
    await sleep(800);
  }},

  // ── 12: Study — Bookmarks ──
  { name: '12-study-bookmarks', url: `/library/${PYTHON_ID}/study`, waitFor: '.study-workspace-page', actions: async (page) => {
    await sleep(2000);
    const bkBtn = await page.$('button:has-text("Bookmarks"), [data-tab="bookmarks"]');
    if (bkBtn) await bkBtn.click();
    await sleep(800);
  }},

  // ── 13: Learning Center Overview ──
  { name: '13-learning-overview', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(3000);
  }},

  // ── 14: Flashcards List ──
  { name: '14-flashcards', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(2500);
    const tab = await page.$('button:has-text("Flashcards")');
    if (tab) await tab.click();
    await sleep(1500);
  }},

  // ── 15: Quizzes List ──
  { name: '15-quizzes', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(2500);
    const tab = await page.$('button:has-text("Quizzes")');
    if (tab) await tab.click();
    await sleep(1500);
  }},

  // ── 16: Exercises List ──
  { name: '16-exercises', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(2500);
    const tab = await page.$('button:has-text("Exercises")');
    if (tab) await tab.click();
    await sleep(1500);
  }},

  // ── 17: Achievements ──
  { name: '17-achievements', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(2500);
    const tab = await page.$('button:has-text("Achievements")');
    if (tab) await tab.click();
    await sleep(1500);
  }},

  // ── 18: Statistics ──
  { name: '18-statistics', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(2500);
    const tab = await page.$('button:has-text("Statistics")');
    if (tab) await tab.click();
    await sleep(1500);
  }},

  // ── 19: TypeScript Book Details ──
  { name: '19-typescript-book', url: `/library/${TS_ID}` },

  // ── 20: TypeScript Learning Center ──
  { name: '20-ts-learning', url: `/library/${TS_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await sleep(2000);
  }},

  // ── 21: Clean Code Book Details ──
  { name: '21-clean-code-book', url: `/library/${CC_ID}` },

  // ── 22: Books Catalog ──
  { name: '22-books-catalog', url: '/books' },

  // ── 23: Book Detail Page ──
  { name: '23-book-detail-page', url: '/books/typescript-handbook' },

  // ── 24: About Page ──
  { name: '24-about', url: '/about' },

  // ── 25: Dark Theme — Landing ──
  { name: '25-dark-landing', url: '/', actions: async (page) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', 'true');
    });
    await sleep(300);
  }, restoreTheme: true },

  // ── 26: Dark Theme — Library ──
  { name: '26-dark-library', url: '/library', actions: async (page) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', 'true');
    });
    await sleep(300);
  }, restoreTheme: true },

  // ── 27: Dark Theme — Learning Center ──
  { name: '27-dark-learning', url: `/library/${PYTHON_ID}/learn`, waitFor: '.learning-center-page', actions: async (page) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', 'true');
    });
    await sleep(1500);
  }, restoreTheme: true },

  // ── 28: Empty State (no books) ──
  { name: '28-empty-state', url: '/library', actions: async (page) => {
    // Clear IndexedDB to show empty state
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('ts-books-library');
        req.onsuccess = () => resolve(undefined);
        req.onerror = () => resolve(undefined);
        req.onblocked = () => resolve(undefined);
      });
    });
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(1000);
  }},

  // ── 29: Responsive — Tablet ──
  { name: '29-responsive-tablet', url: '/', viewport: { width: 1024, height: 768 } },

  // ── 30: Responsive — Mobile ──
  { name: '30-responsive-mobile', url: '/', viewport: { width: 390, height: 844 } },
];

// ── Main ─────────────────────────────────────────────────

async function main() {
  const server = startDevServer();

  try {
    await waitForServer(BASE_URL);
    log('Dev server ready.');

    // Single browser, single context — seeds and screenshots share IndexedDB
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
      locale: 'en-US',
    });

    // Seed demo data in the same context
    log('Seeding demo data...');
    const seedPage = await context.newPage();
    await seedPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(3000); // wait for React to mount and expose __seedAllDemoData
    const seedResult = await seedPage.evaluate(async () => {
      if (typeof (window).__seedAllDemoData !== 'function') return 'function not found - will use manual seed';
      try {
        await (window).__seedAllDemoData();
        return 'seeded';
      } catch(e) {
        return 'error: ' + e.message;
      }
    });
    logOK(`Seed result: ${seedResult}`);

    // Verify books are in IndexedDB
    await sleep(1000);
    const bookCount = await seedPage.evaluate(async () => {
      return new Promise((resolve) => {
        const req = indexedDB.open('ts-books-library');
        req.onsuccess = () => {
          const db = req.result;
          try {
            const tx = db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const countReq = store.count();
            countReq.onsuccess = () => resolve(countReq.result);
            countReq.onerror = () => resolve(-1);
          } catch { resolve(-1); }
        };
        req.onerror = () => resolve(-1);
      });
    });
    logOK(`Verified: ${bookCount} books in IndexedDB`);
    await seedPage.close();

    let screenshotCount = 0;
    // Reuse a single page so Zustand stores persist across navigations
    const page = await context.newPage();

    // Warm up: navigate to /library to populate Zustand store (books array)
    // This must be done on the same page instance used for screenshots
    log('Warming up: populating library store on main page...');
    await page.goto(`${BASE_URL}/library`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    const bookCards = await page.$$('.library-card, [class*="library-grid"] > div');
    logOK(`Library warm-up: ${bookCards.length} book cards rendered`);

    for (const shot of screenshots) {
      // Custom viewport for responsive screenshots
      if (shot.viewport) {
        await page.setViewportSize(shot.viewport);
      } else {
        await page.setViewportSize({ width: 1600, height: 1000 });
      }

      log(`Capturing ${shot.name}...`);

      try {
        await page.goto(`${BASE_URL}${shot.url}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Wait for specific selector if specified
        if (shot.waitFor) {
          try {
            await page.waitForSelector(shot.waitFor, { timeout: 10000 });
          } catch { /* element might not exist */ }
        }

        // Run custom actions
        if (shot.actions) {
          await shot.actions(page);
        }

        // Small delay for animations to settle
        await sleep(300);

        // Take screenshot
        const filePath = join(IMAGES_DIR, `${shot.name}.png`);
        await page.screenshot({
          path: filePath,
          fullPage: shot.fullPage || false,
        });

        screenshotCount++;
        logOK(`${shot.name}.png`);
      } catch (err) {
        logErr(`Failed: ${shot.name} — ${err.message}`);
      }
    }

    await page.close();

    await browser.close();
    logOK(`Done! ${screenshotCount}/${screenshots.length} screenshots saved to /docs/images/`);
  } finally {
    server.kill('SIGTERM');
    await sleep(1000);
  }
}

main().catch((err) => {
  logErr(err.message);
  process.exit(1);
});
