import assert from 'node:assert/strict';

// Canonical site citations use braced values; publisher imports are normalized first.
export const fieldOrder = ['author', 'title', 'booktitle', 'journal', 'editor', 'year', 'volume', 'number', 'pages', 'eid', 'series', 'publisher', 'address', 'month', 'isbn', 'doi', 'url', 'eprint', 'archiveprefix', 'primaryclass', 'version', 'note'];

export function parseBibtex(source) {
    const header = source.match(/^@(article|inproceedings|misc)\{([^\s,{}]+),\s*/);
    assert.ok(header, 'Expected a single canonical BibTeX entry');
    const entry = { type: header[1], key: header[2], fields: {} };
    let cursor = header[0].length;
    while (source[cursor] !== '}') {
        const field = source.slice(cursor).match(/^([a-z]+)\s*=\s*\{/);
        assert.ok(field, `Expected a braced field at offset ${cursor}`);
        const name = field[1];
        assert.ok(fieldOrder.includes(name) && !(name in entry.fields), `Unknown or duplicate field: ${name}`);
        cursor += field[0].length;
        const start = cursor;
        let depth = 1;
        while (cursor < source.length && depth) {
            if (source[cursor] === '\\') { cursor += 2; continue; }
            if (source[cursor] === '{') depth++;
            if (source[cursor] === '}') depth--;
            cursor++;
        }
        assert.equal(depth, 0, `Unbalanced braces in ${name}`);
        entry.fields[name] = source.slice(start, cursor - 1).replace(/\s+/g, ' ').trim();
        assert.ok(entry.fields[name], `Empty field: ${name}`);
        assert.equal(source[cursor++], ',', `Missing comma after ${name}`);
        while (/\s/.test(source[cursor] || '') && cursor < source.length) cursor++;
    }
    assert.equal(source.slice(cursor).trim(), '}', 'Unexpected text after the entry');
    return entry;
}

export function formatBibtex({ type, key, fields }) {
    const lines = fieldOrder.filter(name => fields[name] !== undefined).map(name => {
        const prefix = `  ${name} = {`;
        let value = fields[name].replace(/\s+/g, ' ').trim();
        if (name === 'author' || name === 'editor') value = value.split(' and ').join(` and\n${' '.repeat(prefix.length)}`);
        return `${prefix}${value}},`;
    });
    return `@${type}{${key},\n${lines.join('\n')}\n}\n`;
}
