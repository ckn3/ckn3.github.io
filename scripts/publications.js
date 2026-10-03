var publicationsScript = document.currentScript;
var publicationsDataUrl = publicationsScript && publicationsScript.dataset.publicationsData
    ? publicationsScript.dataset.publicationsData
    : 'data/publications.json';
var publicationsFallbackUrl = publicationsScript && publicationsScript.dataset.publicationsFallback
    ? publicationsScript.dataset.publicationsFallback
    : 'data/publications-fallback.js';

document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('modal');
    var modalImg = document.getElementById('modal-img');
    var modalTitle = document.getElementById('modal-title');
    var modalVenue = document.getElementById('modal-venue');
    var modalAuthors = document.getElementById('modal-authors');
    var modalAbstract = document.getElementById('modal-abstract');
    var modalLinks = document.getElementById('modal-links');
    var closeBtn = modal && modal.querySelector('.close');
    var lastFocusedElement = null;
    var backgroundState = [];
    var bodyWasLocked = false;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!modal || !modalImg || !modalTitle || !modalVenue || !modalAuthors || !modalAbstract || !modalLinks || !closeBtn) {
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
        if (window.location.protocol === 'file:') {
            return loadPublicationFallback();
        }

        if (!window.fetch) {
            return loadPublicationFallback();
        }

        return fetch(publicationsDataUrl).then(function (response) {
            if (!response.ok) {
                throw new Error('Unable to load publication data.');
            }
            return response.json();
        }).catch(function () {
            return loadPublicationFallback();
        });
    }

    function loadPublicationFallback() {
        if (window.publicationsData) {
            return Promise.resolve(window.publicationsData);
        }

        return new Promise(function (resolve, reject) {
            var fallbackScript = document.createElement('script');
            fallbackScript.src = publicationsFallbackUrl;

            fallbackScript.addEventListener('load', function () {
                if (window.publicationsData) {
                    resolve(window.publicationsData);
                    return;
                }
                reject(new Error('Publication fallback data is not available.'));
            });

            fallbackScript.addEventListener('error', function () {
                reject(new Error('Unable to load publication fallback data.'));
            });

            document.head.appendChild(fallbackScript);
        });
    }

    function renderPublicationLoadError(error) {
        ['journal-publications-list', 'conference-publications-list'].forEach(function (containerId) {
            var container = document.getElementById(containerId);
            if (!container) {
                return;
            }

            container.innerHTML = '<p class="publication-data-error">Publications are temporarily unavailable. You can still browse the <a href="https://scholar.google.com/citations?user=vzCZaIwAAAAJ&amp;hl=en" target="_blank" rel="noopener noreferrer">full list on Google Scholar</a>.</p>';
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
        wrapper.appendChild(renderBadges(item.badges || [], item.title));

        return wrapper;
    }

    function renderBadges(badges, title) {
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

        var detailsButton = document.createElement('button');
        detailsButton.type = 'button';
        detailsButton.className = 'badge-chip publication-details-button';
        detailsButton.textContent = 'Details';
        detailsButton.setAttribute('aria-haspopup', 'dialog');
        detailsButton.setAttribute('aria-controls', 'modal');
        detailsButton.setAttribute('aria-label', 'View publication details: ' + title);
        badgeList.appendChild(detailsButton);

        return badgeList;
    }

    function initializePublicationInteractions(abstracts) {
        document.querySelectorAll('a[href^="#paper-"]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                jumpToEntry(link.getAttribute('href'), true);
            });
        });

        document.querySelectorAll('.publication-entry, .conference-entry').forEach(function (entry) {
            var detailsButton = entry.querySelector('.publication-details-button');

            if (detailsButton) {
                detailsButton.addEventListener('click', function () {
                    openDetailModal(entry, abstracts, detailsButton);
                });
            }

            entry.addEventListener('click', function (event) {
                if (event.target.closest('a, button')) {
                    return;
                }
                openDetailModal(entry, abstracts, detailsButton);
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
        if (!modal.classList.contains('is-open')) {
            return;
        }

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!bodyWasLocked) document.body.classList.remove('modal-open');
        backgroundState.forEach(function (state) { state[0].inert = state[1]; });
        backgroundState = [];

        if (lastFocusedElement) {
            lastFocusedElement.focus({ preventScroll: true });
            lastFocusedElement = null;
        }
    }

    function openDetailModal(entry, abstracts, trigger) {
        if (modal.classList.contains('is-open')) return;
        var image = entry.querySelector('.publication-figure img');
        var title = normalizeTitle(entry.querySelector('.paper-title').textContent);
        var venue = entry.querySelector('.venue').textContent.trim();
        var authorsHtml = entry.querySelector('.authors').innerHTML.trim();

        lastFocusedElement = trigger;
        modalImg.src = image.src;
        modalImg.alt = title;
        modalTitle.textContent = title;
        modalVenue.textContent = venue;
        modalAuthors.innerHTML = authorsHtml;
        modalAbstract.textContent = abstracts[title] || 'Abstract will be added soon.';
        modalLinks.textContent = '';
        entry.querySelectorAll('.badges a').forEach(function (link) {
            modalLinks.appendChild(link.cloneNode(true));
        });
        modalLinks.hidden = !modalLinks.childElementCount;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        modal.querySelector('.modal-panel').scrollTop = 0;
        bodyWasLocked = document.body.classList.contains('modal-open');
        document.body.classList.add('modal-open');
        // Keep the dialog's ancestor path active while excluding background content.
        backgroundState = [];
        for (var node = modal; node.parentElement; node = node.parentElement) {
            Array.from(node.parentElement.children).forEach(function (sibling) {
                if (sibling === node || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) return;
                backgroundState.push([sibling, sibling.inert]);
                sibling.inert = true;
            });
        }
        window.requestAnimationFrame(function () {
            if (modal.classList.contains('is-open')) {
                closeBtn.focus();
            }
        });
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

        var target = document.getElementById(hash.slice(1));
        if (!target) {
            return;
        }

        if (pushHash) {
            history.pushState(null, '', hash);
        }

        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        var detailsButton = target.querySelector('.publication-details-button');
        if (detailsButton) detailsButton.focus({ preventScroll: true });
        window.setTimeout(function () {
            flashTarget(target);
        }, reducedMotion ? 0 : 240);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('hashchange', function () {
        if (window.location.hash.indexOf('#paper-') === 0) jumpToEntry(window.location.hash, false);
    });

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        } else if (event.key === 'Tab' && modal.classList.contains('is-open')) {
            var focusable = modal.querySelectorAll('button, a[href]');
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            var active = document.activeElement;

            if (!modal.contains(active) || (event.shiftKey && active === first)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

});
