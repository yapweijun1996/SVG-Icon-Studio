# Icon Studio SSOT migration report

## Result

The v0.2.0 migration replaces the legacy catalogue and monolithic runtime with a modular SSOT SVG architecture.

- Canonical catalogue SVG files: 40
- Registry records: 40
- Runtime dependencies: 0
- Built-in geometry in registry: 0
- Built-in geometry in JavaScript: 0
- Approved Purchase Order source: `icons/catalog/purchase-order.svg`
- Approved Delivery Order source: `icons/catalog/delivery-order.svg`

## Runtime migration

- Legacy global `window.ICON_LIBRARY` loading replaced by `data/icon-registry.json`.
- Legacy `script.js` replaced by browser-native ES modules under `js/`.
- Legacy `styles.css` replaced by nine CSS responsibility modules.
- Catalogue SVGs are loaded from same-origin files, validated and cached per icon.
- Visible cards use lazy asset loading; a failed asset receives a local unavailable-state SVG.
- Inspector and export operations clone the sanitized canonical source and never mutate it.

## Upload migration

- Browser-uploaded icons remain separate from the built-in catalogue.
- IndexedDB v2 separates `uploaded-icon-metadata` from `uploaded-icon-assets`.
- The previous IndexedDB v1 combined store and localStorage upload array are migrated forward.
- Legacy records are deleted only after successful migration.

## Security controls

- Exact `0 0 24 24` viewBox.
- 64 KB hard limit per SVG.
- Allowlisted SVG elements and attributes.
- No scripts, events, `foreignObject`, embedded media, animation elements, external URLs, data URLs or cross-origin asset paths.
- Registry validation rejects duplicate IDs, unknown categories, missing files, orphan files and geometry fields.

## Evidence

- Verified recovery point: `backup_f2a74b23-33c_mrx41c10`
- Final local responsive and accessibility report: https://gmb01.xyz/share/9dac98ee-1d60-4b1c-9813-644f0550e817/local-project-inspect-20f6994f-e440-4c5a-add4-aad8149b891f.html
- Final public responsive/network report: https://gmb01.xyz/share/aad6bfbb-7127-46a8-b200-549d4d53d780/web-inspect-167ce184-453d-45f7-b2d4-1ec395eac057.html
- Final public accessibility report: https://gmb01.xyz/share/c9ab395e-266a-466b-99f6-19fe781dfa0c/accessibility-audit-04cc4c4d-9c99-4338-a7b1-25a43a08d867.html
- Final Purchase Order and Delivery Order alias/selection flow: https://gmb01.xyz/share/0cc0959b-39b1-419c-971b-6b1584679d7f/interaction-flow-260eb186-0de8-428c-aa83-e24a5f51fcca.html
- Inspector and full-preview flow: https://gmb01.xyz/share/6928b0dc-f651-4450-805e-e9bdcee286ca/interaction-flow-4c87a5e5-a9d0-4d5c-b557-6f0738f77a45.html
- Filtering, compact density and favorites flow: https://gmb01.xyz/share/b9d93b95-aae8-49aa-93ec-39ff094e9d91/interaction-flow-6ce4a09a-bbb8-4f2d-a210-5fb55631fcb6.html
