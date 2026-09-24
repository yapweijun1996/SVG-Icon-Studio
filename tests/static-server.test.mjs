import assert from 'node:assert/strict';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../tools/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createStaticServer({ root });

try {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object', 'static server should expose a bound address');
  const base = `http://127.0.0.1:${address.port}`;

  const cases = [
    ['/', 200, /^text\/html\b/],
    ['/js/app.js', 200, /^text\/javascript\b/],
    ['/icons/catalog/invoice.svg', 200, /^image\/svg\+xml\b/],
    ['/manifest.webmanifest', 200, /^application\/manifest\+json\b/],
    ['/sw.js', 200, /^text\/javascript\b/],
    ['/icons-pwa/icon-192.png', 200, /^image\/png\b/]
  ];

  for (const [pathname, status, contentType] of cases) {
    const response = await fetch(`${base}${pathname}`);
    assert.equal(response.status, status, `${pathname} should return HTTP ${status}`);
    assert.match(response.headers.get('content-type') || '', contentType, `${pathname} should use the expected content type`);
  }

  const manifestResponse = await fetch(`${base}/manifest.webmanifest`);
  const manifest = await manifestResponse.json();
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'served manifest should contain PWA icons');

  const missing = await fetch(`${base}/definitely-not-an-app-asset`);
  assert.equal(missing.status, 404, 'unknown paths should stay 404');
} finally {
  server.close();
  await once(server, 'close');
}

console.log('Zero-dependency static server tests passed.');
