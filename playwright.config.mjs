import { defineConfig, devices } from '@playwright/test';

// Browser regression tests (ADR-015). They exercise the production build
// (`dist/`, served by `vite preview`), the same artefact GitHub Pages deploys.
// `npm run test:e2e` builds first; CI builds in an earlier step and runs
// `npm run test:e2e:ci` against that build.
const PORT = 4174;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    // Service workers would cache assets across tests and make runs order-dependent;
    // the PWA update flow keeps its dedicated Node tests (tests/pwa.test.mjs).
    serviceWorkers: 'block',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-1024', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
