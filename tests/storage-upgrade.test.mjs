import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../js/core/storage.js', import.meta.url), 'utf8');
assert.match(source, /const DB_VERSION = 3;/);
assert.match(source, /event\.oldVersion < 2/);
assert.match(source, /let preservedLegacyRecord = false/);
assert.match(source, /cursor\.delete\(\)/);
assert.match(source, /if \(!preservedLegacyRecord\) db\.deleteObjectStore\(LEGACY_STORE\)/);
assert.match(source, /event\.oldVersion >= 2/);
assert.match(source, /getAllKeys\(\)/);
assert.match(source, /safeToDrop/);
assert.match(source, /db\.deleteObjectStore\(LEGACY_STORE\)/);
assert.doesNotMatch(source.slice(source.indexOf('if (event.oldVersion >= 2)'), source.indexOf('export function joinUploadedIconRecords')), /metadataStore\.put|assetStore\.put/);
console.log('IndexedDB upgrade policy tests passed.');
