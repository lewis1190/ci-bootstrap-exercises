// Apply the same animated-exit behavior to all cards that contain an anchor with
// the class `stretched-link`. Each card can set a `data-animate-duration` (ms)
// — default 600ms — and the script will normalize that value and set
// `animationDuration` on the element. The behavior supports click and keyboard
// activation and prevents double navigation while animating.
(function () {
    // default duration in ms
    var DEFAULT_DURATION = 600;

    // handler factory that captures per-card variables
    function makeCardController(card) {
        var link = card.querySelector('a.stretched-link');
        if (!link) return null;

        var initial = parseInt(card.dataset.animateDuration || card.getAttribute('data-animate-duration') || DEFAULT_DURATION, 10);
        if (isNaN(initial) || initial <= 0) initial = DEFAULT_DURATION;
        card.dataset.animateDuration = String(initial);
        card.style.animationDuration = initial + 'ms';
        var duration = initial;

        var isLeaving = false;

        function activate(e) {
            if (isLeaving) {
                if (e) e.preventDefault();
                return;
            }
            if (e) e.preventDefault();
            isLeaving = true;

            card.classList.add('card-press');
            setTimeout(function () {
                card.classList.remove('card-press');
                card.classList.add('card-leaving');

                setTimeout(function () {
                    // use location.assign to keep history behavior predictable
                    window.location.assign(link.href);
                }, duration);
            }, 80);
        }

        // attach events
        link.addEventListener('click', activate, { passive: false });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate(e);
            }
        });

        // accessibility: make card focusable and announceable as a button
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');

        return {
            card: card,
            link: link
        };
    }

    // initialize controllers for existing cards
    var cards = document.querySelectorAll('.card');
    cards.forEach(function (card) {
        makeCardController(card);
    });

    // observe future additions to the DOM so cards appended later also get behavior
    if ('MutationObserver' in window) {
        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (!(node instanceof Element)) return;
                    // if a card itself was added
                    if (node.classList && node.classList.contains('card')) {
                        makeCardController(node);
                        return;
                    }
                    // if a subtree containing cards was added
                    var nested = node.querySelectorAll && node.querySelectorAll('.card');
                    if (nested && nested.length) {
                        nested.forEach(function (c) { makeCardController(c); });
                    }
                });
            });
        });

        mo.observe(document.body, { childList: true, subtree: true });
    }
})();
