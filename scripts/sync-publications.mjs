import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { citationMetadata, publicationSchema } from './publication-metadata.mjs';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/publications.json', root), 'utf8'));
const page = new URL('publications.html', root);
const original = await readFile(page, 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderCitation(id, variant = 'badge-chip') {
    const citation = data.citations[id];
    assert.ok(citation?.bibtex && citation.source?.url, `Missing citation: ${id}`);
    return `<details class="citation-details" data-citation-id="${escape(id)}" data-title="${escape(citation.title)}" data-source="${escape(citation.source.url)}" data-source-label="${escape(citation.source.label)}" data-note="${escape(citation.note)}"><summary class="${variant}" aria-label="View BibTeX citation: ${escape(citation.title)}">BibTeX</summary><pre><code>${escape(citation.bibtex.trim())}</code></pre></details>`;
}

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
    return `            <article class="${entryClass}${highlight}" id="selected-${escape(paper.id)}">
                <div class="${textClass}">
                    <p class="title"><span class="paper-title"><strong>${escape(paper.title)}</strong></span><span class="venue">${escape(paper.venue)}</span></p>
                    <p class="authors">${paper.authorsHtml}</p>
                    <div class="badges">
${badges}
                        ${renderCitation(paper.id)}
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
const selectedIds = new Set(Object.values(data.selected).flat().map(paper => paper.id));
const themeNames = { 'efficient-ml': 'Efficient & Reliable ML', 'geospatial-ai': 'Geospatial AI', 'medical-ai': 'Medical AI' };
const paperThemes = new Map(data.themes.flatMap(theme => theme.groups.flatMap(group => group.ids.map(id => [id, theme.id]))));
function renderRelated(id) {
    const citation = data.citations[id];
    assert.ok(citation?.listing, `Missing theme listing: ${id}`);
    const { venue, resources, kind } = citation.listing;
    const { authors, year } = citationMetadata(citation);
    const links = resources.map(resource => {
        assert.equal(new URL(resource.href).protocol, 'https:', `${id}: invalid resource URL`);
        return `<a class="paper-inline" href="${escape(resource.href)}" target="_blank" rel="noopener noreferrer">${escape(resource.label)}</a>`;
    });
    const theme = paperThemes.get(id);
    const authorLine = authors.map(name => name === 'Kangning Cui' ? `<strong class="main-author">${escape(name)}</strong>` : escape(name)).join(', ');
    const publicationYear = year !== citation.listing.year ? ` · Published ${year}` : '';
    const detailsLink = selectedIds.has(id) ? `<a class="paper-inline" href="#selected-${escape(id)}">Abstract &amp; details</a>` : '';
    return `            <article class="direction-item" data-publication-id="${escape(id)}" id="${escape(id)}" data-year="${year}" data-theme="${theme}" data-kind="${kind}" tabindex="-1">
                <div class="direction-title"><a href="#${escape(id)}" aria-label="Permanent link: ${escape(citation.title)}">${escape(citation.title)}</a></div>
                <p class="library-authors">${authorLine}</p>
                <div class="direction-resources"><span class="venue-inline">${escape(venue + publicationYear)}</span><span class="library-theme">${escape(themeNames[theme])}</span>${links.join('')}${renderCitation(id, 'citation-inline')}${detailsLink}</div>
            </article>`;
}
const libraryIds = [...paperThemes.keys()].sort((a, b) => citationMetadata(data.citations[b]).year - citationMetadata(data.citations[a]).year);
const years = [...new Set(libraryIds.map(id => citationMetadata(data.citations[id]).year))];
const libraryMarker = /<!-- publication-library:start -->[\s\S]*?<!-- publication-library:end -->/g;
assert.equal([...generated.matchAll(libraryMarker)].length, 1, 'Expected one publication library');
generated = generated.replace(libraryMarker, () => `<!-- publication-library:start -->
        <form class="publication-filters" id="publication-filters" aria-label="Filter publications" hidden>
            <label class="publication-search">Search <input type="search" name="search" placeholder="Title, author or venue" autocomplete="off"></label>
            <label>Research theme <select name="theme"><option value="">All themes</option>${Object.entries(themeNames).map(([id, name]) => `<option value="${id}">${escape(name)}</option>`).join('')}</select></label>
            <label>Year <select name="year"><option value="">All years</option>${years.map(year => `<option value="${year}">${year}</option>`).join('')}</select></label>
            <label>Status <select name="kind"><option value="">All statuses</option><option value="published">Published / accepted</option><option value="preprint">Preprints</option><option value="abstract">Conference abstracts</option></select></label>
            <button type="reset" class="library-reset">Reset</button>
        </form>
        <p class="library-count" id="publication-count" role="status" aria-live="polite">${libraryIds.length} publications and preprints</p>
        <div class="publication-library" id="publication-library">
${libraryIds.map(renderRelated).join('\n')}
        </div>
        <p class="library-empty" id="publication-empty" hidden>No matching publications. Try another keyword or reset the filters.</p>
        <button class="library-more" id="publication-more" type="button" hidden>Show more publications</button>
        <!-- publication-library:end -->`);
const schemaMarker = /<!-- publication-schema:start -->[\s\S]*?<!-- publication-schema:end -->/g;
assert.equal([...generated.matchAll(schemaMarker)].length, 1, 'Expected one publication schema block');
generated = generated.replace(schemaMarker, () => `<!-- publication-schema:start -->\n    <script type="application/ld+json" id="schema-publications">${JSON.stringify(publicationSchema(data.citations)).replaceAll('<', '\\u003c')}</script>\n    <!-- publication-schema:end -->`);
for (const section of ['journals', 'conferences']) {
    const marker = new RegExp(`<!-- publications:${section}:start -->[\\s\\S]*?<!-- publications:${section}:end -->`, 'g');
    assert.equal([...generated.matchAll(marker)].length, 1, `Expected one ${section} block`);
    const block = `<!-- publications:${section}:start -->\n${data.selected[section].map(paper => renderPaper(paper, section)).join('\n')}\n        <!-- publications:${section}:end -->`;
    generated = generated.replace(marker, () => block);
}
// Related lists and project pages share the same citation text as selected papers.
function syncCitations(source) {
    return source.replace(/<details class="citation-details" data-citation-id="([^"]+)"[^>]*>[\s\S]*?<\/details>/g, (block, id) => {
        const variant = block.match(/<summary class="([^"]+)"/)?.[1] || 'citation-inline';
        return renderCitation(id, variant);
    });
}
generated = syncCitations(generated);
const projectPages = ['projects/geospatial-ai.html', 'projects/efficient-llm.html', 'projects/medical-ai.html'];
const outputs = [{ url: page, original, generated }];
for (const file of projectPages) {
    const url = new URL(file, root);
    const source = await readFile(url, 'utf8');
    outputs.push({ url, original: source, generated: syncCitations(source) });
}
for (const output of outputs) {
    if (process.argv.includes('--check')) assert.equal(output.generated, output.original, `Static publications are out of date: ${output.url.pathname}. Run npm run sync:publications.`);
    else await writeFile(output.url, output.generated);
}
console.log(process.argv.includes('--check') ? 'Publication library, schema, and project citations are synchronized.' : 'Updated publication library, schema, and project citations.');
