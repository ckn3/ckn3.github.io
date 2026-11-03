document.addEventListener('DOMContentLoaded', function () {
    var links = Array.from(document.querySelectorAll('.project-figure > a'));
    if (!links.length || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
    var dialog = document.createElement('dialog');
    dialog.className = 'figure-viewer';
    dialog.setAttribute('aria-labelledby', 'figure-viewer-title');
    dialog.innerHTML = '<div class="figure-viewer-header"><h2 id="figure-viewer-title">Research figure</h2><button type="button" class="figure-viewer-close">Close ×</button></div><div class="figure-viewer-stage" tabindex="0" aria-label="Figure; scroll to inspect when enlarged"><img alt=""></div><div class="figure-viewer-actions"><button type="button" class="figure-viewer-zoom" aria-pressed="false">Zoom in</button><a class="figure-viewer-original" target="_blank" rel="noopener noreferrer">Open original ↗</a></div>';
    document.body.appendChild(dialog);
    var title = dialog.querySelector('h2');
    var stage = dialog.querySelector('.figure-viewer-stage');
    var image = dialog.querySelector('img');
    var zoom = dialog.querySelector('.figure-viewer-zoom');
    var close = dialog.querySelector('.figure-viewer-close');
    var trigger;
    function fit() {
        stage.classList.remove('is-zoomed');
        image.style.width = '';
        zoom.textContent = 'Zoom in';
        zoom.setAttribute('aria-pressed', 'false');
        stage.scrollTo(0, 0);
    }
    links.forEach(function (link) {
        link.setAttribute('aria-haspopup', 'dialog');
        link.addEventListener('click', function (event) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            trigger = link;
            var preview = link.querySelector('img');
            title.textContent = link.dataset.figureTitle || link.closest('figure').querySelector('figcaption').textContent;
            image.src = link.href;
            image.alt = preview.alt;
            dialog.querySelector('.figure-viewer-original').href = link.href;
            fit();
            dialog.showModal();
            document.body.classList.add('figure-viewer-open');
            close.focus();
        });
    });
    zoom.addEventListener('click', function () {
        if (stage.classList.contains('is-zoomed')) return fit();
        stage.classList.add('is-zoomed');
        image.style.width = Math.max(image.naturalWidth, stage.clientWidth * 1.5) + 'px';
        zoom.textContent = 'Fit to window';
        zoom.setAttribute('aria-pressed', 'true');
    });
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () {
        document.body.classList.remove('figure-viewer-open');
        if (trigger) trigger.focus({ preventScroll: true });
    });
    var pressedOutside = false;
    function outside(event) {
        var box = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
    }
    dialog.addEventListener('pointerdown', function (event) { pressedOutside = outside(event); });
    dialog.addEventListener('click', function (event) {
        if (pressedOutside && outside(event)) dialog.close();
        pressedOutside = false;
    });
});
