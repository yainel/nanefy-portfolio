/* fx.js: the scroll and pointer effects used by the concept sites. Plain JavaScript, no dependencies.
   Everything is opt-in through HTML attributes, and everything stops for people who prefer reduced motion.

   data-reveal="up|fade|left|right|zoom|clip"   fade/slide in when scrolled into view (data-delay="ms")
   data-stagger="up"                            reveal the children one after another (data-gap="ms")
   data-split                                   reveal a heading word by word
   data-parallax="-0.3"                         move at a different speed than the page (negative = slower)
   data-scrub="exit|through|pin"                expose scroll progress 0..1 as the CSS variable --p
   data-steps + data-step                       sticky scrollytelling: marks the current step
   data-hscroll + .hs-track                     vertical scroll drives a horizontal track while pinned
   data-count="1926" (data-from, data-prefix, data-suffix, data-decimals)   count up when visible
   data-progress                                bar that fills with page scroll
   data-autohide                                header hides on scroll down, returns on scroll up
   data-magnetic, data-tilt, data-spotlight      pointer effects (mouse and pen only)            */
(function () {
  'use strict';
  var root = document.documentElement;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('fx', 'fx-ready');
  if (still) root.classList.add('fx-still');
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  /* ---------- Split headings into words ---------- */
  var wordIndex = 0;
  function split(node) {
    [].slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 1) return split(n);
      if (n.nodeType !== 3 || !n.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
        var w = document.createElement('span'), inner = document.createElement('span');
        w.className = 'w'; inner.textContent = part; inner.style.setProperty('--i', wordIndex++);
        w.appendChild(inner); frag.appendChild(w);
      });
      n.parentNode.replaceChild(frag, n);
    });
  }
  $$('[data-split]').forEach(function (el) { wordIndex = 0; el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim()); split(el); });

  /* ---------- Reveal on scroll ---------- */
  $$('[data-stagger]').forEach(function (parent) {
    [].forEach.call(parent.children, function (c, i) {
      if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', parent.dataset.stagger || 'up');
      c.style.setProperty('--d', i * (+parent.dataset.gap || 90) + 'ms');
    });
  });
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  $$('[data-reveal], [data-split]').forEach(function (el) {
    if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 'ms');
    revealer.observe(el);
  });

  /* ---------- Count up ---------- */
  function formatter(el) {
    var dec = +(el.dataset.decimals || 0), f = new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: el.dataset.grouping !== 'false' });
    return function (v) { el.textContent = (el.dataset.prefix || '') + f.format(v) + (el.dataset.suffix || ''); };
  }
  var counter = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counter.unobserve(e.target);
      var el = e.target, set = formatter(el), from = +(el.dataset.from || 0), to = +el.dataset.count, t0 = null, dur = +(el.dataset.duration || 1600);
      if (still) return set(to);
      requestAnimationFrame(function step(t) {
        t0 = t0 || t;
        var p = Math.min(1, (t - t0) / dur);
        set(from + (to - from) * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { if (!still) formatter(el)(+(el.dataset.from || 0)); counter.observe(el); });

  /* ---------- Everything tied to scroll position runs in one animation frame ---------- */
  var parallax = $$('[data-parallax]'), scrubs = $$('[data-scrub]'), steps = $$('[data-steps]'), tracks = $$('[data-hscroll]');
  var bars = $$('[data-progress]'), header = document.querySelector('[data-autohide]'), lastY = scrollY, queued = false;

  function sizeTracks() {
    tracks.forEach(function (sec) {
      var track = sec.querySelector('.hs-track'), native = still || innerWidth <= 700;
      sec.classList.toggle('hs-native', native);
      sec.style.height = native ? '' : (track.scrollWidth - innerWidth + innerHeight) + 'px';
      if (native) track.style.transform = '';
    });
  }

  function frame() {
    queued = false;
    var vh = innerHeight, y = scrollY;
    if (!still) parallax.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect(); // measure the parent so our own transform doesn't feed back
      if (r.bottom < -vh || r.top > vh * 2) return;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * +el.dataset.parallax).toFixed(1) + 'px,0)';
    });
    if (!still) scrubs.forEach(function (el) { // scroll-linked motion stays off for reduced motion
      var r = el.getBoundingClientRect(), mode = el.dataset.scrub, p;
      if (mode === 'exit') p = clamp(-r.top / r.height);
      else if (mode === 'pin') p = clamp(-r.top / (r.height - vh));
      else p = clamp((vh - r.top) / (vh + r.height));
      el.style.setProperty('--p', p.toFixed(4));
    });
    steps.forEach(function (box) {
      var items = $$('[data-step]', box), current = 0;
      items.forEach(function (s, i) { if (s.getBoundingClientRect().top < vh * .55) current = i; });
      if (box.dataset.active !== String(current)) {
        box.dataset.active = current;
        items.forEach(function (s, i) { s.classList.toggle('on', i === current); });
      }
    });
    tracks.forEach(function (sec) {
      if (sec.classList.contains('hs-native')) return;
      var r = sec.getBoundingClientRect(), track = sec.querySelector('.hs-track');
      var p = clamp(-r.top / (r.height - vh));
      track.style.transform = 'translate3d(' + (-p * (track.scrollWidth - innerWidth)).toFixed(1) + 'px,0,0)';
      sec.style.setProperty('--p', p.toFixed(4));
    });
    var max = document.documentElement.scrollHeight - vh;
    bars.forEach(function (b) { b.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0); });
    if (header) {
      if (y > lastY + 6 && y > 160) header.classList.add('fx-hide');
      else if (y < lastY - 6 || y < 160) header.classList.remove('fx-hide');
      header.classList.toggle('fx-scrolled', y > 12);
      lastY = y;
    }
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', function () { sizeTracks(); queue(); });
  addEventListener('load', function () { sizeTracks(); queue(); });
  sizeTracks(); frame();
  // Headers that hide must come back when someone tabs into them
  if (header) header.addEventListener('focusin', function () { header.classList.remove('fx-hide'); });

  /* ---------- Pointer effects (mouse and pen only) ---------- */
  if (!finePointer || still) return;
  $$('[data-magnetic]').forEach(function (el) {
    var strength = +(el.dataset.magnetic || .35);
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * strength + 'px,' + (e.clientY - r.top - r.height / 2) * strength + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });
  $$('[data-tilt]').forEach(function (el) {
    var max = +(el.dataset.tilt || 8);
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'perspective(900px) rotateX(' + (-y * max) + 'deg) rotateY(' + (x * max) + 'deg)';
      el.style.setProperty('--mx', (x + .5) * 100 + '%'); el.style.setProperty('--my', (y + .5) * 100 + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });
  $$('[data-spotlight]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
})();
