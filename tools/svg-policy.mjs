import {
  REQUIRED_VIEWBOX,
  REQUIRED_NAMESPACE,
  ALLOWED_ELEMENTS,
  isCanonicalElementName,
  FORBIDDEN_ELEMENTS,
  ALLOWED_ATTRIBUTES,
  isCanonicalAttributeName,
  isEventAttribute,
  isHrefAttribute,
  hasForbiddenDoctype,
  hasForbiddenProcessingInstruction,
  getXmlDeclaration,
  isInvalidReference,
} from '../js/services/svg-policy.js';

// Node has no built-in DOMParser, so this build-time checker extracts tags/attributes
// with regex instead of a real XML parser. The allow-list and reference rules it applies
// come from svg-policy.js, the same module js/services/svg-sanitizer.js uses at runtime.
// Decode XML character references before policy checks because DOMParser does this
// automatically in the browser; otherwise encoded protocols can bypass build validation.
function decodeXmlAttributeValue(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return String(value).replace(/&(?:#(?:x[0-9a-f]+|\d+)|amp|lt|gt|quot|apos);/gi, entity => {
    if (entity[1] !== '#') return named[entity.slice(1, -1).toLowerCase()] ?? entity;
    const body = entity.slice(2, -1);
    const codePoint = Number.parseInt(body.replace(/^x/i, ''), /^x/i.test(body) ? 16 : 10);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return entity;
    return String.fromCodePoint(codePoint);
  });
}

function isLegalXmlCodePoint(codePoint) {
  return codePoint === 0x9 || codePoint === 0xa || codePoint === 0xd
    || (codePoint >= 0x20 && codePoint <= 0xd7ff)
    || (codePoint >= 0xe000 && codePoint <= 0xfffd)
    || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
}

function hasInvalidRawXmlCharacter(text) {
  for (const character of text) {
    if (!isLegalXmlCodePoint(character.codePointAt(0))) return true;
  }
  return false;
}

function isValidXmlCharacterReference(text, index) {
  const remainder = text.slice(index);
  const named = remainder.match(/^&([A-Za-z][A-Za-z0-9]*);/);
  if (named) return ['amp', 'lt', 'gt', 'quot', 'apos'].includes(named[1]);
  const numeric = remainder.match(/^&#(x[0-9A-Fa-f]+|[0-9]+);/);
  if (!numeric) return false;
  const codePoint = Number.parseInt(numeric[1].replace(/^x/, ''), numeric[1][0] === 'x' ? 16 : 10);
  return isLegalXmlCodePoint(codePoint);
}

// Strip XML comments while enforcing the XML comment production. In
// particular, comment content may not contain "--" or end in "-" before the
// closing delimiter. Return the stripped text so every lexical comment scan
// uses the same grammar and fails closed on malformed comments.
function stripXmlComments(text) {
  let output = '';
  let index = 0;
  let inTag = false;
  let quote = null;
  while (index < text.length) {
    if (!inTag && text.startsWith('<!--', index)) {
      const end = text.indexOf('-->', index + 4);
      if (end < 0) return { ok: false, text: output + text.slice(index) };
      const body = text.slice(index + 4, end);
      if (body.includes('--') || body.endsWith('-')) return { ok: false, text: output + text.slice(index) };
      index = end + 3;
      continue;
    }
    const char = text[index];
    output += char;
    if (inTag) {
      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        inTag = false;
      }
    } else if (char === '<') {
      inTag = true;
    }
    index += 1;
  }
  return { ok: true, text: output };
}

// Validate references in character data and quoted attribute values. Comments
// and CDATA are handled lexically because their contents are not XML markup.
function hasInvalidXmlCharacterReference(text) {
  const comments = stripXmlComments(text);
  if (!comments.ok) return false;
  text = comments.text;
  let index = 0;
  let inTag = false;
  let quote = null;
  while (index < text.length) {
    if (!inTag && text.startsWith('<![CDATA[', index)) {
      const end = text.indexOf(']]>', index + 9);
      if (end < 0) return true;
      index = end + 3;
      continue;
    }
    const char = text[index];
    if (char === '<' && !inTag) {
      inTag = true;
      index += 1;
      continue;
    }
    if (char === '&' && (inTag ? quote !== null : true) && !isValidXmlCharacterReference(text, index)) return true;
    if (inTag) {
      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        inTag = false;
      }
    }
    index += 1;
  }
  return false;
}

function hasStrayCdataClose(text) {
  let inTag = false;
  let quote = null;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!inTag) {
      if (text.startsWith(']]>', index)) return true;
      if (char === '<') inTag = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '>') inTag = false;
  }
  return false;
}

function scanXmlTags(text) {
  const tags = [];
  let index = 0;
  while (index < text.length) {
    const openIndex = text.indexOf('<', index);
    if (openIndex < 0) break;
    const closing = text[openIndex + 1] === '/';
    const nameStart = openIndex + (closing ? 2 : 1);
    const nameMatch = text.slice(nameStart).match(/^([A-Za-z][\w:-]*)\b/);
    if (!nameMatch) {
      index = openIndex + 1;
      continue;
    }
    const name = nameMatch[1];
    const attributesStart = nameStart + name.length;
    let cursor = attributesStart;
    let quote = null;
    for (; cursor < text.length; cursor += 1) {
      const char = text[cursor];
      if (quote) {
        if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'") quote = char;
      else if (char === '>') break;
    }
    if (cursor >= text.length || quote) return { ok: false, error: 'Malformed SVG tag syntax.', tags };
    tags.push({ closing, name, rawAttributes: text.slice(attributesStart, cursor) });
    index = cursor + 1;
  }
  return { ok: true, tags };
}

function validateXmlTagNesting(tags) {
  const stack = [];
  let documentElementCount = 0;
  for (const tag of tags) {
    if (tag.closing) {
      const expected = stack.pop();
      if (!expected || expected !== tag.name) {
        return { ok: false, error: `Mismatched SVG closing tag: ${tag.name}.` };
      }
      continue;
    }
    if (stack.length === 0) {
      documentElementCount += 1;
      if (documentElementCount > 1) {
        return { ok: false, error: 'Multiple SVG document elements are forbidden.' };
      }
    }
    if (!tag.rawAttributes.trimEnd().endsWith('/')) stack.push(tag.name);
  }
  if (stack.length) return { ok: false, error: `Unclosed SVG element: ${stack.at(-1)}.` };
  return { ok: true };
}

function parseXmlAttributes(rawAttributes) {
  const text = String(rawAttributes);
  const attributes = [];
  const seenNames = new Set();
  let index = 0;

  while (index < text.length) {
    while (/\s/.test(text[index] || '')) index += 1;
    if (index >= text.length) break;
    if (text[index] === '/') {
      index += 1;
      while (/\s/.test(text[index] || '')) index += 1;
      if (index !== text.length) return { ok: false, error: 'Malformed SVG attribute syntax.' };
      break;
    }

    const nameMatch = text.slice(index).match(/^[:A-Za-z_][:A-Za-z0-9_.-]*/);
    if (!nameMatch) return { ok: false, error: 'Malformed SVG attribute syntax.' };
    const attributeName = nameMatch[0];
    if (seenNames.has(attributeName)) return { ok: false, error: `Duplicate SVG attribute: ${attributeName}.` };
    seenNames.add(attributeName);
    index += attributeName.length;

    while (/\s/.test(text[index] || '')) index += 1;
    if (text[index] !== '=') return { ok: false, error: `Malformed SVG attribute: ${attributeName}.` };
    index += 1;
    while (/\s/.test(text[index] || '')) index += 1;

    const quote = text[index];
    if (quote !== '"' && quote !== "'") return { ok: false, error: `SVG attribute must be quoted: ${attributeName}.` };
    index += 1;
    const valueStart = index;
    while (index < text.length && text[index] !== quote) {
      if (text[index] === '<') return { ok: false, error: `Malformed SVG attribute: ${attributeName}.` };
      index += 1;
    }
    if (index >= text.length) return { ok: false, error: `Unterminated SVG attribute: ${attributeName}.` };
    const value = text.slice(valueStart, index);
    index += 1;
    if (index < text.length && !/\s|\//.test(text[index])) {
      return { ok: false, error: `Malformed SVG attribute: ${attributeName}.` };
    }
    attributes.push([attributeName, value]);
  }

  return { ok: true, attributes };
}

export function inspectSvgText(text) {
  const errors = [];
  if (typeof text !== 'string' || !text.trim()) return { ok: false, errors: ['SVG is empty.'] };
  if (hasForbiddenDoctype(text)) errors.push('SVG doctype is forbidden.');
  if (hasForbiddenProcessingInstruction(text)) errors.push('SVG processing instructions are forbidden.');
  const xmlDeclaration = getXmlDeclaration(text);
  const canonicalText = xmlDeclaration.valid ? text.slice(xmlDeclaration.text.length) : text;
  // XML permits complete comments before the document element. Strip only the
  // leading prolog comments for root discovery; the full text is still scanned
  // below so malformed/unclosed comments continue to fail closed.
  const comments = stripXmlComments(canonicalText);
  if (!comments.ok) errors.push('Malformed XML comment or CDATA section.');
  const rootText = canonicalText.replace(/^(?:\s*<!--[\s\S]*?-->\s*)*/, '');
  if (!/^<svg\b/.test(rootText)) errors.push('SVG root is missing.');
  const rootMatch = rootText.match(/^<svg\b([^>]*)>/);
  if (!rootMatch) return { ok: false, errors };
  const attrs = rootMatch[1];
  const viewBox = attrs.match(/(?:^|\s)viewBox\s*=\s*["']([^"']+)["']/)?.[1]?.replace(/\s+/g, ' ').trim();
  if (viewBox !== REQUIRED_VIEWBOX) errors.push('viewBox must be exactly 0 0 24 24.');
  if (/(?:^|\s)(width|height)\s*=/i.test(attrs)) errors.push('Fixed root width/height is forbidden.');
  if (!new RegExp(`(?:^|\\s)xmlns\\s*=\\s*["']${REQUIRED_NAMESPACE.replace(/\//g, '\\/')}["']`).test(attrs)) {
    errors.push('SVG namespace is required.');
  }
  // Comments and CDATA are inert XML text. Ignore complete sections while scanning
  // for element/attribute policy violations so tag-like text inside them is not
  // mistaken for executable SVG markup. If an opening delimiter remains after
  // complete sections are removed, the XML section is unclosed and must fail closed.
  const scanText = comments.text
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  // DOMParser rejects illegal XML 1.0 code points before exposing text or
  // attributes. XML's Char production also applies inside inert comments and
  // CDATA, so scan the raw source before the lexical policy checks.
  if (hasInvalidRawXmlCharacter(canonicalText)) errors.push('Invalid raw XML character.');
  if (hasInvalidXmlCharacterReference(canonicalText)) errors.push('Invalid XML character reference.');
  if (/<!\[CDATA\[/.test(scanText)) errors.push('Malformed XML comment or CDATA section.');
  if (hasStrayCdataClose(scanText)) errors.push('Stray CDATA close delimiter is forbidden.');
  const scannedTags = scanXmlTags(scanText);
  if (!scannedTags.ok) errors.push(scannedTags.error);
  const nesting = validateXmlTagNesting(scannedTags.tags);
  if (!nesting.ok) errors.push(nesting.error);
  for (const scannedTag of scannedTags.tags) {
    const tag = scannedTag.name;
    if (FORBIDDEN_ELEMENTS.has(tag.toLowerCase()) || !ALLOWED_ELEMENTS.has(tag.toLowerCase()) || !isCanonicalElementName(tag)) errors.push(`Forbidden SVG element: ${tag}.`);
    if (scannedTag.closing) {
      if (scannedTag.rawAttributes.trim()) errors.push(`Malformed SVG closing tag: ${scannedTag.name}.`);
      continue;
    }
    const parsedAttributes = parseXmlAttributes(scannedTag.rawAttributes);
    if (!parsedAttributes.ok) {
      errors.push(parsedAttributes.error);
      continue;
    }
    for (const [attributeName, rawValue] of parsedAttributes.attributes) {
      const name = attributeName.toLowerCase();
      const value = decodeXmlAttributeValue(rawValue);
      if (isEventAttribute(name)) errors.push(`Event attribute is forbidden: ${name}.`);
      else if (isHrefAttribute(name)) errors.push('SVG href references are forbidden.');
      else if (!ALLOWED_ATTRIBUTES.has(name) || !isCanonicalAttributeName(attributeName)) errors.push(`Unsupported SVG attribute: ${attributeName}.`);
      if (name === 'xmlns' && value !== REQUIRED_NAMESPACE) errors.push('Foreign SVG namespace is forbidden.');
      if (name !== 'xmlns' && isInvalidReference(value)) errors.push(`External reference is forbidden: ${name}.`);
    }
  }
  if (!/<\/svg>\s*$/.test(scanText)) errors.push('SVG closing tag is missing.');
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}
