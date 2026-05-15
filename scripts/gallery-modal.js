document.addEventListener('DOMContentLoaded', function () {
    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImage = document.getElementById('gallery-modal-image');
    const galleryModalClose = document.getElementById('gallery-modal-close');
    const galleryTriggers = document.querySelectorAll('.gallery-trigger');

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
        galleryModalImage.src = image.src;
        galleryModalImage.alt = image.alt || '';
        galleryModal.classList.add('active');
        galleryModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeGalleryModal() {
        galleryModal.classList.remove('active');
        galleryModal.setAttribute('aria-hidden', 'true');
        galleryModalImage.src = '';
        galleryModalImage.alt = '';
        document.body.style.overflow = '';
    }

    galleryTriggers.forEach(function (image) {
        image.addEventListener('click', function () {
            openGalleryModal(image);
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
        }
    });
});
