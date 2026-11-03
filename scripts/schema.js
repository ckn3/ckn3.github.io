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
                jobTitle: 'Assistant Professor of Data Science',
                affiliation: [
                    {
                        '@type': 'CollegeOrUniversity',
                        name: 'City University of Hong Kong (Dongguan)',
                        url: 'https://www.cityu-dg.edu.cn/'
                    }
                ],
                memberOf: {
                    '@type': 'Organization',
                    name: 'Andrew Sabin Family Center for Environment and Sustainability',
                    url: 'https://sabincenter.wfu.edu/'
                },
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
                    'https://rims.cityu-dg.edu.cn/en/persons/kangning-cui/publications/',
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

    document.addEventListener('DOMContentLoaded', function () {
        appendJsonLd(buildBaseGraph(), 'schema-site');
    });
})();
