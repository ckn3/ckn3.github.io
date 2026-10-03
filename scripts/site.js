document.addEventListener('DOMContentLoaded', function () {
    var navigation = document.querySelector('.site-nav');
    var currentLink = navigation && navigation.querySelector('[aria-current="page"]');

    if (navigation && currentLink && window.matchMedia('(max-width: 768px)').matches) {
        window.requestAnimationFrame(function () {
            var centeredLeft = currentLink.offsetLeft - (navigation.clientWidth - currentLink.offsetWidth) / 2;
            navigation.scrollLeft = Math.max(0, centeredLeft);
        });
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.querySelectorAll('.text-disclosure, .recruitment-details').forEach(function (details) {
        var summary = details.querySelector(':scope > summary');
        if (!summary || !details.animate) return;

        var content = document.createElement('div');
        content.className = 'disclosure-content';
        Array.from(details.childNodes).forEach(function (node) {
            if (node !== summary) content.appendChild(node);
        });
        details.appendChild(content);

        var animation = null;
        var expanding = details.open;

        function finish() {
            if (animation) {
                animation.onfinish = null;
                animation.cancel();
                animation = null;
            }
            details.open = expanding;
            content.inert = false;
            content.classList.remove('is-animating');
            summary.removeAttribute('aria-expanded');
        }

        summary.addEventListener('click', function (event) {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (event.target.closest('a, button, input, select, textarea')) return;
            event.preventDefault();

            // Keep native details semantics; only defer closing while the body contracts.
            var fromHeight = details.open ? content.getBoundingClientRect().height : 0;
            expanding = animation ? !expanding : !details.open;
            if (animation) {
                animation.onfinish = null;
                animation.cancel();
                animation = null;
            }
            if (reducedMotion.matches) {
                finish();
                return;
            }

            details.open = true;
            content.inert = !expanding;
            summary.setAttribute('aria-expanded', String(expanding));
            var toHeight = expanding ? content.getBoundingClientRect().height : 0;
            content.classList.add('is-animating');
            animation = content.animate([
                { height: fromHeight + 'px' },
                { height: toHeight + 'px' }
            ], {
                duration: 240,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'both'
            });
            animation.onfinish = finish;
        });

        // Settle to natural height on resize or preference changes, never leave clipped text.
        window.addEventListener('resize', function () { if (animation) finish(); });
        reducedMotion.addEventListener('change', function () { if (animation) finish(); });
    });
});
