/* Icon Studio service worker — offline-first app shell with
   stale-while-revalidate for same-origin assets. Registered with a relative
   URL so the same file works at the domain root and under a GitHub Pages
   subpath. Bump CACHE_VERSION to invalidate every cached asset at once. */
const CACHE_PREFIX = 'icon-studio-';
const CACHE_VERSION = 'icon-studio-v3';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];
const CACHEABLE_ASSET_PREFIXES = ['assets/', 'data/', 'icons/', 'icons-pwa/'];

function getScopePath() {
  const scopeUrl = new URL(self.registration.scope);
  return scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
}

function isCacheableAssetRequest(request) {
  const requestUrl = new URL(request.url);
  const scopePath = getScopePath();
  if (!requestUrl.pathname.startsWith(scopePath) || requestUrl.search) return false;

  const relativePath = requestUrl.pathname.slice(scopePath.length);
  return relativePath === 'manifest.webmanifest'
    || CACHEABLE_ASSET_PREFIXES.some(prefix => relativePath.startsWith(prefix));
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Navigations: network first so deploys show up immediately, cached shell offline.
  // Only a successful HTML response for the actual app-shell URL may refresh
  // the offline fallback. A 404 (or a future unrelated page inside this scope)
  // must never replace the known-good cached index.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async response => {
          const requestUrl = new URL(request.url);
          const scopePath = getScopePath();
          const isAppShell = requestUrl.pathname === scopePath || requestUrl.pathname === `${scopePath}index.html`;
          const isHtml = response.headers.get('content-type')?.includes('text/html');

          if (response.ok && isHtml && isAppShell) {
            try {
              const cache = await caches.open(CACHE_VERSION);
              await cache.put('./index.html', response.clone());
            } catch {
              // Cache writes are best-effort: a storage failure must not turn a
              // successful network navigation into an offline fallback response.
            }
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache only canonical app-owned assets. Query-bearing URLs and same-origin
  // requests outside the app's resource namespaces bypass CacheStorage so
  // arbitrary/cache-busting requests cannot grow this persistent cache forever.
  if (!isCacheableAssetRequest(request)) return;

  // Assets: serve cache immediately, refresh it in the background. Keep the
  // fetch + cache write inside this FetchEvent's lifetime so Chromium cannot
  // terminate an idle worker before stale-while-revalidate finishes.
  const refresh = fetch(request)
    .then(async response => {
      if (response.ok) {
        try {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response.clone());
        } catch {
          // Cache writes are best-effort; the network response still wins on a miss.
        }
      }
      return response;
    });

  event.waitUntil(refresh.then(() => undefined, () => undefined));
  event.respondWith(
    caches.match(request).then(cached => cached || refresh)
  );
});
