document.addEventListener('DOMContentLoaded', function () {
    var defaultAvatar = new URL('figures/team/avatar-placeholder.svg', document.baseURI).href;
    var personImages = document.querySelectorAll('.person-card img');

    personImages.forEach(function (image) {
        function showFallback() {
            if (image.src === defaultAvatar) return;
            image.alt = image.alt ? image.alt + ' (photo unavailable)' : '';
            image.src = defaultAvatar;
        }

        image.addEventListener('error', showFallback, { once: true });
        // A cached failure can occur before DOMContentLoaded installs the listener.
        if (image.complete && image.naturalWidth === 0) showFallback();
    });
});
