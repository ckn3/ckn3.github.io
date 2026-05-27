document.addEventListener('DOMContentLoaded', function () {
    var defaultAvatar = 'https://scholar.google.com/citations/images/avatar_scholar_256.png';
    var collaboratorImages = document.querySelectorAll('.collaborator img');
    var anchorCollaborators = Array.from(document.querySelectorAll('.collaborators-wrapper .collaborator[id]'));
    var alphabetLinks = Array.from(document.querySelectorAll('.alphabet-index a'));

    collaboratorImages.forEach(function (image) {
        image.addEventListener('error', function () {
            if (image.src !== defaultAvatar) {
                image.src = defaultAvatar;
            }
        });
    });

    function updateActiveLetter() {
        if (!anchorCollaborators.length) {
            return;
        }

        var activeId = anchorCollaborators[0].id;
        var offset = window.innerWidth <= 768 ? 110 : 130;

        anchorCollaborators.forEach(function (card) {
            if (card.getBoundingClientRect().top - offset <= 0) {
                activeId = card.id;
            }
        });

        alphabetLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
        });
    }

    alphabetLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            alphabetLinks.forEach(function (item) {
                item.classList.remove('active');
            });
            link.classList.add('active');
        });
    });

    window.addEventListener('scroll', updateActiveLetter, { passive: true });
    window.addEventListener('load', updateActiveLetter);
    updateActiveLetter();
});
