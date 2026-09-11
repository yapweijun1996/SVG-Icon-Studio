import assert from 'node:assert/strict';
import { inspectSvgText } from '../tools/svg-policy.mjs';
const safe = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1h2"/></svg>';
assert.equal(inspectSvgText(safe).ok, true);
assert.equal(inspectSvgText(safe.replace(' xmlns="http://www.w3.org/2000/svg"', '')).ok, false);
assert.equal(inspectSvgText(safe.replace('http://www.w3.org/2000/svg', 'http://example.com/not-svg')).ok, false);
assert.equal(inspectSvgText(`<!DOCTYPE svg>${safe}`).ok, false);
assert.equal(inspectSvgText(`<!DOCTYPE svg [<!ENTITY x \"M1 1h2\">]>${safe}`).ok, false);
assert.equal(inspectSvgText(`<?xml version="1.0"?>${safe}`).ok, true, 'standard XML declaration is allowed');
assert.equal(inspectSvgText(`<?xml-stylesheet href="https://evil.example/x.css"?>${safe}`).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<?evil x?><path')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<g xmlns="https://evil.example/ns"><path d="M0 0h1"/></g><path')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<path xmlns="https://evil.example/ns" d="M0 0h1"/><path')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<svg xmlns="https://evil.example/ns" viewBox="0 0 24 24"><path d="M0 0h1"/></svg><path')).ok, false);
// XML comments and CDATA are inert. Tag-like text inside them must not be
// mistaken for active SVG elements by the regex-based build validator.
assert.equal(inspectSvgText(safe.replace('<path', '<!-- <script>alert(1)</script> --><path')).ok, true);
assert.equal(inspectSvgText(safe.replace('<path', '<![CDATA[<script>alert(1)</script>]]><path')).ok, true);
assert.equal(inspectSvgText(safe.replace('<path', '<!-- <image href="https://evil.example/x"/> --><path')).ok, true);
assert.equal(inspectSvgText(safe.replace('<path', '<![CDATA[<image href="https://evil.example/x"/>]]><path')).ok, true);
assert.equal(inspectSvgText(safe.replace('<path', 'text]]><path')).ok, false, 'stray ]]> in character data must match DOMParser rejection');
assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', 'd="M1 1h2]]>"')).ok, true, ']]> remains valid inside a quoted attribute value');
assert.equal(inspectSvgText(safe.replace('<path', '<!-- unclosed <path')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<![CDATA[unclosed <path')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<script>alert(1)</script><path')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<path onclick="alert(1)"')).ok, false);
assert.equal(inspectSvgText(safe.replace('currentColor', 'url(https://example.com/x)')).ok, false);
// DOMParser resolves XML character references before the browser policy sees values.
// The build-time checker must do the same so encoded dangerous protocols cannot bypass CI.
assert.equal(inspectSvgText(safe.replace('currentColor', 'jav&#x61;script:alert(1)')).ok, false);
assert.equal(inspectSvgText(safe.replace('currentColor', 'url(h&#x74;tps://example.com/x.svg)')).ok, false);
const encodedLocalReference = safe
  .replace('stroke="currentColor"', 'stroke="none" clip-path="url(&#x23;clip)"')
  .replace('<path', '<defs><clipPath id="clip"><path d="M0 0h1v1z"/></clipPath></defs><path');
assert.equal(inspectSvgText(encodedLocalReference).ok, true, 'encoded local fragment references remain safe');
assert.equal(inspectSvgText(safe.replace('viewBox="0 0 24 24"', 'viewBox="0 0 48 48"')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<image href="data:image/png;base64,x"/><path')).ok, false);
console.log('SVG security policy tests passed.');
