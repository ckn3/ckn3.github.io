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
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!modal || !modalImg || !modalTitle || !modalVenue || !modalAuthors || !modalAbstract || !modalLinks || !closeBtn) return;

    // The list and native details already work without JavaScript or a data fetch.
    document.querySelectorAll('.publication-entry, .conference-entry').forEach(function (entry) {
        var details = entry.querySelector('.publication-details');
        var summary = details && details.querySelector('summary');
        if (!summary) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'badge-chip publication-details-button';
        button.textContent = 'Details';
        button.setAttribute('aria-label', summary.getAttribute('aria-label'));
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', 'modal');
        button.addEventListener('click', function () { openDetailModal(entry, button); });
        details.before(button);
        details.hidden = true;
    });

    document.querySelectorAll('a[href^="#paper-"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            jumpToEntry(link.getAttribute('href'), true);
        });
    });

    function closeModal() {
        if (!modal.classList.contains('is-open')) return;
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

    function openDetailModal(entry, trigger) {
        if (modal.classList.contains('is-open')) return;
        var image = entry.querySelector('.publication-detail-image');
        lastFocusedElement = trigger;
        modalImg.src = image.src;
        modalImg.alt = image.alt;
        modalTitle.textContent = entry.querySelector('.paper-title').textContent.trim();
        modalVenue.textContent = entry.querySelector('.venue').textContent.trim();
        modalAuthors.replaceChildren(...Array.from(entry.querySelector('.authors').childNodes, function (node) { return node.cloneNode(true); }));
        modalAbstract.textContent = entry.querySelector('.publication-abstract').textContent.trim();
        modalLinks.replaceChildren();
        entry.querySelectorAll('.badges > a').forEach(function (link) { modalLinks.appendChild(link.cloneNode(true)); });
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
            if (modal.classList.contains('is-open')) closeBtn.focus();
        });
    }

    function flashTarget(target) {
        target.classList.remove('jump-highlight');
        void target.offsetWidth;
        target.classList.add('jump-highlight');
        window.setTimeout(function () { target.classList.remove('jump-highlight'); }, 1500);
    }

    function jumpToEntry(hash, pushHash) {
        if (!hash || hash.charAt(0) !== '#') return;
        var target = document.getElementById(hash.slice(1));
        if (!target) return;
        if (pushHash && window.location.hash !== hash) history.pushState(null, '', hash);
        target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        var detailsButton = target.querySelector('.publication-details-button');
        if (detailsButton) detailsButton.focus({ preventScroll: true });
        window.setTimeout(function () { flashTarget(target); }, reducedMotion.matches ? 0 : 240);
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('hashchange', function () {
        if (window.location.hash.indexOf('#paper-') === 0) jumpToEntry(window.location.hash, false);
    });
    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (!modal.classList.contains('is-open')) return;
        if (event.key === 'Escape') {
            closeModal();
        } else if (event.key === 'Tab') {
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
    if (window.location.hash.indexOf('#paper-') === 0) {
        document.fonts.ready.then(function () { jumpToEntry(window.location.hash, false); });
    }
});
