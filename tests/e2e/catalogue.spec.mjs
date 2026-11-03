import {
  test, expect, registry, packageVersion, ICON_TOTAL, INSPECTOR_KEY,
  isDesktop, openCatalogue, search, scrollToEnd, waitForPreviews
} from './fixtures.mjs';

test.describe('catalogue', () => {
  test('shows the full icon count and the running version', async ({ page }) => {
    await openCatalogue(page);
    await expect(page.locator('#totalIconCount')).toHaveText(String(ICON_TOTAL));
    await expect(page.locator('#resultsSummary')).toHaveText(`Showing 24 of ${ICON_TOTAL} icons`);
    // The sidebar version pill is only rendered where the sidebar is visible.
    if (await page.locator('#appVersion').isVisible()) {
      await expect(page.locator('#appVersion')).toContainText(packageVersion);
    }
  });

  // Regression: v0.9.77 — auto-load stalled once a batch left the sentinel inside
  // the IntersectionObserver trigger zone (stuck at 96 of 230 at 1440–1920px).
  test('infinite scroll loads every icon without a Load more click', async ({ page }) => {
    await openCatalogue(page);
    await expect(page.locator('#loadMoreButton')).toBeHidden();
    await scrollToEnd(page);
    await expect(page.locator('#resultsSummary')).toHaveText(`Showing ${ICON_TOTAL} icons`);
    await expect(page.locator('.icon-card')).toHaveCount(ICON_TOTAL);
  });

  // The v0.9.77 stall only reproduces when one 24-icon batch is shorter than the
  // 600px trigger margin, i.e. wide screens and compact density.
  for (const density of ['grid', 'compact']) {
    test(`infinite scroll reaches the end on a 1920px screen (${density})`, async ({ page }, testInfo) => {
      test.skip(!isDesktop(testInfo), 'wide-screen variant runs once');
      await page.setViewportSize({ width: 1920, height: 1080 });
      await openCatalogue(page);
      if (density === 'compact') await page.locator('[data-density="compact"]').click();
      await scrollToEnd(page);
      await expect(page.locator('.icon-card')).toHaveCount(ICON_TOTAL);
    });
  }

  test('without scrolling, loading stops once the viewport is filled', async ({ page }) => {
    await openCatalogue(page);
    const settled = await page.locator('.icon-card').count();
    await page.waitForTimeout(1_500);
    await expect(page.locator('.icon-card')).toHaveCount(settled);
    expect(settled).toBeLessThan(ICON_TOTAL);
  });

  test('every icon added since v0.9.73 is found by its ID, name and aliases', async ({ page }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'search behaviour is viewport-independent; run once');
    test.setTimeout(120_000); // ~160 searches; the default 30 s is too tight under full parallel load
    await openCatalogue(page);
    const recent = registry.icons.filter(icon => icon.sortOrder >= 2210);
    expect(recent.length).toBeGreaterThanOrEqual(40);
    for (const icon of recent) {
      for (const query of [icon.id, icon.name, ...icon.aliases]) {
        await search(page, query);
        await expect(page.locator(`.icon-card[data-icon-id="${icon.id}"]`), `"${query}" should find ${icon.id}`).toHaveCount(1);
      }
    }
  });

  test('a category chip filters the grid and resets to the first batch', async ({ page }) => {
    await openCatalogue(page);
    const erpTotal = registry.icons.filter(icon => icon.category === 'ERP').length;
    await page.locator('#categoryChips [data-category="ERP"]').click();
    await expect(page.locator('#resultsSummary')).toHaveText(`Showing 24 of ${erpTotal} icons — ERP category`);
    await scrollToEnd(page);
    await expect(page.locator('.icon-card')).toHaveCount(erpTotal);
  });
});

test.describe('selection and inspector', () => {
  // Regression: v0.9.79 — selecting an icon never showed a collapsed desktop inspector.
  test('selecting an icon shows the inspector', async ({ page }, testInfo) => {
    await openCatalogue(page, { inspectorCollapsed: true });
    const card = page.locator('.icon-card').nth(2);
    const iconId = await card.getAttribute('data-icon-id');
    await card.locator('[data-action="select"]').click();
    await expect(page.locator('#inspector')).toBeInViewport();
    await expect(page.locator('#selectedIconName')).toHaveText(registry.icons.find(icon => icon.id === iconId).name);
    const stored = await page.evaluate(key => localStorage.getItem(key), INSPECTOR_KEY);
    if (isDesktop(testInfo)) {
      expect((await page.locator('#inspector').boundingBox()).width).toBeGreaterThan(300);
      expect(stored, 'desktop selection persists the expanded preference').toBe('false');
    } else {
      await expect(page.locator('body')).toHaveClass(/inspector-open/);
      expect(stored, 'drawer mode must not overwrite the desktop preference').toBe('true');
    }
  });

  test('collapsing and selecting again re-expands the desktop inspector', async ({ page }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'desktop collapse control only');
    await openCatalogue(page);
    await page.locator('#collapseInspectorButton').click();
    await expect(page.locator('body')).toHaveClass(/inspector-collapsed/);
    await page.locator('.icon-card').nth(5).locator('[data-action="select"]').click();
    await expect(page.locator('body')).not.toHaveClass(/inspector-collapsed/);
    await expect(page.locator('#inspector')).toBeInViewport();
  });

  // Regression: v0.9.79 — every rerender rebuilt cards as loading skeletons
  // (48 of 48 visible cards flashed on a single click).
  for (const action of ['select', 'favorite', 'density']) {
    test(`${action} does not flash loaded previews back to the loading skeleton`, async ({ page }) => {
      await openCatalogue(page);
      await waitForPreviews(page, 6);
      const flashed = await page.evaluate(kind => {
        const card = document.querySelectorAll('.icon-card')[1];
        if (kind === 'select') card.querySelector('[data-action="select"]').click();
        if (kind === 'favorite') card.querySelector('[data-action="favorite"]').click();
        if (kind === 'density') document.querySelector('[data-density="compact"]').click();
        // Count synchronously, in the same task as the rerender.
        return [...document.querySelectorAll('.icon-card .card-preview')].slice(0, 6)
          .filter(preview => preview.classList.contains('is-loading')).length;
      }, action);
      expect(flashed).toBe(0);
    });
  }
});

test.describe('accessible names (WCAG 2.5.3 label in name)', () => {
  test('card actions name the icon and contain their visible text', async ({ page }) => {
    await openCatalogue(page);
    const card = page.locator('.icon-card').first();
    const name = await card.locator('.card-copy strong').textContent();
    await expect(card.getByRole('button', { name: `Copy SVG: ${name}`, exact: true })).toBeVisible();
    await expect(card.locator('[data-action="select"]')).toHaveAccessibleName(new RegExp(`^${name}\\b`));
  });

  test('sidebar toggle and nav items keep names when collapsed', async ({ page }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'desktop sidebar collapse only');
    await openCatalogue(page);
    const brand = page.locator('#brandToggle');
    await expect(brand).toHaveAccessibleName('Icon Studio, collapse sidebar');
    await expect(page.locator('[data-view="favorites"]')).toHaveAccessibleName(/^Favorites \d+$/);
    await brand.click();
    await expect(page.locator('body')).toHaveClass(/sidebar-collapsed/);
    await expect(brand).toHaveAccessibleName('Expand sidebar');
    await expect(page.locator('[data-view="favorites"]')).toHaveAccessibleName('Favorites');
  });
});

test.describe('keyboard focus', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(!isDesktop(testInfo), 'desktop focus contract (browser-test-plan 5c/5d)');
  });

  test('Favorite keeps focus on the same icon while aria-pressed toggles', async ({ page }) => {
    await openCatalogue(page);
    const favorite = page.locator('.icon-card').nth(3).locator('[data-action="favorite"]');
    const label = await favorite.getAttribute('aria-label');
    await favorite.focus();
    await page.keyboard.press('Enter');
    const focused = page.locator(`[aria-label="${label}"]`);
    await expect(focused).toBeFocused();
    await expect(focused).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(focused).toBeFocused();
    await expect(focused).toHaveAttribute('aria-pressed', 'false');
  });

  test('unfavoriting the last card in Favorites view moves focus to the empty-state heading', async ({ page }) => {
    await openCatalogue(page);
    await page.locator('.icon-card').first().locator('[data-action="favorite"]').click();
    await page.locator('[data-view="favorites"]').click();
    await expect(page.locator('.icon-card')).toHaveCount(1);
    await page.locator('.icon-card [data-action="favorite"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#emptyState h2')).toBeFocused();
  });

  // Regression (v0.9.83): startup awaits the default inspector asset, then
  // rerenders the grid. A card focused during that wait lost focus to <body>.
  test('a slow startup rerender does not steal keyboard focus', async ({ page }) => {
    await page.route('**/icons/catalog/invoice.svg', async route => {
      await new Promise(resolve => setTimeout(resolve, 1_500));
      await route.continue();
    });
    await page.goto('./');
    await expect(page.locator('.icon-card').nth(3)).toBeVisible();
    const iconId = await page.locator('.icon-card').nth(3).getAttribute('data-icon-id');
    const favorite = () => page.locator(`.icon-card[data-icon-id="${iconId}"] [data-action="favorite"]`);
    await favorite().focus();
    await page.waitForTimeout(2_500);
    await expect(favorite()).toBeFocused();
  });

  test('Select keeps focus on the same icon after the rerender', async ({ page }) => {
    await openCatalogue(page);
    const iconId = await page.locator('.icon-card').nth(4).getAttribute('data-icon-id');
    const select = () => page.locator(`.icon-card[data-icon-id="${iconId}"] [data-action="select"]`);
    await select().focus();
    await page.keyboard.press('Enter');
    await expect(select()).toBeFocused();
  });
});
