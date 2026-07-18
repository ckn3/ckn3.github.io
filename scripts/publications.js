var publicationsScript = document.currentScript;
var publicationsDataUrl = publicationsScript && publicationsScript.dataset.publicationsData
    ? publicationsScript.dataset.publicationsData
    : 'data/publications.json';

document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('modal');
    var modalImg = document.getElementById('modal-img');
    var modalTitle = document.getElementById('modal-title');
    var modalVenue = document.getElementById('modal-venue');
    var modalAuthors = document.getElementById('modal-authors');
    var modalAbstract = document.getElementById('modal-abstract');
    var closeBtn = document.getElementsByClassName('close')[0];

    if (!modal || !modalImg || !modalTitle || !modalVenue || !modalAuthors || !modalAbstract) {
        return;
    }

    loadPublicationData().then(function (publicationData) {
        renderSelectedPublications(publicationData.selected || {});
        initializePublicationInteractions(publicationData.abstracts || {});
    }).catch(function (error) {
        renderPublicationLoadError(error);
        initializePublicationInteractions({}, {});
    });

    function loadPublicationData() {
        if (!window.fetch) {
            return Promise.reject(new Error('Publication data is not available.'));
        }

        return fetch(publicationsDataUrl).then(function (response) {
            if (!response.ok) {
                throw new Error('Unable to load publication data.');
            }
            return response.json();
        });
    }

    function renderPublicationLoadError(error) {
        ['journal-publications-list', 'conference-publications-list'].forEach(function (containerId) {
            var container = document.getElementById(containerId);
            if (!container) {
                return;
            }

            container.innerHTML = '<div class="publication-data-error">Selected publications could not be loaded. Please serve the site locally or check <code>data/publications.json</code>.</div>';
        });

        if (window.console && error) {
            console.warn(error.message || error);
        }
    }

    function renderSelectedPublications(selectedPublications) {
        renderPublicationSection('journal-publications-list', selectedPublications.journals || [], 'publication-entry', 'publication-text');
        renderPublicationSection('conference-publications-list', selectedPublications.conferences || [], 'conference-entry', 'conference-text');
    }

    function renderPublicationSection(containerId, entries, baseClass, textClass) {
        var container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        container.textContent = '';

        entries.forEach(function (item) {
            var entry = document.createElement('div');
            entry.className = baseClass;
            entry.id = item.id;

            if (item.highlight === 'primary') {
                entry.classList.add('highlight-entry');
            } else if (item.highlight === 'collaborative') {
                entry.classList.add('collaborative-highlight');
            }

            entry.appendChild(renderPublicationFigure(item.image));
            entry.appendChild(renderPublicationText(item, textClass));
            container.appendChild(entry);
        });
    }

    function renderPublicationFigure(image) {
        var figure = document.createElement('div');
        figure.className = 'publication-figure';

        var img = document.createElement('img');
        img.src = image.src;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = image.width;
        img.height = image.height;
        img.alt = image.alt;
        img.title = 'Click to enlarge';

        figure.appendChild(img);
        return figure;
    }

    function renderPublicationText(item, textClass) {
        var wrapper = document.createElement('div');
        wrapper.className = textClass;

        var titleLine = document.createElement('p');
        titleLine.className = 'title';

        var paperTitle = document.createElement('span');
        paperTitle.className = 'paper-title';
        var strong = document.createElement('strong');
        strong.textContent = '"' + item.title + '"';
        paperTitle.appendChild(strong);

        var venue = document.createElement('span');
        venue.className = 'venue';
        venue.textContent = item.venue;

        titleLine.appendChild(paperTitle);
        titleLine.appendChild(venue);

        var authors = document.createElement('p');
        authors.className = 'authors';
        authors.innerHTML = item.authorsHtml;

        wrapper.appendChild(titleLine);
        wrapper.appendChild(authors);
        wrapper.appendChild(renderBadges(item.badges || []));

        return wrapper;
    }

    function renderBadges(badges) {
        var badgeList = document.createElement('div');
        badgeList.className = 'badges';

        badges.forEach(function (badge) {
            var badgeElement = badge.href ? document.createElement('a') : document.createElement('span');
            badgeElement.className = 'badge-chip';
            badgeElement.textContent = badge.label;

            if (badge.href) {
                badgeElement.href = badge.href;

                if (/^https?:\/\//.test(badge.href)) {
                    badgeElement.target = '_blank';
                    badgeElement.rel = 'noopener noreferrer';
                }
            }

            badgeList.appendChild(badgeElement);
        });

        return badgeList;
    }

    function initializePublicationInteractions(abstracts) {
        document.querySelectorAll('a[href^="#paper-"]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                jumpToEntry(link.getAttribute('href'), true);
            });
        });

        document.querySelectorAll('.publication-entry, .conference-entry').forEach(function (entry) {
            entry.setAttribute('tabindex', '0');

            entry.addEventListener('click', function (event) {
                if (event.target.closest('a')) {
                    return;
                }
                openDetailModal(entry, abstracts);
            });

            entry.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDetailModal(entry, abstracts);
                }
            });
        });

        if (window.location.hash && window.location.hash.indexOf('#paper-') === 0) {
            window.setTimeout(function () {
                jumpToEntry(window.location.hash, false);
            }, 120);
        }
    }

    function normalizeTitle(text) {
        return text.replace(/^["“”]+|["“”]+$/g, '').trim();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
    }

    function openDetailModal(entry, abstracts) {
        var image = entry.querySelector('.publication-figure img');
        var title = normalizeTitle(entry.querySelector('.paper-title').textContent);
        var venue = entry.querySelector('.venue').textContent.trim();
        var authorsHtml = entry.querySelector('.authors').innerHTML.trim();

        modalImg.src = image.src;
        modalImg.alt = title;
        modalTitle.textContent = title;
        modalVenue.textContent = venue;
        modalAuthors.innerHTML = authorsHtml;
        modalAbstract.textContent = abstracts[title] || 'Abstract will be added soon.';
        modal.classList.add('is-open');
        document.body.classList.add('modal-open');
    }

    function flashTarget(target) {
        target.classList.remove('jump-highlight');
        void target.offsetWidth;
        target.classList.add('jump-highlight');
        window.setTimeout(function () {
            target.classList.remove('jump-highlight');
        }, 1500);
    }

    function jumpToEntry(hash, pushHash) {
        if (!hash || hash.charAt(0) !== '#') {
            return;
        }

        var target = document.querySelector(hash);
        if (!target) {
            return;
        }

        if (pushHash) {
            history.pushState(null, '', hash);
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(function () {
            flashTarget(target);
        }, 240);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

});
