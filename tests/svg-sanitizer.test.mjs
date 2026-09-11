import assert from 'node:assert/strict';
import { inspectSvgText } from '../tools/svg-policy.mjs';
const safe = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1h2"/></svg>';
assert.equal(inspectSvgText(safe).ok, true);
// XML attribute names are case-sensitive. DOMParser therefore does not expose
// case variants as the canonical viewBox/xmlns attributes; build validation
// must reject the same inputs instead of matching them case-insensitively.
assert.equal(inspectSvgText(safe.replace('viewBox', 'viewbox')).ok, false, 'lowercase viewbox must not satisfy canonical viewBox');
assert.equal(inspectSvgText(safe.replace('viewBox', 'VIEWBOX')).ok, false, 'uppercase VIEWBOX must not satisfy canonical viewBox');
assert.equal(inspectSvgText(safe.replace('xmlns', 'XMLNS')).ok, false, 'uppercase XMLNS must not satisfy canonical xmlns');
// XML 1.0 raw characters are legal only in the three whitespace controls and
// the defined inclusive ranges. This covers text, quoted attributes,
// comments, and CDATA just like DOMParser.
for (const codePoint of [0x0, 0x1, 0xfffe, 0xffff]) {
  const character = String.fromCodePoint(codePoint);
  assert.equal(inspectSvgText(safe.replace('<path', `<title>${character}</title><path`)).ok, false, `illegal raw text code point rejected: U+${codePoint.toString(16)}`);
  assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', `d="M1 ${character} 1h2"`)).ok, false, `illegal raw attribute code point rejected: U+${codePoint.toString(16)}`);
  assert.equal(inspectSvgText(safe.replace('<path', `<!--${character}--><path`)).ok, false, `illegal raw comment code point rejected: U+${codePoint.toString(16)}`);
  assert.equal(inspectSvgText(safe.replace('<path', `<![CDATA[${character}]]><path`)).ok, false, `illegal raw CDATA code point rejected: U+${codePoint.toString(16)}`);
}
for (const codePoint of [0x9, 0xa, 0xd, 0x20, 0xe000, 0x10000]) {
  const character = String.fromCodePoint(codePoint);
  assert.equal(inspectSvgText(safe.replace('<path', `<title>${character}</title><path`)).ok, true, `legal raw text code point accepted: U+${codePoint.toString(16)}`);
  assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', `d="M1 ${character} 1h2"`)).ok, true, `legal raw attribute code point accepted: U+${codePoint.toString(16)}`);
  assert.equal(inspectSvgText(safe.replace('<path', `<!--${character}--><path`)).ok, true, `legal raw comment code point accepted: U+${codePoint.toString(16)}`);
  assert.equal(inspectSvgText(safe.replace('<path', `<![CDATA[${character}]]><path`)).ok, true, `legal raw CDATA code point accepted: U+${codePoint.toString(16)}`);
}
assert.equal(inspectSvgText(safe.replace(' xmlns="http://www.w3.org/2000/svg"', '')).ok, false);
assert.equal(inspectSvgText(safe.replace('http://www.w3.org/2000/svg', 'http://example.com/not-svg')).ok, false);
assert.equal(inspectSvgText(`<!DOCTYPE svg>${safe}`).ok, false);
assert.equal(inspectSvgText(`<!DOCTYPE svg [<!ENTITY x \"M1 1h2\">]>${safe}`).ok, false);
assert.equal(inspectSvgText(`<?xml version="1.0"?>${safe}`).ok, true, 'standard XML declaration is allowed');
assert.equal(inspectSvgText(`<!-- leading comment -->${safe}`).ok, true, 'complete XML comment before root is allowed');
assert.equal(inspectSvgText(`  \n<!-- first --><!-- second -->\n${safe}`).ok, true, 'multiple leading comments with whitespace are allowed');
assert.equal(inspectSvgText(`<?xml version="1.0"?><!-- leading comment -->${safe}`).ok, true, 'leading comment after XML declaration is allowed');
assert.equal(inspectSvgText(`<!-- unclosed ${safe}`).ok, false, 'unterminated leading comment stays invalid');
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
assert.equal(inspectSvgText(safe.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" viewBox="0 0 48 48"')).ok, false, 'duplicate root attributes are invalid XML');
assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', 'd="M1 1h2" d="M9 9"')).ok, false, 'duplicate child attributes are invalid XML');
assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', 'd=M1')).ok, false, 'unquoted attributes are invalid XML');
assert.equal(inspectSvgText(safe.replace('<path', '<path onclick=alert(1)')).ok, false, 'unquoted event attributes fail closed as malformed XML');
assert.equal(inspectSvgText(safe.replace('<path', '<path selected')).ok, false, 'bare XML attributes are invalid');
assert.equal(inspectSvgText(safe.replace('<path', '<g><path').replace('</svg>', '</g></svg>')).ok, true, 'properly nested self-closing children remain valid');
assert.equal(inspectSvgText(safe.replace('<path', '<g><path')).ok, false, 'missing child closing tag is invalid XML');
assert.equal(inspectSvgText(safe.replace('<path', '<g><path').replace('</svg>', '</svg></g>')).ok, false, 'out-of-order closing tags are invalid XML');
assert.equal(inspectSvgText(safe.replace('</svg>', '</g></svg>')).ok, false, 'extra closing tags are invalid XML');
assert.equal(inspectSvgText(`${safe}${safe}`).ok, false, 'multiple top-level SVG document elements are invalid XML');
const nestedSvg = safe.replace('<path', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path').replace('</svg>', '</svg></svg>');
assert.equal(inspectSvgText(nestedSvg).ok, true, 'a nested SVG element is not a second document element');
assert.equal(inspectSvgText(safe.replace('<path', '<g><path').replace('</svg>', '</path></svg>')).ok, false, 'mismatched closing tags are invalid XML');
assert.equal(inspectSvgText(safe.replace('currentColor', 'url(https://example.com/x)')).ok, false);
// DOMParser resolves XML character references before the browser policy sees values.
// The build-time checker must do the same so encoded dangerous protocols cannot bypass CI.
assert.equal(inspectSvgText(safe.replace('currentColor', 'jav&#x61;script:alert(1)')).ok, false);
assert.equal(inspectSvgText(safe.replace('currentColor', 'url(h&#x74;tps://example.com/x.svg)')).ok, false);
const encodedLocalReference = safe
  .replace('stroke="currentColor"', 'stroke="none" clip-path="url(&#x23;clip)"')
  .replace('<path', '<defs><clipPath id="clip"><path d="M0 0h1v1z"/></clipPath></defs><path');
assert.equal(inspectSvgText(encodedLocalReference).ok, true, 'encoded local fragment references remain safe');
for (const reference of ['&bogus;', '&', '&amp', '&#xZZ;', '&#x110000;', '&#xD800;', '&#0;']) {
  assert.equal(inspectSvgText(safe.replace('<path', `<title>${reference}</title><path`)).ok, false, `invalid text reference rejected: ${reference}`);
  assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', `d="M1 ${reference} 1h2"`)).ok, false, `invalid attribute reference rejected: ${reference}`);
}
for (const reference of ['&amp;', '&lt;', '&gt;', '&quot;', '&apos;', '&#65;', '&#x41;']) {
  assert.equal(inspectSvgText(safe.replace('<path', `<title>${reference}</title><path`)).ok, true, `valid text reference accepted: ${reference}`);
  assert.equal(inspectSvgText(safe.replace('d="M1 1h2"', `d="M1 ${reference} 1h2"`)).ok, true, `valid attribute reference accepted: ${reference}`);
}
assert.equal(inspectSvgText(safe.replace('viewBox="0 0 24 24"', 'viewBox="0 0 48 48"')).ok, false);
assert.equal(inspectSvgText(safe.replace('<path', '<image href="data:image/png;base64,x"/><path')).ok, false);
console.log('SVG security policy tests passed.');
