document.addEventListener('DOMContentLoaded', function () {
    var albums = Array.from(document.querySelectorAll('.album-collection'));
    if (!albums.length) return;

    function reveal(hash, focus) {
        if (!hash || hash === '#') return;
        var id;
        try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
        var target = document.getElementById(id);
        var album = target && target.closest('.album-collection');
        if (!album) return;
        albums.forEach(function (item) { item.open = item === album; });
        window.requestAnimationFrame(function () {
            var cover = album.querySelector(':scope > summary');
            target.scrollIntoView({ block: 'start' });
            if (focus) cover.focus({ preventScroll: true });
        });
    }

    document.querySelectorAll('.album-nav a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            var hash = link.getAttribute('href');
            if (window.location.hash !== hash) history.pushState(null, '', hash);
            reveal(hash, true);
        });
    });
    window.addEventListener('hashchange', function () { reveal(window.location.hash, false); });
    reveal(window.location.hash, false);
});
