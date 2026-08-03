import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../data/publications.json', import.meta.url);
const fallbackUrl = new URL('../data/publications-fallback.js', import.meta.url);
const checkOnly = process.argv.includes('--check');

const source = await readFile(sourceUrl, 'utf8');

try {
    JSON.parse(source);
} catch (error) {
    console.error(`Invalid publication JSON: ${error.message}`);
    process.exit(1);
}

const generated = [
    '// Generated from data/publications.json for direct file:// previews.',
    '// Run npm run sync:publications whenever the publication data changes.',
    `window.publicationsData = ${source.trimEnd()};`,
    ''
].join('\n');

if (checkOnly) {
    let existing = '';

    try {
        existing = await readFile(fallbackUrl, 'utf8');
    } catch {
        console.error('Publication fallback is missing. Run npm run sync:publications.');
        process.exit(1);
    }

    if (existing !== generated) {
        console.error('Publication fallback is out of date. Run npm run sync:publications.');
        process.exit(1);
    }

    console.log('Publication data and fallback are synchronized.');
} else {
    await writeFile(fallbackUrl, generated, 'utf8');
    console.log('Updated data/publications-fallback.js.');
}
