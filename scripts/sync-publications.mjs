import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/publications.json', root), 'utf8'));
const page = new URL('publications.html', root);
const original = await readFile(page, 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderPaper(paper, section) {
    assert.match(paper.id, /^paper-[a-z0-9-]+$/);
    assert.ok(data.abstracts[paper.title], `Missing abstract: ${paper.id}`);
    // Author emphasis and contribution marks are the only markup in the registry.
    const authorText = paper.authorsHtml.replace(/<\/?(?:span|sup)(?: class="main-author")?>/g, '');
    assert.ok(!/[<>]/.test(authorText), `Unexpected author markup: ${paper.id}`);
    const entryClass = section === 'journals' ? 'publication-entry' : 'conference-entry';
    const textClass = section === 'journals' ? 'publication-text' : 'conference-text';
    const highlight = paper.highlight === 'primary' ? ' highlight-entry' : paper.highlight === 'collaborative' ? ' collaborative-highlight' : '';
    const badges = paper.badges.map(badge => {
        if (!badge.href) return `                        <span class="badge-chip">${escape(badge.label)}</span>`;
        const url = new URL(badge.href, 'https://ckn3.github.io/');
        assert.ok(['http:', 'https:'].includes(url.protocol), `Invalid resource URL: ${paper.id}`);
        const external = /^https?:\/\//.test(badge.href) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `                        <a class="badge-chip" href="${escape(badge.href)}"${external}>${escape(badge.label)}</a>`;
    }).join('\n');
    const image = paper.image;
    return `            <article class="${entryClass}${highlight}" id="${escape(paper.id)}">
                <div class="${textClass}">
                    <p class="title"><span class="paper-title"><strong>${escape(paper.title)}</strong></span><span class="venue">${escape(paper.venue)}</span></p>
                    <p class="authors">${paper.authorsHtml}</p>
                    <div class="badges">
${badges}
                        <details class="publication-details">
                            <summary class="badge-chip publication-details-toggle" aria-label="View publication details: ${escape(paper.title)}">Details</summary>
                            <div class="publication-detail-content">
                                <img class="publication-detail-image" src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
                                <h3>Abstract</h3>
                                <p class="publication-abstract">${escape(data.abstracts[paper.title])}</p>
                            </div>
                        </details>
                    </div>
                </div>
            </article>`;
}

let generated = original;
for (const section of ['journals', 'conferences']) {
    const marker = new RegExp(`<!-- publications:${section}:start -->[\\s\\S]*?<!-- publications:${section}:end -->`, 'g');
    assert.equal([...generated.matchAll(marker)].length, 1, `Expected one ${section} block`);
    const block = `<!-- publications:${section}:start -->\n${data.selected[section].map(paper => renderPaper(paper, section)).join('\n')}\n        <!-- publications:${section}:end -->`;
    generated = generated.replace(marker, () => block);
}
if (process.argv.includes('--check')) {
    assert.equal(generated, original, 'Static publications are out of date. Run npm run sync:publications.');
    console.log('Static publication lists, resources, and abstracts are synchronized.');
} else {
    await writeFile(page, generated);
    console.log('Updated static publication lists and no-JavaScript details.');
}
