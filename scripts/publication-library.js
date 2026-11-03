document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('publication-filters');
    var library = document.getElementById('publication-library');
    if (!form || !library) return;
    var rows = Array.from(library.querySelectorAll('[data-publication-id]'));
    var count = document.getElementById('publication-count');
    var empty = document.getElementById('publication-empty');
    var more = document.getElementById('publication-more');
    var pageSize = 5;
    var limit = pageSize;
    var matches = rows;
    function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    var searchable = new Map(rows.map(function (row) {
        return [row, normalize(['.direction-title', '.library-authors', '.venue-inline'].map(function (selector) {
            return row.querySelector(selector).textContent;
        }).join(' '))];
    }));
    function render() {
        var terms = normalize(form.elements.search.value.trim()).split(/\s+/).filter(Boolean);
        matches = rows.filter(function (row) {
            return (!form.elements.theme.value || row.dataset.theme === form.elements.theme.value)
                && (!form.elements.year.value || row.dataset.year === form.elements.year.value)
                && (!form.elements.kind.value || row.dataset.kind === form.elements.kind.value)
                && terms.every(function (term) { return searchable.get(row).includes(term); });
        });
        var visible = new Set(matches.slice(0, limit));
        rows.forEach(function (row) { row.hidden = !visible.has(row); });
        count.textContent = 'Showing ' + visible.size + ' of ' + matches.length + ' matching publications (' + rows.length + ' total)';
        empty.hidden = matches.length > 0;
        more.hidden = limit >= matches.length;
        more.textContent = 'Show ' + Math.min(pageSize, matches.length - limit) + ' more publications';
    }
    form.hidden = false;
    var initialTheme = new URLSearchParams(window.location.search).get('theme');
    if (initialTheme && Array.from(form.elements.theme.options).some(function (option) { return option.value === initialTheme; })) {
        form.elements.theme.value = initialTheme;
    }
    form.addEventListener('submit', function (event) { event.preventDefault(); });
    form.addEventListener('input', function () { limit = pageSize; render(); });
    form.addEventListener('change', function () { limit = pageSize; render(); });
    form.addEventListener('reset', function () {
        queueMicrotask(function () { limit = pageSize; render(); });
    });
    more.addEventListener('click', function () {
        var next = matches[limit];
        limit += pageSize;
        render();
        if (next) next.focus({ preventScroll: true });
    });
    document.querySelectorAll('[data-filter-theme]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            form.elements.search.value = '';
            form.elements.year.value = '';
            form.elements.kind.value = '';
            form.elements.theme.value = link.dataset.filterTheme;
            limit = pageSize;
            render();
        });
    });
    // Permanent links must remain reachable even after narrowing the filters.
    document.addEventListener('publication:reveal', function (event) {
        var target = event.detail;
        var index = rows.indexOf(target);
        if (index < 0 || !target.hidden) return;
        ['search', 'year', 'kind', 'theme'].forEach(function (name) { form.elements[name].value = ''; });
        limit = Math.ceil((index + 1) / pageSize) * pageSize;
        render();
    });
    render();
});
