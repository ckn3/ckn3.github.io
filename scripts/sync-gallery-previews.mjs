import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run with cwebp installed. Originals remain the lightbox/download targets.
const root = fileURLToPath(new URL('../', import.meta.url));
const page = path.join(root, 'gallery.html');
const manifestPath = path.join(root, 'data/gallery-previews.json');
const checkOnly = process.argv.includes('--check');
const settings = { widths: [400, 800], quality: 82, method: 6 };
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const old = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const cache = new Map((old.images || []).map(item => [item.source, item]));
const entries = new Map();
const attribute = (tag, key) => tag.match(new RegExp(`(?:^|\\s)${key}="([^"]*)"`))?.[1];
const setAttribute = (tag, key, value) => {
    const pattern = new RegExp(`\\s${key}="[^"]*"`);
    return pattern.test(tag) ? tag.replace(pattern, ` ${key}="${value}"`) : tag.replace(/>$/, ` ${key}="${value}">`);
};

function previews(source, width, height) {
    if (entries.has(source)) return entries.get(source);
    assert.ok(source.startsWith('figures/') && !source.includes('..'), `Unexpected image path: ${source}`);
    const bytes = fs.readFileSync(path.join(root, source));
    const sourceHash = sha256(bytes);
    const previous = cache.get(source);
    const variants = [...new Set(settings.widths.map(size => Math.min(size, width)))].map(size => {
        const relative = source.slice('figures/'.length).replace(/\.[^.]+$/, '');
        const file = `figures/gallery-previews/${relative}-${size}.webp`;
        const target = path.join(root, file);
        const previousVariant = previous?.variants.find(item => item.file === file);
        const valid = JSON.stringify(old.settings) === JSON.stringify(settings) && previous?.sha256 === sourceHash &&
            fs.existsSync(target) && previousVariant?.sha256 === sha256(fs.readFileSync(target));
        if (checkOnly) assert.ok(valid, `Missing/stale gallery preview: ${file}. Run npm run sync:gallery.`);
        else if (!valid) {
            fs.mkdirSync(path.dirname(target), { recursive: true });
            execFileSync('cwebp', ['-quiet', '-q', String(settings.quality), '-m', String(settings.method),
                '-metadata', 'none', '-resize', String(size), '0', path.join(root, source), '-o', target]);
        }
        const generated = fs.readFileSync(target);
        return { file, width: size, height: Math.round(height * size / width), bytes: generated.length, sha256: sha256(generated) };
    });
    const entry = { source, width, height, bytes: bytes.length, sha256: sourceHash, variants };
    entries.set(source, entry);
    return entry;
}

const original = fs.readFileSync(page, 'utf8');
const generated = original.replace(/<img\b[^>]*>/g, tag => {
    if (!attribute(tag, 'class')?.split(/\s+/).includes('gallery-trigger')) return tag;
    const source = attribute(tag, 'data-full-src') || attribute(tag, 'src');
    const width = Number(attribute(tag, 'width')), height = Number(attribute(tag, 'height'));
    assert.ok(width > 0 && height > 0, `Missing dimensions: ${source}`);
    const entry = previews(source, width, height);
    // Lazy images use their actual layout width where supported, with a conservative fallback.
    const auto = attribute(tag, 'loading') === 'lazy' ? 'auto, ' : '';
    tag = setAttribute(tag, 'src', entry.variants[0].file);
    tag = setAttribute(tag, 'data-full-src', source);
    tag = setAttribute(tag, 'srcset', entry.variants.map(item => `${item.file} ${item.width}w`).join(', '));
    return setAttribute(tag, 'sizes', `${auto}(max-width: 600px) 55vw, (max-width: 900px) 45vw, 440px`);
});
assert.ok(entries.size > 0, 'No gallery images found');
const manifest = { settings, images: [...entries.values()] };
if (checkOnly) {
    assert.equal(generated, original, 'Gallery preview markup is outdated. Run npm run sync:gallery.');
    assert.deepEqual(manifest, old, 'Gallery preview manifest is outdated. Run npm run sync:gallery.');
} else {
    fs.writeFileSync(page, generated);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
const mb = bytes => (bytes / 1e6).toFixed(2);
const total = [...entries.values()].reduce((sum, item) => sum + item.bytes, 0);
const small = [...entries.values()].reduce((sum, item) => sum + item.variants[0].bytes, 0);
const large = [...entries.values()].reduce((sum, item) => sum + item.variants.at(-1).bytes, 0);
console.log(`${checkOnly ? 'Verified' : 'Generated'} previews for ${entries.size} photos: originals ${mb(total)} MB; 400px ${mb(small)} MB; 800px ${mb(large)} MB.`);
