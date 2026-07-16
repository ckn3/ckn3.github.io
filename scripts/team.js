document.addEventListener('DOMContentLoaded', function () {
    var defaultAvatar = 'https://scholar.google.com/citations/images/avatar_scholar_256.png';
    var personImages = document.querySelectorAll('.person-card img');

    personImages.forEach(function (image) {
        image.addEventListener('error', function () {
            if (image.src !== defaultAvatar) {
                image.src = defaultAvatar;
            }
        });
    });
});
