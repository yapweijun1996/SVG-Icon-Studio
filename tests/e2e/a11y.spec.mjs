import AxeBuilder from '@axe-core/playwright';
import { test, expect, openCatalogue, search } from './fixtures.mjs';

// Automated WCAG 2.1 A/AA checks (ADR-015). axe-core finds a subset of issues;
// manual checks in tests/browser-test-plan.md still cover focus order and
// screen-reader behaviour.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page, context) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(violation => ({
    rule: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.slice(0, 3).map(node => node.target.join(' '))
  }));
  expect(summary, `axe violations: ${context}`).toEqual([]);
}

test.describe('accessibility (axe-core)', () => {
  test('library view', async ({ page }) => {
    await openCatalogue(page);
    await expectNoViolations(page, 'library view');
  });

  test('inspector open after selecting an icon', async ({ page }) => {
    await openCatalogue(page, { inspectorCollapsed: true });
    await page.locator('.icon-card').first().locator('[data-action="select"]').click();
    await expect(page.locator('#inspector')).toBeInViewport();
    await expectNoViolations(page, 'inspector open');
  });

  test('empty search state', async ({ page }) => {
    await openCatalogue(page);
    await search(page, 'zzzz-no-such-icon');
    await expect(page.locator('#emptyState')).toBeVisible();
    await expectNoViolations(page, 'empty state');
  });

  test('dark theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await openCatalogue(page);
    await expectNoViolations(page, 'dark theme');
  });
});
