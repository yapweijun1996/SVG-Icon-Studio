import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

function createHarness(fetchImpl, { cachedResponse = null, cacheNames = [] } = {}) {
  const listeners = {};
  const puts = [];
  const deletedCaches = [];
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
      keys: async () => [...cacheNames],
      delete: async name => { deletedCaches.push(name); return true; },
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
  return { listeners, puts, deletedCaches };
}

async function activate(harness) {
  const lifetimePromises = [];
  harness.listeners.activate({ waitUntil(promise) { lifetimePromises.push(Promise.resolve(promise)); } });
  assert.equal(lifetimePromises.length, 1, 'activation should extend the service-worker lifetime');
  await Promise.all(lifetimePromises);
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

function dispatchAsset(harness, url) {
  let responsePromise;
  const lifetimePromises = [];
  harness.listeners.fetch({
    request: { method: 'GET', mode: 'cors', url },
    respondWith(promise) { responsePromise = Promise.resolve(promise); },
    waitUntil(promise) { lifetimePromises.push(Promise.resolve(promise)); }
  });
  return { responsePromise, lifetimePromises };
}

async function fetchAsset(harness, url) {
  const result = dispatchAsset(harness, url);
  assert.ok(result.responsePromise, 'cacheable asset request should be intercepted by the service worker');
  return result;
}

assert.match(source, /const CACHE_VERSION = 'icon-studio-v3'/, 'cache version should invalidate pre-boundary runtime entries');
assert.match(source, /key\.startsWith\(CACHE_PREFIX\)/, 'activation should scope cleanup to Icon Studio-owned cache names');

{
  const harness = createHarness(async () => new Response('ok'), {
    cacheNames: ['other-project-v7', 'icon-studio-v1', 'icon-studio-v2', 'icon-studio-v3', 'public-api-cache-v3']
  });
  await activate(harness);
  assert.deepEqual(
    harness.deletedCaches,
    ['icon-studio-v1', 'icon-studio-v2'],
    'activation must delete only obsolete Icon Studio caches and preserve unrelated same-origin caches'
  );
}

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
  const harness = createHarness(async () => new Response('network', {
    status: 200,
    headers: { 'content-type': 'text/plain' }
  }));

  for (const url of [
    'https://example.test/app/assets/app.js?v=1',
    'https://example.test/app/assets/app.js?v=2',
    'https://example.test/other-project/data.json',
    'https://example.test/app/api/search?q=invoice'
  ]) {
    const { responsePromise, lifetimePromises } = dispatchAsset(harness, url);
    assert.equal(responsePromise, undefined, `${url} should bypass service-worker runtime caching`);
    assert.equal(lifetimePromises.length, 0, `${url} should not extend the service-worker lifetime`);
  }
  assert.equal(harness.puts.length, 0, 'query-bearing, arbitrary, and out-of-scope requests must not grow the runtime cache');
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
