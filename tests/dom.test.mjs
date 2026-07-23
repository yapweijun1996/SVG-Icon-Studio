import assert from 'node:assert/strict';
import { slugify } from '../js/core/dom.js';

// Only slugify is tested here: $, $$, createElement and createSvgElement all
// require a browser `document` global, which this zero-dependency project has
// no Node-side polyfill for. They stay covered by tests/browser-test-plan.md.

assert.equal(slugify('Purchase Order'), 'purchase-order');
assert.equal(slugify('  Delivery_Order!! '), 'delivery-order');
assert.equal(slugify('already-a-slug'), 'already-a-slug');
assert.equal(slugify('---leading-and-trailing---'), 'leading-and-trailing');
assert.equal(slugify(''), '');

console.log('slugify tests passed.');
