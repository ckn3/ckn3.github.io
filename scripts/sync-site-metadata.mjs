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
const footerLinks = [
    ['Email', 'mailto:kangning.cui@cityu-dg.edu.cn'],
    ['Google Scholar', 'https://scholar.google.com/citations?user=vzCZaIwAAAAJ&hl=en'],
    ['GitHub', 'https://github.com/ckn3/'],
    ['LinkedIn', 'https://www.linkedin.com/in/kangning-cui-57662b177/'],
    ['ORCID', 'https://orcid.org/0000-0002-1856-5064'],
    ['Scopus', 'https://www.scopus.com/authid/detail.uri?authorId=57226829865'],
];
function renderFooter(label) {
    return `<footer class="site-footer">
        <div class="site-footer-inner">
            <div class="site-footer-copy">Kangning Cui</div>
            <div class="site-footer-links">
${footerLinks.map(([name, href]) => `                <a href="${href.replaceAll('&', '&amp;')}"${href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${name}</a>`).join('\n')}
            </div>
            <div class="site-footer-meta">Last updated: ${label}</div>
        </div>
    </footer>`;
}
for (const file of sitePages) {
    const changed = git('status', '--porcelain', '--', file);
    const committed = git('log', '-1', '--format=%cs', '--', file);
    let date = changed || !committed ? today : committed;
    const label = value => new Intl.DateTimeFormat('en', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(value + 'T12:00:00Z'));
    const url = new URL(file, root);
    const original = await readFile(url, 'utf8');
    const footer = /<footer class="site-footer">[\s\S]*?<\/footer>/g;
    assert.equal([...original.matchAll(footer)].length, 1, `${file}: expected one site footer.`);
    let generated = original.replace(footer, () => renderFooter(label(date)));
    // A shared footer change also updates the page, even when its body is unchanged.
    if (generated !== original) {
        date = today;
        generated = original.replace(footer, () => renderFooter(label(date)));
    }
    if (check) assert.equal(generated, original, `${file}: stale footer. Run npm run sync:metadata.`);
    else if (generated !== original) await writeFile(url, generated);
    if (file !== '404.html') urls.push(`  <url>\n    <loc>https://ckn3.github.io/${file === 'index.html' ? '' : file}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
const target = new URL('sitemap.xml', root);
if (check) assert.equal(await readFile(target, 'utf8'), sitemap, 'Stale sitemap. Run npm run sync:metadata.');
else await writeFile(target, sitemap);
console.log(check ? 'Shared footers and sitemap are up to date.' : 'Updated shared footers and sitemap from page history.');
