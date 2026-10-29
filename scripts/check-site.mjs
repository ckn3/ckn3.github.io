import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['index.html', 'publications.html', 'teach.html', 'team.html', 'academic_honors.html', 'gallery.html', '404.html', 'courses/dsc5001.html', 'courses/cs5487.html', 'projects/geospatial-ai.html'];
const html = new Map(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/publications.json'), 'utf8'));
const paperIds = Object.values(data.selected).flat().map(paper => paper.id);
const ids = new Map();
const styleVersions = new Set();

for (const [file, source] of html) {
    const list = [...source.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(list).size, list.length, `${file}: duplicate IDs`);
    ids.set(file, new Set(list));
    const version = source.match(/site\.css\?v=(\d+)/);
    assert.ok(version, `${file}: missing CSS cache version`);
    styleVersions.add(version[1]);
    for (const [image, imageSource] of source.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
        assert.ok(!/^https?:\/\//.test(imageSource), `${file}: externally hosted image ${imageSource}`);
        assert.match(image, /\bwidth="[1-9]\d*"/, `${file}: image has no reserved width`);
        assert.match(image, /\bheight="[1-9]\d*"/, `${file}: image has no reserved height`);
    }
}
assert.equal(styleVersions.size, 1, 'Pages use different CSS cache versions');

let references = 0;
for (const [file, source] of html) {
    for (const [, raw] of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const url = new URL(raw.replaceAll('&amp;', '&'), `https://local.test/${file}`);
        if (url.origin !== 'https://local.test') continue;
        const target = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
        assert.ok(fs.existsSync(path.join(root, target)), `${file}: missing ${raw}`);
        if (url.hash && ids.has(target)) assert.ok(ids.get(target).has(decodeURIComponent(url.hash.slice(1))), `${file}: missing anchor ${raw}`);
        references++;
    }
}

const home = html.get('index.html');
const news = home.slice(home.indexOf('aria-labelledby="news"'), home.indexOf('<details class="text-disclosure news-archive"'));
assert.equal((news.match(/class="news-card"/g) || []).length, 4);
assert.ok(home.indexOf('id="featured-research"') < home.indexOf('id="news"'));
assert.ok(home.indexOf('id="featured-research"') < home.indexOf('id="positions"'));
assert.match(home, /class="hero-role"><strong>Assistant Professor of Data Science<\/strong>/);
assert.match(home, /class="hero-office">Office: AC4-422<\/p>/);
assert.doesNotMatch(home, /<h[1-6][^>]*>Teaching\b|class="home-course-links"/);
assert.equal((html.get('publications.html').match(/class="research-topic"/g) || []).length, 3);
const research = html.get('publications.html');
assert.doesNotMatch(research, /id="featured-research"|href="#featured-research"|publications-fallback/);
assert.equal((home.match(/class="research-highlight"/g) || []).length, 3);
assert.equal((home.match(/class="research-highlight-image"/g) || []).length, 3);
for (const featured of data.featured) {
    const paper = Object.values(data.selected).flat().find(item => item.id === featured.id);
    assert.ok(home.includes(`src="${paper.image.src}"`), `Missing featured research image: ${featured.id}`);
    assert.ok(home.includes(`<p class="research-highlight-role">${featured.authorRole}</p>`), `Missing featured author role: ${featured.id}`);
}
assert.deepEqual(data.featured.map(item => item.authorRole), ['Co-first author', 'Co-first and corresponding author', 'Co-author']);
assert.ok(research.indexOf('id="modal-links"') < research.indexOf('class="modal-abstract-block"'), 'Modal resource links must precede the abstract');
const entries = [...research.matchAll(/<article class="(?:publication-entry|conference-entry)[^"]*" id="([^"]+)">([\s\S]*?)<\/article>/g)];
assert.deepEqual(entries.map(entry => entry[1]), paperIds, 'Static paper order does not match the registry');
for (const [, id, content] of entries) {
    assert.ok(ids.get('publications.html').has(id), `Paper anchor is not in HTML: ${id}`);
    assert.match(content, /<details class="publication-details">/, `${id}: missing no-script details`);
    assert.match(content, /<summary [^>]*aria-label="View publication details: [^"]+">Details<\/summary>/);
    assert.match(content, /<p class="publication-abstract">[^<]+<\/p>/, `${id}: missing static abstract`);
    assert.match(content, /<a class="badge-chip" href="[^"]+"/, `${id}: missing resource links`);
    assert.ok(content.includes(`data-citation-id="${id}"`), `${id}: missing citation`);
}
const relatedIds = [...research.matchAll(/class="direction-item" data-publication-id="([^"]+)"/g)].map(match => match[1]);
assert.equal(relatedIds.length, Object.keys(data.citations).length, 'Expected a citation for every related publication');
assert.equal(new Set(relatedIds).size, relatedIds.length, 'Each publication must have one primary research theme');
assert.deepEqual(new Set(relatedIds), new Set(Object.keys(data.citations)), 'Citation coverage must match related publications');
const themeIds = data.themes.flatMap(theme => theme.groups.flatMap(group => group.ids));
assert.deepEqual(themeIds, relatedIds, 'Theme order must match the publication registry');
for (const theme of data.themes) {
    const count = theme.groups.reduce((sum, group) => sum + group.ids.length, 0);
    const block = research.split(`<!-- theme:${theme.id}:start -->`)[1].split(`<!-- theme:${theme.id}:end -->`)[0];
    assert.ok(block.includes(`Publications &amp; preprints (${count})`), `${theme.id}: stale publication count`);
    for (const group of theme.groups) {
        const years = group.ids.map(id => data.citations[id].listing.year);
        assert.deepEqual(years, [...years].sort((a, b) => b - a), `${theme.id}: newest papers must come first`);
    }
}
assert.equal(data.scholarImport.records.length, data.scholarImport.recordCount, 'Incomplete Scholar import');
assert.equal(new Set(data.scholarImport.records.map(record => record.scholarId)).size, data.scholarImport.recordCount, 'Duplicate Scholar records');
assert.deepEqual(new Set(data.scholarImport.records.filter(record => record.kind !== 'patent').map(record => record.publicationId)), new Set(relatedIds), 'Every Scholar paper must be represented');
for (const record of data.scholarImport.records.filter(record => record.kind === 'patent')) {
    assert.ok(ids.get('publications.html').has(record.publicationId), `Missing Scholar patent: ${record.title}`);
}
const citationKeys = new Set();
for (const [id, citation] of Object.entries(data.citations)) {
    const key = citation.bibtex.match(/^@(?:article|inproceedings|misc)\{([^,]+),/i)?.[1];
    assert.ok(key && !citationKeys.has(key), `${id}: missing or duplicate BibTeX key`);
    citationKeys.add(key);
    for (const field of ['title', 'author', 'year', 'url']) assert.match(citation.bibtex, new RegExp(`\\b${field}\\s*=\\s*[{"]`, 'i'), `${id}: missing ${field}`);
    assert.match(citation.bibtex, /Cui, Kangning/, `${id}: wrong authors`);
    assert.equal(new URL(citation.source.url).protocol, 'https:');
    if (citation.source.label === 'arXiv') {
        assert.match(citation.bibtex, /^@misc\{/);
        assert.match(citation.note, /arXiv version/);
    }
    if (citation.listing.kind === 'preprint') assert.match(citation.listing.venue, /Preprint/);
}
for (const [file, source] of [['publications.html', research], ['projects/geospatial-ai.html', html.get('projects/geospatial-ai.html')]]) {
    assert.doesNotMatch(source, /href="[^"]+\.bib(?:[?#][^"]*)?"/, `${file}: citations must not download`);
    const citations = [...source.matchAll(/<details class="citation-details" data-citation-id="([^"]+)"[^>]*>[\s\S]*?<code>([\s\S]*?)<\/code>[\s\S]*?<\/details>/g)];
    assert.equal(citations.length, file === 'publications.html' ? relatedIds.length + paperIds.length : 3, `${file}: missing static citation fallback`);
    for (const [, id, bibtex] of citations) {
        const escaped = data.citations[id].bibtex.trim().replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
        assert.equal(bibtex, escaped, `${file}: stale citation for ${id}`);
    }
}
for (const feature of data.featured) assert.ok(paperIds.includes(feature.id), `Unknown highlight: ${feature.id}`);
for (const paper of Object.values(data.selected).flat()) {
    assert.ok(fs.existsSync(path.join(root, paper.image.src)), `Missing publication image: ${paper.image.src}`);
    assert.ok(paper.image.width > 0 && paper.image.height > 0, `Missing publication image dimensions: ${paper.id}`);
}
assert.deepEqual(data.featured.map(feature => feature.id), ['paper-lowrankarena-neurips', 'paper-palms-ijcai', 'paper-ecg-horizons-neurips']);

const team = html.get('team.html');
for (const [file, source] of [['index.html', home], ['team.html', team]]) {
    assert.match(source, /All PhD positions through and including Fall 2027 have been filled\./, `${file}: missing recruitment status`);
    assert.doesNotMatch(source, /PhD positions are available|PhD opportunities at CityU/, `${file}: stale PhD recruitment notice`);
}
assert.match(team, /src="figures\/team\/mallory-pitts-linkedin\.webp" alt="Mallory Pitts" width="400" height="400"/);
for (const item of JSON.parse(fs.readFileSync(path.join(root, 'data/image-sources.json'), 'utf8')).images) {
    assert.ok(fs.existsSync(path.join(root, item.file)), `Missing localized image: ${item.file}`);
}
assert.ok(team.indexOf('>Current Students</h3>') < team.indexOf('<aside class="recruitment-note"'));
assert.ok(team.indexOf('<aside class="recruitment-note"') < team.indexOf('>Former Students</h3>'));
const services = html.get('academic_honors.html');
assert.ok(services.indexOf('>Review Experience</h3>') < services.indexOf('>Community Service</h3>'));
assert.match(services, /<details class="text-disclosure journal-reviewers">/);
const conferences = services.match(/<dl class="conference-reviews"[^>]*>([\s\S]*?)<\/dl>/)?.[1];
assert.ok(conferences, 'Missing aligned conference review list');
assert.equal((conferences.match(/<dt>/g) || []).length, 13);
assert.match(conferences, /<dt>ICLR<\/dt><dd>2027<\/dd>/);
assert.match(conferences, /<dt>AAMAS<\/dt><dd>2027<\/dd>/);

for (const course of ['cs5487', 'dsc5001']) {
    const source = html.get(`courses/${course}.html`);
    assert.match(source, /href="#assignments"/);
    assert.ok(source.indexOf('id="materials"') < source.indexOf('id="assignments"'));
    assert.ok(source.indexOf('id="assignments"') < source.indexOf('id="schedule"'));
    for (const suffix of ['assignment1.pdf', 'assignment1-solutions.pdf']) {
        const file = `${course.toUpperCase()}-${suffix}`;
        assert.ok(source.includes(`href="../docs/courses/${course}/2026a/${file}"`));
        const pdf = fs.readFileSync(path.join(root, 'docs/courses', course, '2026a', file));
        assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', `Invalid assignment PDF: ${file}`);
    }
}

for (const [course, weights] of [['dsc5001', [10, 20, 20, 50]], ['cs5487', [30, 10, 30, 30]]]) {
    const source = html.get(`courses/${course}.html`);
    assert.deepEqual([...source.matchAll(/<strong>(\d+)%<\/strong>/g)].map(m => Number(m[1])), weights);
    assert.ok(source.indexOf('id="materials"') < source.indexOf('id="schedule"'));
    const rows = source.match(/<tr><th scope="row">\d+<\/th>[\s\S]*?<\/tr>/g) || [];
    assert.equal(rows.length, 8);
    for (const [index, row] of rows.entries()) {
        const week = index + 1;
        assert.ok(row.includes(`<th scope="row">${week}</th>`) && row.includes(`-l${week}.pdf`));
        const tutorial = `${course.toUpperCase()}-t${week}s.pdf`;
        if (fs.existsSync(path.join(root, 'docs/courses', course, '2026a', tutorial))) {
            assert.ok(row.includes(tutorial), `${course}: missing tutorial link for week ${week}`);
        } else {
            assert.match(row, /<td>Not posted<\/td><\/tr>$/, `${course}: unpublished tutorial needs a clear status`);
        }
        assert.match(row, /class="material-topic">[^<]+<\/td>/);
    }
}
console.log(`Site checks passed: ${files.length} pages, ${references} local references, research highlights, page order, and course assessments.`);
