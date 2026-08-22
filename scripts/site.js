document.addEventListener('DOMContentLoaded', function () {
    var navigation = document.querySelector('.site-nav');
    var currentLink = navigation && navigation.querySelector('[aria-current="page"]');

    if (!navigation || !currentLink || !window.matchMedia('(max-width: 768px)').matches) {
        return;
    }

    window.requestAnimationFrame(function () {
        var centeredLeft = currentLink.offsetLeft - (navigation.clientWidth - currentLink.offsetWidth) / 2;
        navigation.scrollLeft = Math.max(0, centeredLeft);
    });
});
