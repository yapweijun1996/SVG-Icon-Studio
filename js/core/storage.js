export const STORAGE = Object.freeze({
  favorites: 'iconStudioFavorites',
  recent: 'iconStudioRecent',
  legacyUploaded: 'iconStudioUploaded',
  uploadMigration: 'iconStudioUploadedMigrationV2',
  theme: 'iconStudioTheme',
  density: 'iconStudioDensity',
  sidebar: 'iconStudioSidebarCollapsed',
  inspector: 'iconStudioInspectorCollapsed',
  pinned: 'iconStudioInspectorPinned',
  appearance: 'iconStudioAppearance'
});

export function getValue(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function setValue(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
export function removeValue(key) {
  try { localStorage.removeItem(key); return true; } catch { return false; }
}
export function getJson(key, fallback) {
  try {
    const value = getValue(key);
    return value ? JSON.parse(value) : fallback;
  } catch { return fallback; }
}
export function setJson(key, value) { return setValue(key, JSON.stringify(value)); }

const DB_NAME = 'icon-studio';
const DB_VERSION = 2;
const LEGACY_STORE = 'uploaded-icons';
const METADATA_STORE = 'uploaded-icon-metadata';
const ASSET_STORE = 'uploaded-icon-assets';
let databasePromise;

function metadataFromRecord(record) {
  const { svgText, ...metadata } = record;
  return metadata;
}

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB is unavailable.'));
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const transaction = request.transaction;
      const metadataStore = db.objectStoreNames.contains(METADATA_STORE)
        ? transaction.objectStore(METADATA_STORE)
        : db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
      const assetStore = db.objectStoreNames.contains(ASSET_STORE)
        ? transaction.objectStore(ASSET_STORE)
        : db.createObjectStore(ASSET_STORE, { keyPath: 'id' });
      if (db.objectStoreNames.contains(LEGACY_STORE)) {
        const cursorRequest = transaction.objectStore(LEGACY_STORE).openCursor();
        cursorRequest.onsuccess = event => {
          const cursor = event.target.result;
          if (!cursor) return;
          const record = cursor.value;
          if (record?.id && record?.svgText) {
            metadataStore.put(metadataFromRecord(record));
            assetStore.put({ id: record.id, svgText: record.svgText });
          }
          cursor.continue();
        };
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open IndexedDB.'));
  });
  return databasePromise;
}

function readAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function listUploadedIcons() {
  try {
    const db = await openDatabase();
    const [metadataRecords, assetRecords] = await Promise.all([
      readAll(db, METADATA_STORE),
      readAll(db, ASSET_STORE)
    ]);
    const assetById = new Map(assetRecords.map(asset => [asset.id, asset.svgText]));
    return metadataRecords
      .filter(metadata => assetById.has(metadata.id))
      .map(metadata => ({ ...metadata, svgText: assetById.get(metadata.id), uploaded: true }));
  } catch { return []; }
}

export async function saveUploadedIcon(record) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([METADATA_STORE, ASSET_STORE], 'readwrite');
    tx.objectStore(METADATA_STORE).put(metadataFromRecord(record));
    tx.objectStore(ASSET_STORE).put({ id: record.id, svgText: record.svgText });
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error || new Error('Unable to save uploaded icon.'));
  });
}

export async function migrateLegacyUploads(sanitizeSvgText) {
  if (getValue(STORAGE.uploadMigration) === 'done') return { migrated: 0, failed: 0 };
  const legacy = getJson(STORAGE.legacyUploaded, []);
  if (!Array.isArray(legacy) || legacy.length === 0) {
    setValue(STORAGE.uploadMigration, 'done');
    return { migrated: 0, failed: 0 };
  }
  let migrated = 0;
  let failed = 0;
  for (const item of legacy.slice(0, 50)) {
    try {
      if (!item?.id || !item?.name || !item?.body) throw new Error('Invalid legacy upload.');
      const root = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
      const checked = sanitizeSvgText(`${root}${item.body}</svg>`, { stripDimensions: true });
      if (!checked.ok) throw new Error(checked.error);
      await saveUploadedIcon({
        id: item.id,
        name: item.name,
        category: 'Uploaded',
        style: String(item.style || 'custom').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags : ['uploaded'],
        aliases: [], status: 'active', featured: false, sortOrder: Date.now(),
        uploaded: true, svgText: checked.svgText
      });
      migrated += 1;
    } catch { failed += 1; }
  }
  if (failed === 0) {
    removeValue(STORAGE.legacyUploaded);
    setValue(STORAGE.uploadMigration, 'done');
  }
  return { migrated, failed };
}
