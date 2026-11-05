/* Feral Frank · Konrad Sroka · GPL-3.0-only. Original PWA eye layers, quiet idle motion. */
(() => {
    'use strict';
    const art = document.querySelector('.hero-frank');
    if (!art) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const get = name => document.getElementById('about-' + name);
    let visible = false, idleTimer, returnTimer, blinkTimer, openTimer, frame;
    let target = [0, 0];
    const active = () => visible && !document.hidden && !reduced.matches;
    function gaze(x = 0, y = 0) {
        get('left-pupil').setAttribute('transform', `translate(${28 + x} ${-2 + y})`);
        get('right-pupil').setAttribute('transform', `translate(${34 + x * .82} ${12 + y * .7})`);
    }
    function lid(closed) {
        get('left-lid').setAttribute('d', closed ? 'M480 190H655V278H480Z' : 'M480 190H655V192Q570 184 480 192Z');
        get('left-lower-lid').setAttribute('d', closed ? 'M480 350H655V278H480Z' : 'M480 350H655V350H480Z');
        get('right-lid').setAttribute('d', closed ? 'M675 317H803V384H675Z' : 'M675 317H803V319Q745 313 675 319Z');
        get('right-lower-lid').setAttribute('d', closed ? 'M675 435H803V384H675Z' : 'M675 435H803V435H675Z');
    }
    function stop() {
        [idleTimer, returnTimer, blinkTimer, openTimer].forEach(clearTimeout);
        cancelAnimationFrame(frame);
        frame = 0;
        gaze();
        lid(false);
    }
    function scheduleBlink() {
        if (!active()) return;
        blinkTimer = setTimeout(() => {
            if (!active()) return;
            lid(true);
            openTimer = setTimeout(() => { lid(false); scheduleBlink(); }, 140);
        }, 4000 + Math.random() * 3000);
    }
    function sync() { stop(); if (active()) scheduleBlink(); }
    document.addEventListener('pointermove', event => {
        if (!active() || event.pointerType !== 'mouse') return;
        const box = art.getBoundingClientRect();
        target = [Math.max(-15, Math.min(15, (event.clientX - box.left - box.width / 2) / 20)),
            Math.max(-9, Math.min(9, (event.clientY - box.top - box.height * .25) / 25))];
        if (!frame) frame = requestAnimationFrame(() => { gaze(...target); frame = 0; });
        clearTimeout(idleTimer);
        clearTimeout(returnTimer);
        idleTimer = setTimeout(() => {
            if (!active()) return;
            gaze(-8, -2);
            returnTimer = setTimeout(() => gaze(), 1200);
        }, 1000);
    }, { passive: true });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(art);
    } else { visible = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', sync);
    window.addEventListener('blur', stop);
    window.addEventListener('focus', sync);
    if (reduced.addEventListener) reduced.addEventListener('change', sync);
    else reduced.addListener(sync);
})();
