import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

function createHarness(fetchImpl, { cachedResponse = null } = {}) {
  const listeners = {};
  const puts = [];
  const cache = {
    addAll: async () => {},
    put: async (key, response) => { puts.push({ key, response }); },
    match: async () => cachedResponse || new Response('<!doctype html><title>cached shell</title>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
  };

  const context = {
    URL,
    Response,
    Promise,
    console,
    fetch: fetchImpl,
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
      match: async () => cache.match()
    },
    self: {
      location: { origin: 'https://example.test' },
      registration: { scope: 'https://example.test/app/' },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener(type, listener) { listeners[type] = listener; }
    }
  };

  vm.runInNewContext(source, context, { filename: 'sw.js' });
  return { listeners, puts };
}

async function navigate(harness, url) {
  let responsePromise;
  harness.listeners.fetch({
    request: { method: 'GET', mode: 'navigate', url },
    respondWith(promise) { responsePromise = Promise.resolve(promise); }
  });
  assert.ok(responsePromise, 'navigation should be intercepted by the service worker');
  return responsePromise;
}

async function fetchAsset(harness, url) {
  let responsePromise;
  const lifetimePromises = [];
  harness.listeners.fetch({
    request: { method: 'GET', mode: 'cors', url },
    respondWith(promise) { responsePromise = Promise.resolve(promise); },
    waitUntil(promise) { lifetimePromises.push(Promise.resolve(promise)); }
  });
  assert.ok(responsePromise, 'asset request should be intercepted by the service worker');
  return { responsePromise, lifetimePromises };
}

assert.match(source, /const CACHE_VERSION = 'icon-studio-v2'/, 'cache version should invalidate the pre-fix navigation cache');

{
  const harness = createHarness(async () => new Response('<!doctype html><title>app</title>', {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  }));
  const response = await navigate(harness, 'https://example.test/app/?icon=invoice');
  assert.equal(response.status, 200);
  assert.equal(harness.puts.length, 1, 'successful app-shell navigation should refresh the offline fallback');
  assert.equal(harness.puts[0].key, './index.html');
}

{
  const harness = createHarness(async () => new Response('<!doctype html><body>NOT_FOUND_SENTINEL</body>', {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  }));
  const response = await navigate(harness, 'https://example.test/app/missing-route');
  assert.equal(response.status, 404);
  assert.equal(harness.puts.length, 0, 'failed navigation must not overwrite the cached app shell');
}

{
  const harness = createHarness(async () => new Response('<!doctype html><title>other page</title>', {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  }));
  await navigate(harness, 'https://example.test/app/docs');
  assert.equal(harness.puts.length, 0, 'unrelated successful pages inside the scope must not replace the app shell');
}

{
  const harness = createHarness(async () => new Response('{"ok":true}', {
    status: 200,
    headers: { 'content-type': 'application/json' }
  }));
  await navigate(harness, 'https://example.test/app/');
  assert.equal(harness.puts.length, 0, 'non-HTML responses must not become the offline document fallback');
}


{
  let resolveNetwork;
  const networkResponse = new Promise(resolve => { resolveNetwork = resolve; });
  const harness = createHarness(() => networkResponse, {
    cachedResponse: new Response('cached-v1', { status: 200, headers: { 'content-type': 'text/javascript' } })
  });

  const { responsePromise, lifetimePromises } = await fetchAsset(harness, 'https://example.test/app/assets/app.js');
  const cached = await responsePromise;
  assert.equal(await cached.text(), 'cached-v1', 'cached asset should be returned immediately');
  assert.equal(lifetimePromises.length, 1, 'background refresh should extend the FetchEvent lifetime');
  assert.equal(harness.puts.length, 0, 'cache refresh should still be pending while the network request is pending');

  resolveNetwork(new Response('network-v2', { status: 200, headers: { 'content-type': 'text/javascript' } }));
  await Promise.all(lifetimePromises);
  assert.equal(harness.puts.length, 1, 'background refresh should finish its cache write before the lifetime promise settles');
  assert.equal(await harness.puts[0].response.text(), 'network-v2');
}

console.log('Service-worker navigation integrity and asset refresh lifetime tests passed.');
