import { readFile, writeFile } from 'node:fs/promises';

// Homepage highlights share the publication data but are not repeated on Research.
const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/publications.json', root), 'utf8'));
const papers = new Map(Object.values(data.selected).flat().map(paper => [paper.id, paper]));
const checkOnly = process.argv.includes('--check');
const escape = text => text.replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const marker = /<!-- featured-research:start -->[\s\S]*?<!-- featured-research:end -->/g;

for (const file of ['index.html']) {
    const prefix = 'publications.html';
    const cards = data.featured.map(feature => {
        const publications = [feature.id, ...(feature.relatedIds ?? [])].map(id => {
            const paper = papers.get(id);
            if (!paper) throw new Error(`Unknown featured publication: ${id}`);
            return paper;
        });
        const paper = publications[0];
        if (!feature.authorRole) throw new Error(`Missing author role: ${feature.id}`);
        const venues = publications.map(publication => {
            const label = escape(publication.venue.replace(/^\[|\]$/g, ''));
            return `<a href="${prefix}#${escape(publication.id)}" title="${escape(publication.title)}">${label}</a>`;
        }).join('<span aria-hidden="true"> · </span>');
        const related = (feature.furtherReading ?? []).map(({id, label}) => {
            const publication = papers.get(id);
            if (!publication) throw new Error(`Unknown related publication: ${id}`);
            return `<a href="${prefix}#${escape(id)}" title="${escape(publication.title)}">${escape(label)}</a>`;
        }).join(' · ');
        return `            <article class="research-highlight">
                <p class="research-highlight-theme">${escape(feature.theme)}</p>
                <a class="research-highlight-image" href="${prefix}#${escape(paper.id)}" aria-label="View ${escape(feature.heading)}">
                    <img src="${escape(paper.image.src)}" alt="${escape(paper.image.alt)}" width="${paper.image.width}" height="${paper.image.height}" loading="lazy" decoding="async">
                </a>
                <h3><a href="${prefix}#${escape(paper.id)}" title="${escape(paper.title)}">${escape(feature.heading)}</a></h3>
                <p class="research-highlight-contribution">${escape(feature.contribution)}</p>
                <p class="research-highlight-venue">${venues}</p>
                <p class="research-highlight-role">${escape(feature.authorRole)}</p>
                ${related ? `<p class="research-highlight-related">Also: ${related}</p>` : ''}
            </article>`;
    }).join('\n');
    const block = `<!-- featured-research:start -->
        <div class="research-highlights">
${cards}
        </div>
        <!-- featured-research:end -->`;
    const url = new URL(file, root);
    const original = await readFile(url, 'utf8');
    if ([...original.matchAll(marker)].length !== 1) throw new Error(`Expected one highlight block in ${file}`);
    const generated = original.replace(marker, () => block);
    if (checkOnly && generated !== original) throw new Error(`Outdated highlights in ${file}. Run npm run sync:publications.`);
    if (!checkOnly) await writeFile(url, generated);
}
console.log(checkOnly ? 'Featured research is synchronized.' : 'Updated homepage research highlights.');
