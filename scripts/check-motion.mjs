import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./site.js', import.meta.url), 'utf8');

class Element extends EventTarget {
    constructor() {
        super();
        this.childNodes = [];
        this.attributes = new Map();
        const classes = new Set();
        this.classList = { add: key => classes.add(key), remove: key => classes.delete(key), contains: key => classes.has(key) };
        this.open = false;
    }
    querySelector() { return this.childNodes[0]; }
    appendChild(node) {
        if (node.parentElement) node.parentElement.childNodes = node.parentElement.childNodes.filter(child => child !== node);
        this.childNodes.push(node);
        node.parentElement = this;
    }
    setAttribute(key, value) { this.attributes.set(key, value); }
    removeAttribute(key) { this.attributes.delete(key); }
    closest() { return null; }
    getBoundingClientRect() { return { height: this.intermediateHeight ?? 150 }; }
    animate(frames, options) {
        this.lastAnimation = { frames, options, cancel() { this.cancelled = true; } };
        return this.lastAnimation;
    }
}

function setup({ reduced = false, supported = true } = {}) {
    const details = new Element(), summary = new Element(), body = new Element();
    details.appendChild(summary);
    details.appendChild(body);
    if (!supported) details.animate = null;
    const preference = new EventTarget();
    preference.matches = reduced;
    const window = new EventTarget();
    window.matchMedia = () => preference;
    const document = {
        querySelector() { return null; }, // Animation setup must also run without mobile navigation.
        querySelectorAll() { return [details]; },
        createElement() { return new Element(); },
        addEventListener(type, callback) { assert.equal(type, 'DOMContentLoaded'); this.ready = callback; }
    };
    vm.runInNewContext(source, { document, window });
    document.ready();
    const click = options => {
        const event = new Event('click', { cancelable: true });
        Object.assign(event, { button: 0, ...options });
        summary.dispatchEvent(event);
        return event;
    };
    return { details, summary, content: details.childNodes[1], preference, window, click };
}

const basic = setup();
basic.click();
assert.equal(basic.details.open, true);
assert.deepEqual(Array.from(basic.content.lastAnimation.frames, frame => frame.height), ['0px', '150px']);
assert.equal(basic.summary.attributes.get('aria-expanded'), 'true');
basic.content.lastAnimation.onfinish();
assert.equal(basic.content.classList.contains('is-animating'), false);
assert.equal(basic.summary.attributes.has('aria-expanded'), false);
basic.click();
assert.equal(basic.details.open, true, 'Keep contents rendered until the closing animation ends');
assert.equal(basic.content.inert, true, 'Closing content must not keep keyboard targets active');
basic.content.lastAnimation.onfinish();
assert.equal(basic.details.open, false);
assert.equal(basic.content.inert, false);

const rapid = setup();
rapid.click();
const first = rapid.content.lastAnimation;
rapid.content.intermediateHeight = 45;
rapid.click();
assert.equal(first.cancelled, true);
assert.equal(first.onfinish, null, 'An interrupted animation cannot later overwrite the new state');
assert.deepEqual(Array.from(rapid.content.lastAnimation.frames, frame => frame.height), ['45px', '0px']);
rapid.click();
rapid.content.lastAnimation.onfinish();
assert.equal(rapid.details.open, true);

const reduced = setup({ reduced: true });
reduced.click();
assert.equal(reduced.details.open, true);
assert.equal(reduced.content.lastAnimation, undefined);
reduced.click();
assert.equal(reduced.details.open, false);

for (const trigger of ['resize', 'preference']) {
    const fixture = setup();
    fixture.click();
    if (trigger === 'resize') fixture.window.dispatchEvent(new Event('resize'));
    else {
        fixture.preference.matches = true;
        fixture.preference.dispatchEvent(new Event('change'));
    }
    assert.equal(fixture.content.lastAnimation.cancelled, true);
    assert.equal(fixture.details.open, true);
    assert.equal(fixture.content.classList.contains('is-animating'), false);
}

const ignored = setup();
assert.equal(ignored.click({ ctrlKey: true }).defaultPrevented, false);
assert.equal(ignored.click({ button: 1 }).defaultPrevented, false);
assert.equal(ignored.details.open, false);
const fallback = setup({ supported: false });
assert.equal(fallback.click().defaultPrevented, false, 'Unsupported browsers keep native details behavior');
console.log('Motion checks passed: desktop setup, open/close, interruption, reduced motion, resize, and native fallback.');
