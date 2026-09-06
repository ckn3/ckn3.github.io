document.addEventListener('DOMContentLoaded', function () {
    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImage = document.getElementById('gallery-modal-image');
    const galleryModalClose = document.getElementById('gallery-modal-close');
    const galleryTriggers = Array.from(document.querySelectorAll('.gallery-trigger'));
    const previousButton = document.getElementById('gallery-modal-prev');
    const nextButton = document.getElementById('gallery-modal-next');
    const caption = document.getElementById('gallery-modal-caption');
    const counter = document.getElementById('gallery-modal-counter');
    const status = document.getElementById('gallery-modal-status');
    const stage = document.getElementById('gallery-modal-stage');
    const dialog = galleryModal && galleryModal.querySelector('[role="dialog"]');
    let lastFocusedTrigger = null;
    let albumImages = [];
    let activeIndex = 0;
    let loadSequence = 0;
    let clearTimer;
    let touchStart = null;
    let backgroundState = [];
    let bodyWasLocked = false;

    if (!galleryModal || !galleryModalImage || !galleryModalClose || !galleryTriggers.length) {
        return;
    }

    function triggerFor(image) {
        return image.closest('[data-gallery-open]') || image;
    }

    function setStatus(message) {
        if (!status) return;
        status.textContent = message;
        status.hidden = !message;
    }

    function showPhoto(index) {
        activeIndex = (index + albumImages.length) % albumImages.length;
        const image = albumImages[activeIndex];
        const sequence = ++loadSequence;
        const source = image.dataset.fullSrc || image.closest('[data-gallery-open]')?.href || image.currentSrc || image.src;
        const album = image.closest('[data-gallery-album]');
        const photoCaption = image.closest('figure')?.querySelector('figcaption');
        if (counter) counter.textContent = (album?.dataset.galleryAlbum || 'Photographs') +
            ' / ' + String(activeIndex + 1).padStart(2, '0') + ' of ' + String(albumImages.length).padStart(2, '0');
        if (caption) {
            caption.replaceChildren(...(photoCaption ? Array.from(photoCaption.childNodes).map(function (node) {
                return node.cloneNode(true);
            }) : [document.createTextNode(image.alt || '')]));
        }
        if (previousButton) previousButton.disabled = albumImages.length < 2;
        if (nextButton) nextButton.disabled = albumImages.length < 2;
        galleryModalImage.hidden = true;
        galleryModalImage.classList.remove('is-entering');
        setStatus('Loading photograph…');
        if (stage) stage.setAttribute('aria-busy', 'true');

        // Ignore completed loads from an earlier image if the reader has already moved on.
        const preview = new Image();
        preview.onload = function () {
            if (sequence !== loadSequence) return;
            galleryModalImage.src = source;
            galleryModalImage.alt = image.alt || '';
            galleryModalImage.hidden = false;
            galleryModalImage.classList.add('is-entering');
            setStatus('');
            if (stage) stage.setAttribute('aria-busy', 'false');
        };
        preview.onerror = function () {
            if (sequence !== loadSequence) return;
            setStatus('This photograph could not be loaded. Please try another photograph.');
            if (stage) stage.setAttribute('aria-busy', 'false');
        };
        preview.src = source;
    }

    function openGalleryModal(image) {
        if (!image.src || galleryModal.classList.contains('active')) return;
        clearTimeout(clearTimer);
        lastFocusedTrigger = triggerFor(image);
        const album = image.closest('[data-gallery-album]');
        albumImages = (album ? Array.from(album.querySelectorAll('.gallery-trigger')) : galleryTriggers)
            .filter(function (item) { return !item.closest('[hidden]'); });
        galleryModal.classList.add('active');
        galleryModal.setAttribute('aria-hidden', 'false');
        bodyWasLocked = document.body.classList.contains('modal-open');
        document.body.classList.add('modal-open');
        // The shared viewer can sit inside main; keep its ancestor path interactive.
        backgroundState = [];
        for (let node = galleryModal; node.parentElement; node = node.parentElement) {
            Array.from(node.parentElement.children).forEach(function (sibling) {
                if (sibling === node || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) return;
                backgroundState.push([sibling, sibling.inert]);
                sibling.inert = true;
            });
        }
        showPhoto(albumImages.indexOf(image));
        galleryModalClose.focus({ preventScroll: true });
    }

    function closeGalleryModal() {
        if (!galleryModal.classList.contains('active')) return;
        ++loadSequence;
        galleryModal.classList.remove('active');
        galleryModal.setAttribute('aria-hidden', 'true');
        if (!bodyWasLocked) document.body.classList.remove('modal-open');
        backgroundState.forEach(function ([element, wasInert]) { element.inert = wasInert; });
        backgroundState = [];
        const returnTarget = lastFocusedTrigger && !lastFocusedTrigger.closest('[hidden]') ? lastFocusedTrigger :
            galleryTriggers.filter(function (image) { return !image.closest('[hidden]'); }).map(triggerFor)[0];
        if (returnTarget) returnTarget.focus({ preventScroll: true });
        lastFocusedTrigger = null;
        touchStart = null;
        clearTimer = setTimeout(function () {
            galleryModalImage.removeAttribute('src');
            galleryModalImage.alt = '';
            setStatus('');
        }, 250);
    }

    galleryTriggers.forEach(function (image) {
        const trigger = triggerFor(image);
        if (trigger === image) {
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('aria-label', 'Open larger image: ' + (image.alt || 'gallery image'));
        }
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'gallery-modal');
        trigger.addEventListener('click', function (event) {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            openGalleryModal(image);
        });

        trigger.addEventListener('keydown', function (event) {
            if (event.key === ' ' || (trigger === image && event.key === 'Enter')) {
                event.preventDefault();
                openGalleryModal(image);
            }
        });
    });

    galleryModalClose.addEventListener('click', closeGalleryModal);
    if (previousButton) previousButton.addEventListener('click', function () { showPhoto(activeIndex - 1); });
    if (nextButton) nextButton.addEventListener('click', function () { showPhoto(activeIndex + 1); });

    if (stage) {
        stage.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'touch' && event.isPrimary) {
                touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
            }
        });
        stage.addEventListener('pointerup', function (event) {
            if (!touchStart || event.pointerId !== touchStart.id) return;
            const dx = event.clientX - touchStart.x;
            const dy = event.clientY - touchStart.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(activeIndex + (dx < 0 ? 1 : -1));
            touchStart = null;
        });
        stage.addEventListener('pointercancel', function () { touchStart = null; });
    }

    galleryModal.addEventListener('click', function (event) {
        if (event.target === galleryModal) {
            closeGalleryModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (!galleryModal.classList.contains('active')) return;
        if (event.key === 'Escape') {
            closeGalleryModal();
        } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && nextButton) {
            event.preventDefault();
            showPhoto(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
        } else if (event.key === 'Tab' && dialog) {
            const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]'))
                .filter(function (element) { return element.getClientRects().length > 0; });
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                first?.focus();
            }
        }
    });
});
