import assert from 'node:assert/strict';
import {
  ALLOWED_ATTRIBUTES,
  isDisallowedElement,
  isDisallowedAttribute,
  isCanonicalElementName,
  isCanonicalAttributeName,
  canonicalizeAllowedElementName,
  canonicalizeAllowedAttributeName,
  isEventAttribute,
  isHrefAttribute,
  isDimensionAttribute,
  hasForbiddenDoctype,
  hasForbiddenProcessingInstruction,
  getXmlDeclaration,
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
assert.equal(isCanonicalElementName('path'), true);
assert.equal(isCanonicalElementName('PATH'), false, 'element names must use canonical XML case');
assert.equal(isCanonicalElementName('clipPath'), true);
assert.equal(isCanonicalElementName('clippath'), false, 'clipPath must use canonical XML case');
assert.equal(isCanonicalAttributeName('d'), true);
assert.equal(isCanonicalAttributeName('D'), false, 'attribute names must use canonical XML case');
assert.equal(isCanonicalAttributeName('clipPathUnits'), true);
assert.equal(isCanonicalAttributeName('clippathunits'), false, 'clipPathUnits must use canonical XML case');
assert.equal(canonicalizeAllowedElementName('CLIPPATH'), 'clipPath', 'conversion tooling can normalize allowed element case to canonical spelling');
assert.equal(canonicalizeAllowedAttributeName('CLIPPATHUNITS'), 'clipPathUnits', 'conversion tooling can normalize allowed attribute case to canonical spelling');

assert.equal(isEventAttribute('onclick'), true);
assert.equal(isEventAttribute('onLoad'), true);
assert.equal(isEventAttribute('stroke'), false);

assert.equal(isHrefAttribute('href'), true);
assert.equal(isHrefAttribute('xlink:href'), true);
assert.equal(isHrefAttribute('id'), false);

assert.equal(isDimensionAttribute('width'), true);
assert.equal(isDimensionAttribute('WIDTH'), true, 'uppercase WIDTH must be treated as a root dimension');
assert.equal(isDimensionAttribute('Height'), true, 'mixed-case Height must be treated as a root dimension');
assert.equal(isDimensionAttribute('viewBox'), false);

assert.equal(hasForbiddenDoctype('<!DOCTYPE svg><svg/>'), true);
assert.equal(hasForbiddenDoctype('<!doctype svg [<!ENTITY x \"y\">]><svg/>'), true);
assert.equal(hasForbiddenDoctype('<svg/>'), false);

assert.equal(hasForbiddenProcessingInstruction('<?xml version="1.0"?><svg/>'), false, 'standard XML declaration stays allowed');
for (const declaration of [
  '<?xml foo?>', '<?XML version="1.0"?>', '<?xml version="1.0" standalone="maybe"?>',
  '<?xml version="2.0"?>', '<?xml encoding="UTF-8"?>', '<?xml version="1.0" foo="bar"?>',
]) {
  assert.equal(getXmlDeclaration(declaration).valid, false, `malformed XML declaration is rejected: ${declaration}`);
  assert.equal(hasForbiddenProcessingInstruction(`${declaration}<svg/>`), true, `malformed XML declaration is forbidden: ${declaration}`);
}
for (const declaration of [
  '<?xml version="1.0"?>', "<?xml version='1.0'?>", '<?xml version = "1.0"?>',
  '<?xml version="1.1"?>', '<?xml version="1.00"?>',
  '<?xml version="1.0" encoding="UTF-8"?>', '<?xml version="1.0" encoding="utf-8"?>',
  '<?xml version="1.0" encoding="UTF-16"?>', '<?xml version="1.0" encoding="ISO-8859-1"?>',
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<?xml version="1.0" standalone="yes"?>', '<?xml version="1.0" standalone="no"?>',
]) {
  assert.equal(getXmlDeclaration(declaration).valid, true, `canonical XML declaration is accepted: ${declaration}`);
  assert.equal(hasForbiddenProcessingInstruction(`${declaration}<svg/>`), false, `canonical XML declaration is allowed: ${declaration}`);
}

for (const declaration of [
  ' <?xml version="1.0"?>', '\n<?xml version="1.0"?>',
  '<?xml version="1.0" standalone="yes" encoding="UTF-8"?>',
  '<?xml VERSION="1.0"?>', '<?xml version="1.0" ENCODING="UTF-8"?>',
]) {
  assert.equal(hasForbiddenProcessingInstruction(`${declaration}<svg/>`), true, `declaration placement/order/case is rejected: ${JSON.stringify(declaration)}`);
}
assert.equal(hasForbiddenProcessingInstruction('<?xml-stylesheet href="https://example.com/x.css"?><svg/>'), true);
assert.equal(hasForbiddenProcessingInstruction('<svg><?evil x?></svg>'), true);

assert.equal(isInvalidReference('javascript:alert(1)'), true);
assert.equal(isInvalidReference('data:image/png;base64,x'), true);
assert.equal(isInvalidReference('https://example.com/x.svg'), true);
assert.equal(isInvalidReference('url(#local-gradient)'), false, 'a local fragment reference is safe');
assert.equal(isInvalidReference('url(https://evil.example/x.svg)'), true);
assert.equal(isInvalidReference('#1f2937'), false, 'a plain color value is not a reference');

console.log('Shared SVG policy tests passed.');
