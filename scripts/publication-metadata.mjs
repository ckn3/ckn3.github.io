import { parseBibtex } from './bibtex.mjs';

// The citation registry is the single source for displayed authors and indexing.
export function plainBibtex(value = '') {
    const accents = { "'": '\u0301', '`': '\u0300', '"': '\u0308', '~': '\u0303', '^': '\u0302', '=': '\u0304' };
    return value.replace(/\\(['`"~^=])\{?([A-Za-z])\}?/g, (_, mark, letter) => (letter + accents[mark]).normalize('NFC'))
        .replace(/\\([&_%#$])/g, '$1').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

export function citationMetadata(citation) {
    const { fields } = parseBibtex(citation.bibtex);
    const authors = fields.author.split(' and ').map(author => {
        const [family, given] = plainBibtex(author).split(',').map(part => part.trim());
        return given ? `${given} ${family}` : family;
    });
    return { fields, authors, year: Number(fields.year) };
}

export function publicationSchema(citations) {
    return {
        '@context': 'https://schema.org',
        '@graph': Object.entries(citations).map(([id, citation]) => {
            const { fields, authors, year } = citationMetadata(citation);
            const venue = fields.journal || fields.booktitle;
            return {
                '@type': 'ScholarlyArticle',
                '@id': `https://ckn3.github.io/publications.html#${id}`,
                name: citation.title,
                url: fields.url,
                author: authors.map(name => ({ '@type': 'Person', name })),
                datePublished: String(year),
                ...(venue ? { isPartOf: { '@type': fields.journal ? 'Periodical' : 'CreativeWork', name: plainBibtex(venue) } } : {}),
                creativeWorkStatus: citation.listing.kind === 'preprint' ? 'Preprint' : citation.verification?.version === 'accepted-conference-paper' ? 'Accepted' : 'Published',
                ...(fields.doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: fields.doi } } : {})
            };
        })
    };
}
