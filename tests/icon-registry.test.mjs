import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const registry = JSON.parse(await fs.readFile('data/icon-registry.json', 'utf8'));
assert.equal(registry.schemaVersion, 1);
assert.ok(registry.icons.length >= 39, 'Icon count must preserve the published baseline.');
assert.equal(new Set(registry.icons.map(icon => icon.id)).size, registry.icons.length, 'Icon IDs must be unique.');
for (const id of ['invoice', 'purchase-order', 'delivery-order']) {
  assert.ok(registry.icons.some(icon => icon.id === id), `Missing required icon: ${id}`);
}
for (const icon of registry.icons) {
  assert.ok(!('body' in icon) && !('svg' in icon) && !('markup' in icon) && !('pathData' in icon), `Geometry found in registry: ${icon.id}`);
  assert.ok(Array.isArray(icon.tags));
  assert.ok(Array.isArray(icon.aliases));
}
console.log('Registry integrity tests passed.');
