import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBibtex, formatBibtex } from './bibtex.mjs';

const data = JSON.parse(await readFile(new URL('../data/publications.json', import.meta.url), 'utf8'));
const keys = new Set();
for (const [id, citation] of Object.entries(data.citations)) {
    const entry = parseBibtex(citation.bibtex);
    const fields = entry.fields;
    assert.equal(formatBibtex(entry), citation.bibtex, `${id}: inconsistent citation formatting`);
    assert.ok(!keys.has(entry.key), `${id}: duplicate citation key`);
    keys.add(entry.key);
    for (const name of ['author', 'title', 'year', 'url']) assert.ok(fields[name], `${id}: missing ${name}`);
    assert.match(fields.year, /^\d{4}$/, `${id}: invalid year`);
    assert.equal(new URL(fields.url).protocol, 'https:');
    assert.ok(fields.author.split(' and ').every(name => /^[^,]+, .+/.test(name)), `${id}: use Family, Given author names`);
    assert.ok(!/[\t\u0080-\uFFFF]/.test(citation.bibtex), `${id}: use portable LaTeX accents and ASCII whitespace`);
    assert.doesNotMatch(citation.bibtex, /\b(?:ZZZ|TODO|TBD|undefined)\b/, `${id}: placeholder metadata`);
    if (fields.pages) assert.match(fields.pages, /^\d+(?:--\d+)?$/, `${id}: invalid page range`);
    if (fields.doi) assert.match(fields.doi, /^10\.\d{4,9}\/\S+$/, `${id}: invalid DOI`);
    if (entry.type === 'article') assert.ok(fields.journal && !fields.booktitle, `${id}: incorrect journal entry`);
    if (entry.type === 'inproceedings') assert.ok(fields.booktitle && !fields.journal, `${id}: incorrect conference entry`);
    if (entry.type === 'misc') {
        assert.ok(fields.eprint && ['arXiv', 'SSRN'].includes(fields.archiveprefix) && !fields.booktitle, `${id}: incomplete preprint entry`);
        assert.equal(citation.verification.version, fields.archiveprefix === 'arXiv' ? 'arxiv-preprint' : 'ssrn-preprint');
        if (fields.archiveprefix === 'arXiv') {
            assert.match(fields.version, /^[1-9]\d*$/, `${id}: missing verified arXiv version`);
            assert.equal(fields.url, `https://arxiv.org/abs/${fields.eprint}v${fields.version}`, `${id}: citation must identify the checked version`);
        }
    }
    assert.match(citation.verification.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(citation.metadataSources.includes(citation.verification.source), `${id}: missing verification source`);
    assert.ok(['version-of-record', 'accepted-conference-paper', 'conference-abstract', 'arxiv-preprint', 'ssrn-preprint'].includes(citation.verification.version));
    if (citation.verification.version === 'conference-abstract') {
        assert.equal(entry.type, 'inproceedings');
        assert.match(fields.note, /Conference abstract/);
        assert.ok(fields.eid, `${id}: missing abstract identifier`);
    }
    if (citation.verification.version === 'accepted-conference-paper') {
        assert.equal(entry.type, 'inproceedings');
        assert.match(fields.note, /Accepted conference paper/);
        assert.equal(fields.url, citation.verification.source, `${id}: cite the verified conference record`);
    }
    if (citation.verification.version === 'version-of-record') assert.notEqual(entry.type, 'misc', `${id}: published papers must use their journal or proceedings record`);
}

// Regression cases: braces and accented names must survive formatting; malformed input must fail.
const sample = '@article{test,\n  author = {Pauca, Victor Pa{\\\'u}l and\n            Cui, Kangning},\n  title = {A {UAV} Study},\n}\n';
assert.equal(formatBibtex(parseBibtex(sample)), sample);
assert.throws(() => parseBibtex('@article{test,\n  title = {Broken,\n}\n'));
assert.throws(() => parseBibtex('@article{test, title = {One}, title = {Two}, }'));
assert.throws(() => parseBibtex(sample + sample));
console.log(`Verified ${keys.size} citations: canonical formatting, required fields, names, page ranges, and source/version provenance.`);
