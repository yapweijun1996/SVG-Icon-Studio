import assert from 'node:assert/strict';
import {
  ALLOWED_ATTRIBUTES,
  isDisallowedElement,
  isDisallowedAttribute,
  isEventAttribute,
  isHrefAttribute,
  isInvalidReference,
} from '../js/services/svg-policy.js';

// js/services/svg-sanitizer.js (browser, DOMParser-based) and tools/svg-policy.mjs
// (Node, regex-based) both delegate every allow/deny decision to this shared module.
// Testing the shared predicates once is what keeps the two parsers from silently
// drifting apart again.

// Regression: the browser sanitizer used to allow-list the attribute name
// "clip-path-units", which does not exist — the real SVG attribute lowercases to
// "clippathunits". That meant any legitimate clipPathUnits usage was rejected.
// The shared module must use the correct name and only the correct name.
assert.equal(isDisallowedAttribute('clipPathUnits'), false, 'clipPathUnits must be allowed');
assert.equal(ALLOWED_ATTRIBUTES.has('clip-path-units'), false, 'the old, invalid attribute name must not reappear');

assert.equal(isDisallowedElement('path'), false);
assert.equal(isDisallowedElement('script'), true);
assert.equal(isDisallowedElement('use'), true, 'use is forbidden (it can reference external content)');
assert.equal(isDisallowedElement('marquee'), true, 'unknown elements are rejected by default (allow-list, not deny-list)');

assert.equal(isEventAttribute('onclick'), true);
assert.equal(isEventAttribute('onLoad'), true);
assert.equal(isEventAttribute('stroke'), false);

assert.equal(isHrefAttribute('href'), true);
assert.equal(isHrefAttribute('xlink:href'), true);
assert.equal(isHrefAttribute('id'), false);

assert.equal(isInvalidReference('javascript:alert(1)'), true);
assert.equal(isInvalidReference('data:image/png;base64,x'), true);
assert.equal(isInvalidReference('https://example.com/x.svg'), true);
assert.equal(isInvalidReference('url(#local-gradient)'), false, 'a local fragment reference is safe');
assert.equal(isInvalidReference('url(https://evil.example/x.svg)'), true);
assert.equal(isInvalidReference('#1f2937'), false, 'a plain color value is not a reference');

console.log('Shared SVG policy tests passed.');
