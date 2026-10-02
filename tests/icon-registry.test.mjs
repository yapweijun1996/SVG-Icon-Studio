import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { getFilteredIcons } from '../js/features/filters.js';
import { createState } from '../js/core/state.js';
const registry = JSON.parse(await fs.readFile('data/icon-registry.json', 'utf8'));
assert.equal(registry.schemaVersion, 1);
assert.ok(registry.icons.length >= 180, 'Icon count must preserve the published baseline.');
assert.equal(new Set(registry.icons.map(icon => icon.id)).size, registry.icons.length, 'Icon IDs must be unique.');
assert.equal(registry.icons.filter(icon => icon.style === 'outline').length, registry.icons.length, 'Built-in catalogue should use one consistent outline style.');
for (const id of ['invoice', 'purchase-order', 'delivery-order']) {
  assert.ok(registry.icons.some(icon => icon.id === id), `Missing required icon: ${id}`);
}
for (const icon of registry.icons) {
  assert.ok(!('body' in icon) && !('svg' in icon) && !('markup' in icon) && !('pathData' in icon), `Geometry found in registry: ${icon.id}`);
  assert.ok(Array.isArray(icon.tags));
  assert.ok(Array.isArray(icon.aliases));
}
const addedIds = [
  'manufacturing', 'maintenance', 'pallet', 'conveyor', 'delivery-route',
  'inventory-reservation', 'reorder-point', 'payment-schedule', 'currency-exchange', 'cash-flow',
  'forklift', 'shipping-container', 'weighing-scale', 'attendance', 'leave-request',
  'recruitment', 'training', 'project-board', 'milestone', 'profit-loss',
  'qr-code', 'rfid', 'thermometer', 'fragile', 'package-check',
  'package-damage', 'hand-truck', 'cold-storage', 'safety-helmet', 'fire-extinguisher',
  'stamp', 'attachment', 'document-scan', 'cloud-sync', 'backup',
  'restore', 'api', 'robot', 'ai-chat', 'key',
  'shopping-bag', 'gift', 'coupon', 'loyalty-card', 'shopping-basket',
  'investment', 'savings', 'loan', 'interest-rate', 'subscription',
  'user-check', 'user-remove', 'user-shield', 'team', 'support-agent',
  'wifi', 'bluetooth', 'battery', 'redo', 'folder-open'
];
for (const id of addedIds) {
  const icon = registry.icons.find(candidate => candidate.id === id);
  assert.ok(icon, `Missing added icon: ${id}`);
  assert.equal(icon.status, 'active');
  assert.equal(icon.style, 'outline');
  assert.ok(icon.sortOrder > 1200, `New icon should append to the existing sort order: ${id}`);
  assert.ok((await fs.stat(`icons/catalog/${id}.svg`)).isFile(), `Missing canonical asset: ${id}`);
  for (const query of [id, icon.name, ...icon.aliases]) {
    const state = createState({ icons: registry.icons });
    Object.assign(state, { query, category: icon.category, style: 'outline' });
    assert.ok(getFilteredIcons(state).some(result => result.id === id), `Added icon should be searchable by ${query}`);
  }
}
console.log('Registry integrity and added-icon search tests passed.');
