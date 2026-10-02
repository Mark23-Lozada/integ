/* ==========================================================================
   PocketPads Animation Kit
   - AOS (Animate On Scroll) bridge  -> works even inside the scrollable main area
   - Count-up numbers  (v-countup directive)
   - Table row / chart / modal / page transition animations
   Walang binago sa design — animations lang.
   Place this file in:  View/animations.js
   ========================================================================== */
(function() {
    'use strict';

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---------------------------------------------------------------------
       1. GLOBAL CSS (injected once)
       --------------------------------------------------------------------- */
    var rowDelays = '';
    for (var i = 1; i <= 12; i++) {
        rowDelays += 'tbody > tr:nth-child(' + i + '){animation-delay:' + (0.04 * i).toFixed(2) + 's}';
    }

    var css = [
        /* AOS start positions (high specificity so Tailwind's "transform" class can't cancel them) */
        '[data-aos="fade-up"]:not(.aos-animate){transform:translate3d(0,36px,0)!important}',
        '[data-aos="fade-down"]:not(.aos-animate){transform:translate3d(0,-30px,0)!important}',
        '[data-aos="fade-right"]:not(.aos-animate){transform:translate3d(-36px,0,0)!important}',
        '[data-aos="fade-left"]:not(.aos-animate){transform:translate3d(36px,0,0)!important}',
        '[data-aos="zoom-in"]:not(.aos-animate){transform:scale(.9)!important}',
        '[data-aos="zoom-in-up"]:not(.aos-animate){transform:translate3d(0,30px,0) scale(.94)!important}',

        /* Safety net: if AOS fails to load (or reduced motion) everything stays visible */
        '.pp-no-aos [data-aos]{opacity:1!important;transform:none!important;transition:none!important;pointer-events:auto!important}',

        /* Table rows: soft slide-in, fill-mode "backwards" => rows ALWAYS end up visible */
        '@keyframes ppRowIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
        'tbody > tr{animation:ppRowIn .5s cubic-bezier(.22,1,.36,1) backwards}',
        rowDelays,
        'tbody > tr:nth-child(n+13){animation-delay:.5s}',

        /* Charts: line draw, area fade, point pop */
        '@keyframes ppDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}',
        '.pp-chart-line{stroke-dasharray:1;stroke-dashoffset:0;animation:ppDraw 1.6s cubic-bezier(.65,0,.35,1) backwards}',
        '@keyframes ppFade{from{opacity:0}to{opacity:1}}',
        '.pp-chart-area{animation:ppFade 1.2s ease-out .4s backwards}',
        '@keyframes ppPoint{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
        '.pp-chart-point{animation:ppPoint .55s cubic-bezier(.34,1.56,.64,1) backwards}',

        /* Modals: fade overlay + pop the dialog */
        '@keyframes ppOverlayIn{from{opacity:0}to{opacity:1}}',
        '@keyframes ppModalIn{from{opacity:0;transform:translateY(24px) scale(.95)}to{opacity:1;transform:none}}',
        '.fixed.inset-0.z-50{animation:ppOverlayIn .25s ease-out backwards}',
        '.fixed.inset-0.z-50 > div{animation:ppModalIn .38s cubic-bezier(.22,1,.36,1) backwards}',

        /* Page (route) transition */
        '.pp-page-enter-active{transition:opacity .4s ease,transform .45s cubic-bezier(.22,1,.36,1)}',
        '.pp-page-leave-active{transition:opacity .18s ease}',
        '.pp-page-enter-from{opacity:0;transform:translateY(14px)}',
        '.pp-page-leave-to{opacity:0}',

        /* Sidebar nav links: staggered slide-in (CSS only, safe with router-link-active) */
        '@keyframes ppNavIn{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}',
        '.nav-link{animation:ppNavIn .6s cubic-bezier(.22,1,.36,1) backwards}',
        '.nav-link:nth-child(1){animation-delay:.20s}.nav-link:nth-child(2){animation-delay:.25s}.nav-link:nth-child(3){animation-delay:.30s}',
        '.nav-link:nth-child(4){animation-delay:.35s}.nav-link:nth-child(5){animation-delay:.40s}.nav-link:nth-child(6){animation-delay:.45s}',

        /* Reduced motion */
        '@media (prefers-reduced-motion: reduce){.nav-link,tbody > tr,.pp-chart-line,.pp-chart-area,.pp-chart-point,.fixed.inset-0.z-50,.fixed.inset-0.z-50 > div{animation:none!important}.pp-chart-line{stroke-dasharray:none}}'
    ].join('\n');

    var styleEl = document.createElement('style');
    styleEl.id = 'pp-animation-kit';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ---------------------------------------------------------------------
       2. COUNT-UP DIRECTIVE   (usage:  <h3 v-countup>₱{{ formatMoney(x) }}</h3>)
          - Reads the number that Vue already rendered, so the FINAL text is
            always exactly what your template produced.
       --------------------------------------------------------------------- */
    var NUM_RE = /-?\d[\d,]*(\.\d+)?/;

    function parseText(txt) {
        var m = NUM_RE.exec(txt);
        if (!m) return null;
        return {
            prefix: txt.slice(0, m.index),
            suffix: txt.slice(m.index + m[0].length),
            value: parseFloat(m[0].replace(/,/g, '')),
            decimals: m[1] ? m[1].length - 1 : 0,
            grouping: m[0].indexOf(',') !== -1
        };
    }

    function fmt(v, p) {
        return p.prefix + v.toLocaleString('en-US', {
            minimumFractionDigits: p.decimals,
            maximumFractionDigits: p.decimals,
            useGrouping: p.grouping
        }) + p.suffix;
    }

    function runCount(el, first) {
        var st = el._pp || (el._pp = { last: null, cur: 0, raf: 0 });
        var txt = el.textContent;
        if (!first && txt === st.last) return; // Vue did not touch it -> nothing to do

        var p = parseText(txt);
        if (!p || !isFinite(p.value)) { st.last = null; return; }

        cancelAnimationFrame(st.raf);
        var from = first ? 0 : st.cur;
        var to = p.value;
        st.cur = to;
        st.last = txt;
        if (reduceMotion || from === to) return;

        var duration = 2000,
            start = null;

        function frame(ts) {
            if (start === null) start = ts;
            var t = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            if (t < 1) {
                var out = fmt(from + (to - from) * eased, p);
                el.textContent = out;
                st.last = out;
                st.raf = requestAnimationFrame(frame);
            } else {
                el.textContent = txt; // exact final text from the template
                st.last = txt;
            }
        }
        st.raf = requestAnimationFrame(frame);
    }

    var countup = {
        mounted: function(el) { runCount(el, true); },
        updated: function(el) { runCount(el, false); },
        beforeUnmount: function(el) { if (el._pp) cancelAnimationFrame(el._pp.raf); }
    };

    /* ---------------------------------------------------------------------
       3. AOS BRIDGE
          AOS listens to window scroll only, but the main area of the dashboard
          scrolls inside a div. IntersectionObserver handles that correctly, so we
          let AOS provide the animations and trigger them with the observer.
          After the animation, data-aos is removed so Tailwind hover effects
          (hover:-translate-y-1 etc.) work normally again.
       --------------------------------------------------------------------- */
    var io = null;

    function reveal(el) {
        el.classList.add('aos-init', 'aos-animate');
        var delay = parseInt(el.getAttribute('data-aos-delay'), 10) || 0;
        var dur = parseInt(el.getAttribute('data-aos-duration'), 10) || 700;
        setTimeout(function() { el.removeAttribute('data-aos'); }, delay + dur + 250);
    }

    function watch(el) {
        if (el.__ppWatched) return;
        el.__ppWatched = true;
        if (io) io.observe(el);
        else reveal(el);
    }

    function scan(node) {
        if (!node || node.nodeType !== 1) return;
        if (node.hasAttribute('data-aos')) watch(node);
        var kids = node.querySelectorAll ? node.querySelectorAll('[data-aos]') : [];
        for (var k = 0; k < kids.length; k++) watch(kids[k]);
    }

    var started = false;

    function init() {
        if (started) return;
        started = true;

        if (reduceMotion || typeof AOS === 'undefined') {
            document.documentElement.classList.add('pp-no-aos');
            return;
        }

        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 30,
            delay: 0
        });

        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(function(entries) {
                entries.forEach(function(en) {
                    if (!en.isIntersecting) return;
                    io.unobserve(en.target);
                    reveal(en.target);
                });
            }, { root: null, rootMargin: '0px 0px -30px 0px', threshold: 0 });
        }

        scan(document.body);
        new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                for (var n = 0; n < m.addedNodes.length; n++) scan(m.addedNodes[n]);
            });
        }).observe(document.body, { childList: true, subtree: true });

        // Last-resort failsafe: nothing may stay hidden
        setTimeout(function() {
            var stuck = document.querySelectorAll('[data-aos]:not(.aos-animate)');
            if (!io)
                for (var s = 0; s < stuck.length; s++) reveal(stuck[s]);
        }, 1500);
    }

    /* ---------------------------------------------------------------------
       4. PUBLIC API
       --------------------------------------------------------------------- */
    window.AnimationKit = {
        init: init,
        countup: countup,
        registerVue: function(app) { app.directive('countup', countup); }
    };
})();