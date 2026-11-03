import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sitePages } from './site-pages.mjs';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const git = (...args) => execFileSync('git', args, { cwd: fileURLToPath(root), encoding: 'utf8' }).trim();
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const urls = [];
for (const file of sitePages.filter(file => file !== '404.html')) {
    const changed = git('status', '--porcelain', '--', file);
    const committed = git('log', '-1', '--format=%cs', '--', file);
    const date = changed || !committed ? today : committed;
    const label = new Intl.DateTimeFormat('en', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00Z'));
    const url = new URL(file, root);
    const original = await readFile(url, 'utf8');
    const generated = original.replace(/Last updated: [A-Za-z]+ \d{4}/g, `Last updated: ${label}`);
    if (check) assert.equal(generated, original, `${file}: stale footer date. Run npm run sync:metadata.`);
    else if (generated !== original) await writeFile(url, generated);
    urls.push(`  <url>\n    <loc>https://ckn3.github.io/${file === 'index.html' ? '' : file}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
const target = new URL('sitemap.xml', root);
if (check) assert.equal(await readFile(target, 'utf8'), sitemap, 'Stale sitemap. Run npm run sync:metadata.');
else await writeFile(target, sitemap);
console.log(check ? 'Sitemap and footer dates match page history.' : 'Updated sitemap and footer dates from page history.');
