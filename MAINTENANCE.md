# Website updates

Edit publication metadata in `data/publications.json`. BibTeX is the source for author names, publication years, and scholarly structured data. Use official published records where available, and label accepted papers and preprints explicitly. Every paper belongs to one primary research theme.

After editing content, run:

```sh
npm run sync
npm run check
```

The sync command updates the static publication library, homepage highlights, citations on both topic pages, publication structured data, sitemap, and existing footer dates. Sitemap dates come from each page's latest Git commit, or today's date for a modified or new page. Run sync on the day of publishing, and commit its output with the content changes. Add new pages to `scripts/site-pages.mjs`.

When adding gallery photos, also run `npm run sync:gallery`. Preview changed pages on desktop and mobile. Check filters, paper and album links, BibTeX copy dialogs, and image lightboxes when their content changes.

Stage only the intended website files. Local grant proposals and other private files do not belong in this repository's published content.
