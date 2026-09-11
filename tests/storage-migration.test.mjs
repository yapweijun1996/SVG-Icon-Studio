import assert from 'node:assert/strict';
import { STORAGE, joinUploadedIconRecords, migrateLegacyUploads } from '../js/core/storage.js';

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.localStorage = new MemoryStorage();

function legacyRecord(index, body = '<path d="M1 1h2"/>') {
  return { id: `legacy-${index}`, name: `Legacy ${index}`, body, style: 'outline', tags: ['legacy'] };
}

const sanitizer = raw => raw.includes('<bad')
  ? { ok: false, error: 'Invalid legacy upload.' }
  : { ok: true, svgText: raw };

// Migration is deliberately bounded to 50 records per pass. Records beyond the
// batch must remain in localStorage instead of being deleted when the first 50 succeed.
{
  localStorage.clear();
  const saved = [];
  localStorage.setItem(STORAGE.legacyUploaded, JSON.stringify(Array.from({ length: 51 }, (_, index) => legacyRecord(index + 1))));

  const first = await migrateLegacyUploads(sanitizer, async record => saved.push(record.id));
  assert.deepEqual(first, { migrated: 50, failed: 0, pending: 1 });
  assert.equal(localStorage.getItem(STORAGE.uploadMigration), null);
  assert.deepEqual(JSON.parse(localStorage.getItem(STORAGE.legacyUploaded)).map(item => item.id), ['legacy-51']);
  assert.equal(saved.length, 50);

  const second = await migrateLegacyUploads(sanitizer, async record => saved.push(record.id));
  assert.deepEqual(second, { migrated: 1, failed: 0, pending: 0 });
  assert.equal(localStorage.getItem(STORAGE.uploadMigration), 'done');
  assert.equal(localStorage.getItem(STORAGE.legacyUploaded), null);
  assert.equal(saved.length, 51);
  assert.equal(saved.at(-1), 'legacy-51');
}

// A failed record is retained for retry, while successful records are removed so
// they are not pointlessly migrated again on every startup.
{
  localStorage.clear();
  const saved = [];
  localStorage.setItem(STORAGE.legacyUploaded, JSON.stringify([
    legacyRecord(1),
    legacyRecord(2, '<bad/>'),
    legacyRecord(3)
  ]));

  const result = await migrateLegacyUploads(sanitizer, async record => saved.push(record.id));
  assert.deepEqual(result, { migrated: 2, failed: 1, pending: 1 });
  assert.deepEqual(saved, ['legacy-1', 'legacy-3']);
  assert.deepEqual(JSON.parse(localStorage.getItem(STORAGE.legacyUploaded)).map(item => item.id), ['legacy-2']);
  assert.equal(localStorage.getItem(STORAGE.uploadMigration), null);
}


// IndexedDB reconciliation: metadata-only rows can be safely removed because the SVG
// payload is already gone; asset-only rows are reported but preserved as recoverable data.
{
  const joined = joinUploadedIconRecords(
    [{ id: 'valid', name: 'Valid' }, { id: 'meta-only', name: 'Lost asset' }],
    [{ id: 'valid', svgText: '<svg/>' }, { id: 'asset-only', svgText: '<svg id=\"kept\"/>' }]
  );
  assert.deepEqual(joined.records.map(record => record.id), ['valid']);
  assert.deepEqual(joined.metadataOrphanIds, ['meta-only']);
  assert.deepEqual(joined.assetOrphanIds, ['asset-only']);
  assert.equal(joined.records[0].svgText, '<svg/>');
}

console.log('Legacy upload migration tests passed.');
