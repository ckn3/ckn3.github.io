document.addEventListener('DOMContentLoaded', function () {
    // Keep expandable, selectable citations when dialog support or JavaScript is absent.
    if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
    var citations = new Map();
    var dialog = document.createElement('dialog');
    dialog.id = 'citation-dialog';
    dialog.className = 'citation-dialog';
    dialog.setAttribute('aria-labelledby', 'citation-heading');
    dialog.innerHTML = '<div class="citation-header"><p class="citation-eyebrow">Cite this paper</p><button type="button" class="citation-close" aria-label="Close BibTeX dialog">Close <span aria-hidden="true">×</span></button></div>' +
        '<h2 id="citation-heading"></h2><p class="citation-note"></p>' +
        '<textarea class="citation-text" aria-label="BibTeX citation" readonly spellcheck="false" wrap="soft"></textarea>' +
        '<div class="citation-actions"><button type="button" class="citation-copy">Copy BibTeX</button><button type="button" class="citation-select">Select text</button><a class="citation-source" target="_blank" rel="noopener noreferrer"></a></div>' +
        '<p class="citation-status" role="status" aria-live="polite"></p>';
    document.body.appendChild(dialog);
    var text = dialog.querySelector('.citation-text');
    var copy = dialog.querySelector('.citation-copy');
    var status = dialog.querySelector('.citation-status');
    var trigger = null;
    var revision = 0;

    document.querySelectorAll('.citation-details').forEach(function (details) {
        var summary = details.querySelector('summary');
        var code = details.querySelector('code');
        if (!summary || !code) return;
        var id = details.dataset.citationId;
        citations.set(id, { title: details.dataset.title, bibtex: code.textContent.trim() + '\n', source: details.dataset.source, label: details.dataset.sourceLabel, note: details.dataset.note });
        var button = document.createElement('button');
        button.type = 'button';
        button.className = summary.className + ' citation-button';
        button.textContent = 'BibTeX';
        button.dataset.citationId = id;
        button.setAttribute('aria-label', summary.getAttribute('aria-label'));
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', dialog.id);
        details.before(button);
        details.hidden = true;
    });

    // Delegation also covers citation buttons cloned into the publication details dialog.
    document.addEventListener('click', function (event) {
        var button = event.target.closest('.citation-button');
        if (!button) return;
        var citation = citations.get(button.dataset.citationId);
        if (!citation || dialog.open) return;
        trigger = button;
        revision++;
        dialog.querySelector('#citation-heading').textContent = citation.title;
        var note = dialog.querySelector('.citation-note');
        note.textContent = citation.note;
        note.hidden = !citation.note;
        text.value = citation.bibtex;
        text.scrollTop = 0;
        var source = dialog.querySelector('.citation-source');
        source.href = citation.source;
        source.textContent = citation.label + ' record ↗';
        status.textContent = '';
        copy.disabled = false;
        // The underlying publication dialog may have made body siblings inert.
        dialog.inert = false;
        dialog.showModal();
        document.body.classList.add('citation-open');
        copy.focus({ preventScroll: true });
    });

    function selectText() {
        text.focus({ preventScroll: true });
        text.select();
        text.setSelectionRange(0, text.value.length);
    }
    dialog.querySelector('.citation-select').addEventListener('click', function () {
        selectText();
        status.textContent = 'Text selected. Copy with Ctrl+C or ⌘C.';
    });
    copy.addEventListener('click', async function () {
        var current = revision;
        var copied = false;
        copy.disabled = true;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text.value);
                copied = true;
            }
        } catch (_) { /* Offer selectable text when clipboard permission is unavailable. */ }
        if (!dialog.open || current !== revision) return;
        if (!copied) {
            selectText();
            try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
        }
        copy.disabled = false;
        status.textContent = copied ? 'BibTeX copied.' : 'Text selected. Copy with Ctrl+C or ⌘C.';
    });
    dialog.querySelector('.citation-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (event) {
        if (event.key !== 'Tab') return;
        var controls = dialog.querySelectorAll('button:not(:disabled), textarea, a[href]');
        var first = controls[0];
        var last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
    var backdropPress = false;
    function outside(event) {
        var rect = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
    }
    dialog.addEventListener('pointerdown', function (event) { backdropPress = outside(event); });
    dialog.addEventListener('click', function (event) {
        if (backdropPress && outside(event)) dialog.close();
        backdropPress = false;
    });
    dialog.addEventListener('close', function () {
        revision++;
        document.body.classList.remove('citation-open');
        if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
        trigger = null;
    });
});
