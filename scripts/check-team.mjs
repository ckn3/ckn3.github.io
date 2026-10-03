import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('./team.js', import.meta.url), 'utf8');
const baseURI = 'https://example.test/team.html';
const fallback = new URL('figures/team/avatar-placeholder.svg', baseURI).href;

class TestImage extends EventTarget {
    constructor(src, complete, naturalWidth) {
        super();
        Object.assign(this, {src, complete, naturalWidth, alt: 'Test person'});
    }
}

const loaded = new TestImage('https://example.test/portrait.webp', true, 320);
const cachedFailure = new TestImage('https://example.test/missing.webp', true, 0);
const pending = new TestImage('https://example.test/pending.webp', false, 0);
const failedPlaceholder = new TestImage(fallback, true, 0);
const images = [loaded, cachedFailure, pending, failedPlaceholder];
const document = {
    baseURI,
    addEventListener(event, callback) { assert.equal(event, 'DOMContentLoaded'); this.ready = callback; },
    querySelectorAll(selector) { assert.equal(selector, '.person-card img'); return images; }
};
vm.runInNewContext(script, {document, URL});
document.ready();
assert.equal(loaded.src, 'https://example.test/portrait.webp');
assert.equal(cachedFailure.src, fallback);
assert.equal(cachedFailure.alt, 'Test person (photo unavailable)');
assert.equal(pending.src, 'https://example.test/pending.webp');
pending.dispatchEvent(new Event('error'));
assert.equal(pending.src, fallback);
pending.src = 'https://example.test/replacement.webp';
pending.dispatchEvent(new Event('error'));
assert.equal(pending.src, 'https://example.test/replacement.webp', 'Fallback listener must run only once');
failedPlaceholder.dispatchEvent(new Event('error'));
assert.equal(failedPlaceholder.src, fallback, 'Do not loop when the fallback itself fails');
assert.equal(failedPlaceholder.alt, 'Test person');
console.log('Team checks passed: successful images, cached failures, late failures, and no fallback loops.');
