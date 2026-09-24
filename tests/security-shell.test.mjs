import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const antiFrameSource = fs.readFileSync(new URL('../js/anti-frame.js', import.meta.url), 'utf8');
const cspMeta = html.match(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/)?.[0] || '';

assert.ok(cspMeta, 'index.html should contain a meta-delivered CSP');
assert.doesNotMatch(cspMeta, /frame-ancestors/i, 'frame-ancestors must not be claimed in meta CSP because browsers ignore it there');
assert.match(html, /<style id="antiFrameGuard">body \{ display: none !important; \}<\/style>/, 'anti-frame guard should hide the app before scripts run');
assert.match(html, /<script type="module" src="js\/anti-frame\.js"><\/script>/, 'anti-frame module should run from the document head');
assert.match(antiFrameSource, /window\.self === window\.top/, 'anti-frame guard should distinguish top-level from framed documents');
assert.match(antiFrameSource, /guard\?\.remove\(\)/, 'top-level documents should remove the guard');
assert.match(antiFrameSource, /window\.top\.location = window\.self\.location\.href/, 'framed documents should attempt to escape the frame');

console.log('Shell anti-framing security tests passed.');
