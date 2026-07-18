(function () {
    var siteRoot = 'https://ckn3.github.io/';
    var personId = siteRoot + '#person';
    var websiteId = siteRoot + '#website';

    function textFromSelector(selector) {
        var element = document.querySelector(selector);
        return element && element.content ? element.content : '';
    }

    function pageUrl() {
        var ogUrl = textFromSelector('meta[property="og:url"]');
        if (ogUrl) {
            return ogUrl;
        }
        var path = window.location.pathname.split('/').pop() || 'index.html';
        return path === 'index.html' ? siteRoot : siteRoot + path;
    }

    function absoluteUrl(value) {
        if (!value) {
            return '';
        }
        if (/^https?:\/\//i.test(value)) {
            return value;
        }
        return new URL(value, siteRoot).href;
    }

    function stripHtml(html) {
        var element = document.createElement('span');
        element.innerHTML = html || '';
        return element.textContent.replace(/[†*]/g, '').replace(/\s+/g, ' ').trim();
    }

    function appendJsonLd(graph, id) {
        if (!graph.length || document.getElementById(id)) {
            return;
        }
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': graph
        });
        document.head.appendChild(script);
    }

    function buildBaseGraph() {
        var title = textFromSelector('meta[property="og:title"]') || document.title;
        var description = textFromSelector('meta[name="description"]') || textFromSelector('meta[property="og:description"]');
        var url = pageUrl();

        return [
            {
                '@type': 'Person',
                '@id': personId,
                name: 'Kangning Cui',
                alternateName: 'Jason Cui',
                url: siteRoot,
                image: siteRoot + 'assets/og-card.png',
                email: 'mailto:kangning.cui@cityu-dg.edu.cn',
                jobTitle: 'Assistant Professor',
                affiliation: [
                    {
                        '@type': 'CollegeOrUniversity',
                        name: 'City University of Hong Kong (Dongguan)',
                        url: 'https://www.cityu-dg.edu.cn/'
                    },
                    {
                        '@type': 'CollegeOrUniversity',
                        name: 'Wake Forest University',
                        url: 'https://www.wfu.edu/'
                    }
                ],
                alumniOf: [
                    {
                        '@type': 'CollegeOrUniversity',
                        name: 'City University of Hong Kong',
                        url: 'https://www.cityu.edu.hk/'
                    },
                    {
                        '@type': 'CollegeOrUniversity',
                        name: 'University of Oxford',
                        url: 'https://www.ox.ac.uk/'
                    }
                ],
                sameAs: [
                    'https://scholar.google.com/citations?user=vzCZaIwAAAAJ&hl=en',
                    'https://orcid.org/0000-0002-1856-5064',
                    'https://www.scopus.com/authid/detail.uri?authorId=57226829865',
                    'https://github.com/ckn3/',
                    'https://www.linkedin.com/in/kangning-cui-57662b177/',
                    'https://faculty.cityu-dg.edu.cn/?lang=en&alphabet=C&title=&keyword=&page=2',
                    'https://cs.wfu.edu/faculty/jason-cui/'
                ]
            },
            {
                '@type': 'WebSite',
                '@id': websiteId,
                name: 'Kangning Cui',
                url: siteRoot,
                publisher: {
                    '@id': personId
                }
            },
            {
                '@type': 'WebPage',
                '@id': url + '#webpage',
                url: url,
                name: title.replace(' | Kangning Cui', ''),
                description: description,
                isPartOf: {
                    '@id': websiteId
                },
                about: {
                    '@id': personId
                }
            }
        ];
    }

    function yearFromVenue(venue) {
        var match = String(venue || '').match(/'(\d{2})/);
        return match ? '20' + match[1] : undefined;
    }

    function primaryLink(item) {
        var badges = item.badges || [];
        var preferred = badges.find(function (badge) {
            return badge.href && /^(Paper|Preprint|Project Page)$/.test(badge.label);
        });
        return preferred ? preferred.href : '';
    }

    function articleGraphFromData(data) {
        var selected = data.selected || {};
        var items = (selected.journals || []).concat(selected.conferences || []);

        return items.map(function (item) {
            var articleUrl = primaryLink(item) || pageUrl() + '#' + item.id;
            var links = (item.badges || []).map(function (badge) {
                return badge.href;
            }).filter(Boolean);
            var abstract = data.abstracts && data.abstracts[item.title]
                ? data.abstracts[item.title].slice(0, 320)
                : undefined;
            var article = {
                '@type': 'ScholarlyArticle',
                '@id': pageUrl() + '#' + item.id,
                name: item.title,
                headline: item.title,
                author: stripHtml(item.authorsHtml),
                url: absoluteUrl(articleUrl),
                image: item.image && item.image.src ? absoluteUrl(item.image.src) : undefined,
                datePublished: yearFromVenue(item.venue),
                isPartOf: {
                    '@type': item.kind === 'journal' ? 'Periodical' : 'PublicationIssue',
                    name: String(item.venue || '').replace(/[\[\]]/g, '')
                },
                sameAs: links.map(absoluteUrl)
            };

            if (abstract) {
                article.description = abstract;
            }

            Object.keys(article).forEach(function (key) {
                if (article[key] === undefined || article[key] === '') {
                    delete article[key];
                }
            });

            return article;
        });
    }

    function loadPublicationSchema() {
        if (!document.body.classList.contains('research-page')) {
            return;
        }

        fetch('data/publications.json').then(function (response) {
            if (!response.ok) {
                throw new Error('Unable to load publication schema data.');
            }
            return response.json();
        }).then(function (data) {
            appendJsonLd(articleGraphFromData(data), 'schema-publications');
        }).catch(function () {
            // Core site metadata remains available if publication data cannot be fetched locally.
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        appendJsonLd(buildBaseGraph(), 'schema-site');
        loadPublicationSchema();
    });
})();
