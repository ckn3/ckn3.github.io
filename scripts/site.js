document.addEventListener('DOMContentLoaded', function () {
    var navigation = document.querySelector('.site-nav');
    var currentLink = navigation && navigation.querySelector('[aria-current="page"]');

    if (!navigation || !currentLink || !window.matchMedia('(max-width: 768px)').matches) {
        return;
    }

    window.requestAnimationFrame(function () {
        currentLink.scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
            inline: 'center'
        });
    });
});
