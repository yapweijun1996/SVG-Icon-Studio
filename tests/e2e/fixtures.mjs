import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';

export const registry = JSON.parse(fs.readFileSync(new URL('../../data/icon-registry.json', import.meta.url), 'utf8'));
export const packageVersion = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version;
export const ICON_TOTAL = registry.icons.filter(icon => icon.status === 'active').length;
export const INSPECTOR_KEY = 'iconStudioInspectorCollapsed';

// Every test fails on a console error or uncaught page exception, so runtime
// regressions surface even when the asserted behaviour still looks right.
export const test = base.extend({
  page: async ({ page }, use) => {
    const problems = [];
    page.on('console', message => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
    page.on('pageerror', error => problems.push(`pageerror: ${error.message}`));
    await use(page);
    expect(problems, 'no console errors or page exceptions').toEqual([]);
  }
});

export { expect };

export const isDesktop = testInfo => testInfo.project.name === 'desktop-1440';

export async function openCatalogue(page, { inspectorCollapsed } = {}) {
  if (inspectorCollapsed !== undefined) {
    await page.addInitScript(([key, value]) => {
      if (!sessionStorage.getItem('e2e-seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('e2e-seeded', '1');
      }
    }, [INSPECTOR_KEY, String(inspectorCollapsed)]);
  }
  await page.goto('./');
  await expect(page.locator('.icon-card').first()).toBeVisible();
}

export async function search(page, query) {
  await page.locator('#searchInput').fill(query);
}

// Scroll until the catalogue reports every result as shown (infinite scroll).
export async function scrollToEnd(page) {
  await expect.poll(async () => {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const summary = await page.locator('#resultsSummary').textContent();
    return /^Showing \d+ icons?(\s|$)/.test(summary.trim()) && !/ of /.test(summary);
  }, { timeout: 20_000, intervals: [200] }).toBe(true);
}

// Wait until the first `count` cards have painted real SVG previews.
export async function waitForPreviews(page, count) {
  await expect.poll(() => page.evaluate(n => [...document.querySelectorAll('.icon-card .card-preview')]
    .slice(0, n).every(preview => !preview.classList.contains('is-loading') && preview.querySelector('svg')), count)).toBe(true);
}
