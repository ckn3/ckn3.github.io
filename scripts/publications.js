document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('modal');
    var modalImg = document.getElementById('modal-img');
    var modalTitle = document.getElementById('modal-title');
    var modalVenue = document.getElementById('modal-venue');
    var modalAuthors = document.getElementById('modal-authors');
    var modalHistoryBlock = document.getElementById('modal-history-block');
    var modalHistory = document.getElementById('modal-history');
    var modalAbstract = document.getElementById('modal-abstract');
    var closeBtn = document.getElementsByClassName('close')[0];
    var abstractsNode = document.getElementById('publication-abstracts');
    var historyNode = document.getElementById('publication-history');

    if (!modal || !modalImg || !modalTitle || !modalVenue || !modalAuthors || !modalAbstract || !abstractsNode || !historyNode) {
        return;
    }

    var abstracts = JSON.parse(abstractsNode.textContent);
    var publicationHistory = JSON.parse(historyNode.textContent);

    function normalizeTitle(text) {
        return text.replace(/^["“”]+|["“”]+$/g, '').trim();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
    }

    function renderHistory(title) {
        var historyItems = publicationHistory[title] || [];
        modalHistory.textContent = '';

        if (!historyItems.length) {
            modalHistoryBlock.hidden = true;
            return;
        }

        historyItems.forEach(function (item) {
            var chip = document.createElement('div');
            chip.className = 'modal-history-chip';

            if (item.tone) {
                chip.classList.add('is-' + item.tone);
            }

            var venue = document.createElement('span');
            venue.className = 'modal-history-venue';
            venue.textContent = item.venue;
            chip.appendChild(venue);

            var status = document.createElement('span');
            status.className = 'modal-history-status';
            status.textContent = item.status;
            chip.appendChild(status);

            if (item.note) {
                var note = document.createElement('span');
                note.className = 'modal-history-note';
                note.textContent = item.note;
                chip.appendChild(note);
            }

            modalHistory.appendChild(chip);
        });

        modalHistoryBlock.hidden = false;
    }

    function openDetailModal(entry) {
        var image = entry.querySelector('.publication-figure img');
        var title = normalizeTitle(entry.querySelector('.paper-title').textContent);
        var venue = entry.querySelector('.venue').textContent.trim();
        var authorsHtml = entry.querySelector('.authors').innerHTML.trim();

        modalImg.src = image.src;
        modalImg.alt = title;
        modalTitle.textContent = title;
        modalVenue.textContent = venue;
        modalAuthors.innerHTML = authorsHtml;
        renderHistory(title);
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
            openDetailModal(entry);
        });

        entry.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openDetailModal(entry);
            }
        });
    });

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

    if (window.location.hash && window.location.hash.indexOf('#paper-') === 0) {
        window.setTimeout(function () {
            jumpToEntry(window.location.hash, false);
        }, 120);
    }
});
