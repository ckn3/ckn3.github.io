document.addEventListener('DOMContentLoaded', function () {
    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImage = document.getElementById('gallery-modal-image');
    const galleryModalClose = document.getElementById('gallery-modal-close');
    const galleryTriggers = document.querySelectorAll('.gallery-trigger');
    let lastFocusedTrigger = null;

    if (!galleryModal || !galleryModalImage || !galleryModalClose || !galleryTriggers.length) {
        return;
    }

    document.querySelectorAll('[data-hide-on-error]').forEach(function (image) {
        image.addEventListener('error', function () {
            const card = image.closest('.gallery-card');
            if (card) {
                card.style.display = 'none';
            }
        });
    });

    function openGalleryModal(image) {
        if (!image.src) return;
        lastFocusedTrigger = image;
        galleryModalImage.src = image.src;
        galleryModalImage.alt = image.alt || '';
        galleryModal.classList.add('active');
        galleryModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        galleryModalClose.focus();
    }

    function closeGalleryModal() {
        if (!galleryModal.classList.contains('active')) return;
        galleryModal.classList.remove('active');
        galleryModal.setAttribute('aria-hidden', 'true');
        galleryModalImage.src = '';
        galleryModalImage.alt = '';
        document.body.classList.remove('modal-open');

        if (lastFocusedTrigger) {
            lastFocusedTrigger.focus();
            lastFocusedTrigger = null;
        }
    }

    galleryTriggers.forEach(function (image) {
        image.setAttribute('role', 'button');
        image.setAttribute('tabindex', '0');
        image.setAttribute('aria-label', 'Open larger image: ' + (image.alt || 'gallery image'));

        image.addEventListener('click', function () {
            openGalleryModal(image);
        });

        image.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openGalleryModal(image);
            }
        });
    });

    galleryModalClose.addEventListener('click', closeGalleryModal);

    galleryModal.addEventListener('click', function (event) {
        if (event.target === galleryModal) {
            closeGalleryModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && galleryModal.classList.contains('active')) {
            closeGalleryModal();
        } else if (event.key === 'Tab' && galleryModal.classList.contains('active')) {
            event.preventDefault();
            galleryModalClose.focus();
        }
    });
});
