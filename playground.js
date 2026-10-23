/* Skills playground. Each demo is defined once (html, css, js); the page renders it
   and the "View code" button shows that exact source. Plain JavaScript, no dependencies.
   Bilingual: html and css hold {{English|Español}} pairs, and each demo's js gets t(english, spanish). */
(function () {
  'use strict';
  var yg = window.yg;
  var T = window.ygT || function (s) { return s; }, spanish = window.ygLang === 'es';
  function t(en, es) { return spanish ? es : en; }
  function loc(src) { return src.replace(/\{\{([^|{}]*)\|([^{}]*)\}\}/g, function (m, en, es) { return spanish ? es : en; }); }
  var demos = [];
  function demo(d) { demos.push(d); }

  var groups = [
    { id: 'motion', t: 'Motion & effects', p: 'Animation, physics and visual polish, tuned to stay smooth and to respect reduced-motion settings.' },
    { id: 'ui', t: 'Pro UI patterns', p: 'The interactive building blocks real products need, with keyboard and screen-reader support built in.' },
    { id: 'web', t: 'Modern web platform', p: 'New CSS and browser APIs used in production-ready ways, with fallbacks where support is still landing.' },
    { id: 'apps', t: 'Mini apps', p: 'Small, complete tools. Each one is a full idea: state, input, output and export.' }
  ];

  /* =====================================================================
     MOTION & EFFECTS
     ===================================================================== */

  demo({
    id: 'magnetic', cat: 'motion', title: 'Magnetic buttons', tags: ['JS', 'Pointer events'],
    desc: 'Buttons lean toward your cursor and spring back with an elastic easing curve.',
    html: `
<div class="d-mag">
  <button class="btn btn-primary btn-lg d-mag-btn"><span>{{Hover near me|Acércate}}</span></button>
  <button class="btn d-mag-btn d-mag-round" aria-label="{{Next|Siguiente}}">&rarr;</button>
</div>`,
    css: `
.d-mag{display:flex;gap:28px;align-items:center;justify-content:center;height:180px}
.d-mag-btn{transition:transform .4s cubic-bezier(.2,.9,.3,1.4)}
.d-mag-btn span{display:inline-block;transition:transform .4s cubic-bezier(.2,.9,.3,1.4)}
.d-mag-round{width:56px;height:56px;border-radius:50%;font-size:20px}`,
    js: function (el) {
      el.querySelectorAll('.d-mag-btn').forEach(function (b) {
        var label = b.querySelector('span');
        el.addEventListener('pointermove', function (e) {
          var r = b.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          var pull = Math.max(0, 1 - Math.hypot(dx, dy) / 150); // only nearby buttons react
          b.style.transform = 'translate(' + dx * .4 * pull + 'px,' + dy * .4 * pull + 'px)';
          if (label) label.style.transform = 'translate(' + dx * .15 * pull + 'px,' + dy * .15 * pull + 'px)';
        });
        el.addEventListener('pointerleave', function () {
          b.style.transform = '';
          if (label) label.style.transform = '';
        });
      });
    }
  });

  demo({
    id: 'scramble', cat: 'motion', title: 'Text scramble', tags: ['JS', 'requestAnimationFrame'],
    desc: 'Each letter decodes on its own timeline, a classic "hacker" reveal done in about 30 lines.',
    html: `
<div class="d-scr">
  <p class="d-scr-text">{{Design that ships|Diseño que se lanza}}</p>
  <button class="btn">{{Next phrase|Otra frase}}</button>
</div>`,
    css: `
.d-scr{height:180px;display:grid;place-items:center;align-content:center;gap:16px;text-align:center}
.d-scr-text{font:700 26px/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:-.02em;min-height:32px}
.d-scr-text i{font-style:normal;color:var(--magic);opacity:.75}`,
    js: function (el, t) {
      var out = el.querySelector('.d-scr-text'), glyphs = '!<>-_/[]{}=+*^?#';
      var phrases = t(['Design that ships', 'Pixels with purpose', 'Code you can trust', 'Calm, clear, fast'],
                      ['Diseño que se lanza', 'Píxeles con propósito', 'Código confiable', 'Sereno, claro, rápido']);
      var n = 0, raf = 0;
      function esc(s) { return s.replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); }
      function scramble(to) {
        var from = out.textContent, queue = [], frame = 0;
        for (var i = 0; i < Math.max(from.length, to.length); i++) {
          var start = Math.floor(Math.random() * 20);
          queue.push({ from: from[i] || '', to: to[i] || '', start: start, end: start + 10 + Math.floor(Math.random() * 20) });
        }
        cancelAnimationFrame(raf);
        (function update() {
          var html = '', done = 0;
          queue.forEach(function (q) {
            if (frame >= q.end) { done++; html += esc(q.to); }
            else if (frame >= q.start) html += '<i>' + esc(glyphs[Math.floor(Math.random() * glyphs.length)]) + '</i>';
            else html += esc(q.from);
          });
          out.innerHTML = html;
          if (done < queue.length) { frame++; raf = requestAnimationFrame(update); }
        })();
      }
      el.querySelector('button').addEventListener('click', function () {
        n = (n + 1) % phrases.length;
        scramble(phrases[n]);
      });
    }
  });

  demo({
    id: 'aurora', cat: 'motion', title: 'Aurora glass', tags: ['CSS only', 'backdrop-filter'],
    desc: 'Glassmorphism over drifting, blurred color fields. No JavaScript, no images.',
    html: `
<div class="d-aur">
  <span class="d-aur-blob"></span><span class="d-aur-blob"></span><span class="d-aur-blob"></span>
  <div class="d-aur-glass">
    <b>{{Monthly goal|Meta del mes}}</b>
    <span>{{64% complete &middot; 11 days left|64% completado &middot; quedan 11 días}}</span>
    <div class="d-aur-bar"><i></i></div>
  </div>
</div>`,
    css: `
.d-aur{position:relative;height:200px;border-radius:12px;overflow:hidden;background:#0d0b1f;display:grid;place-items:center}
.d-aur-blob{position:absolute;width:180px;height:180px;border-radius:50%;filter:blur(40px);opacity:.85;animation:d-aur 9s ease-in-out infinite alternate}
.d-aur-blob:nth-child(1){background:var(--magic);left:-20px;top:-40px}
.d-aur-blob:nth-child(2){background:#2FB5E8;right:-30px;top:10px;animation-duration:11s;animation-delay:-3s}
.d-aur-blob:nth-child(3){background:#FF6FD8;left:35%;bottom:-90px;animation-duration:13s;animation-delay:-6s}
@keyframes d-aur{to{transform:translate(60px,30px) scale(1.25)}}
.d-aur-glass{position:relative;width:min(260px,80%);padding:16px;border-radius:14px;color:#fff;display:grid;gap:4px;
  background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);box-shadow:0 10px 30px rgba(0,0,0,.25);
  backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
.d-aur-glass span{font-size:12px;opacity:.8}
.d-aur-bar{height:6px;border-radius:6px;background:rgba(255,255,255,.2);margin-top:8px;overflow:hidden}
.d-aur-bar i{display:block;height:100%;width:64%;background:#fff;border-radius:inherit}`,
    js: null
  });

  demo({
    id: 'tilt', cat: 'motion', title: '3D tilt with glare', tags: ['CSS 3D', 'JS'],
    desc: 'Perspective, depth layers and a light reflection that follows your pointer.',
    html: `
<div class="d-tilt">
  <div class="d-tilt-card">
    <div class="d-tilt-glare"></div>
    <span class="d-tilt-chip"></span>
    <b>YG Studio</b>
    <small>&bull;&bull;&bull;&bull; 4242</small>
  </div>
</div>`,
    css: `
.d-tilt{height:200px;display:grid;place-items:center;perspective:800px}
.d-tilt-card{position:relative;width:240px;height:150px;border-radius:16px;padding:18px;color:#fff;overflow:hidden;
  background:linear-gradient(135deg,var(--magic),#2FB5E8);box-shadow:0 20px 40px -12px rgba(0,0,0,.45);
  transform-style:preserve-3d;transition:transform .6s cubic-bezier(.2,.9,.3,1);display:flex;flex-direction:column;justify-content:flex-end;gap:2px}
.d-tilt-card b{font-size:16px;transform:translateZ(30px)}
.d-tilt-card small{opacity:.85;letter-spacing:.1em;transform:translateZ(20px)}
.d-tilt-chip{position:absolute;top:18px;left:18px;width:36px;height:26px;border-radius:6px;background:linear-gradient(135deg,#f6e27a,#cba135)}
.d-tilt-glare{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;
  background:radial-gradient(circle at var(--gx,50%) var(--gy,0%),rgba(255,255,255,.55),transparent 55%)}
.d-tilt:hover .d-tilt-glare{opacity:1}`,
    js: function (el) {
      var card = el.querySelector('.d-tilt-card');
      var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
      el.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = clamp((e.clientX - r.left) / r.width), y = clamp((e.clientY - r.top) / r.height);
        card.style.transition = 'transform .1s';
        card.style.transform = 'rotateX(' + (.5 - y) * 24 + 'deg) rotateY(' + (x - .5) * 24 + 'deg)';
        card.style.setProperty('--gx', x * 100 + '%');
        card.style.setProperty('--gy', y * 100 + '%');
      });
      el.addEventListener('pointerleave', function () { card.style.transition = ''; card.style.transform = ''; });
    }
  });

  demo({
    id: 'scrolltl', cat: 'motion', title: 'Scroll-driven animation', tags: ['CSS', 'animation-timeline'],
    desc: 'The progress bar and cards are tied to scroll position by CSS alone. Older browsers get a tiny JS fallback.',
    html: `
<div class="d-st">
  <div class="row between" style="margin-bottom:8px"><span class="sub">{{Scroll inside the box|Desplázate dentro del recuadro}}</span><span class="badge d-st-mode"></span></div>
  <div class="d-st-bar"><i></i></div>
  <div class="d-st-box" tabindex="0" aria-label="{{Scrollable list|Lista desplazable}}">
    <div class="d-st-item">01 &middot; {{Discover|Descubrir}}</div>
    <div class="d-st-item">02 &middot; {{Define|Definir}}</div>
    <div class="d-st-item">03 &middot; {{Design|Diseñar}}</div>
    <div class="d-st-item">04 &middot; {{Build|Desarrollar}}</div>
    <div class="d-st-item">05 &middot; {{Test|Probar}}</div>
    <div class="d-st-item">06 &middot; {{Launch|Lanzar}}</div>
  </div>
</div>`,
    css: `
.d-st-bar{height:4px;border-radius:4px;background:var(--surface-3);overflow:hidden;margin-bottom:10px}
.d-st-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--magic),var(--magic-2));transform-origin:left;transform:scaleX(var(--p,0))}
.d-st-box{height:170px;overflow:auto;border-radius:10px;background:var(--surface-2);padding:12px;display:grid;gap:10px;overscroll-behavior:contain;scroll-timeline:--d-st block}
.d-st-item{padding:16px;border-radius:10px;background:var(--surface);box-shadow:var(--shadow-card);font-weight:600}
@supports (animation-timeline: view()){
  .d-st{timeline-scope:--d-st}
  .d-st-bar i{animation:d-st-grow linear both;animation-timeline:--d-st}
  .d-st-item{animation:d-st-pop linear both;animation-timeline:view();animation-range:entry 0% cover 30%}
}
@keyframes d-st-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes d-st-pop{from{opacity:0;transform:translateX(-24px) scale(.94)}to{opacity:1;transform:none}}`,
    js: function (el, t) {
      var native = window.CSS && CSS.supports('animation-timeline: view()');
      el.querySelector('.d-st-mode').textContent = native ? t('Native CSS', 'CSS nativo') : t('JS fallback', 'Respaldo en JS');
      if (native) return; // the browser does all the work
      var box = el.querySelector('.d-st-box'), bar = el.querySelector('.d-st-bar i');
      box.addEventListener('scroll', function () {
        bar.style.setProperty('--p', box.scrollTop / (box.scrollHeight - box.clientHeight));
      });
    }
  });

  demo({
    id: 'viewtx', cat: 'motion', title: 'View Transitions API', tags: ['JS', 'View Transitions'],
    desc: 'The browser morphs every tile from its old spot to its new one. One API call, no animation library.',
    html: `
<div class="d-vt">
  <div class="row">
    <button class="btn" data-act="shuffle">{{Shuffle|Mezclar}}</button>
    <button class="btn" data-act="sort">{{Sort|Ordenar}}</button>
    <button class="btn" data-act="layout">{{Change layout|Cambiar diseño}}</button>
  </div>
  <ul class="d-vt-list">
    <li style="--h:0">A</li><li style="--h:1">B</li><li style="--h:2">C</li><li style="--h:3">D</li>
    <li style="--h:4">E</li><li style="--h:5">F</li><li style="--h:6">G</li><li style="--h:7">H</li>
  </ul>
</div>`,
    css: `
.d-vt-list{list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
.d-vt-list.rows{grid-template-columns:1fr 1fr}
.d-vt-list.rows li{height:30px}
.d-vt-list li{height:48px;border-radius:10px;display:grid;place-items:center;font-weight:700;color:#fff;background:hsl(calc(245 + var(--h) * 16) 72% 58%)}
::view-transition-group(*){animation-duration:.5s;animation-timing-function:cubic-bezier(.2,.9,.3,1)}`,
    js: function (el) {
      var list = el.querySelector('.d-vt-list'), items = [].slice.call(list.children);
      items.forEach(function (li, i) { li.style.viewTransitionName = 'd-vt-' + i; });
      function transition(change) {
        if (document.startViewTransition) document.startViewTransition(change);
        else change(); // still works, just without the morph
      }
      el.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        if (!btn) return;
        transition(function () {
          if (btn.dataset.act === 'layout') return list.classList.toggle('rows');
          items.sort(btn.dataset.act === 'sort'
            ? function (a, b) { return a.textContent.localeCompare(b.textContent); }
            : function () { return Math.random() - .5; });
          items.forEach(function (li) { list.appendChild(li); });
        });
      });
    }
  });

  demo({
    id: 'particles', cat: 'motion', wide: true, title: 'Canvas particle field', tags: ['Canvas 2D', 'Physics'],
    desc: 'Drifting nodes link up when close and scatter away from your pointer. It pauses when off screen.',
    html: `
<canvas class="d-part" aria-label="{{Particle network that reacts to the pointer|Red de partículas que reacciona al puntero}}"></canvas>`,
    css: `
.d-part{width:100%;height:200px;border-radius:12px;display:block;cursor:crosshair;touch-action:none;
  background:radial-gradient(circle at 50% 30%,#1d1640,#0b0a14)}`,
    js: function (el) {
      var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
      var pts = [], mouse = { x: -999, y: -999 }, visible = false, running = false;
      var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      function size() { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      size(); window.addEventListener('resize', size);
      for (var i = 0; i < 70; i++) pts.push({ x: Math.random() * cv.clientWidth, y: Math.random() * cv.clientHeight, vx: Math.random() - .5, vy: Math.random() - .5 });
      cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      cv.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
      function frame() {
        var w = cv.clientWidth, h = cv.clientHeight;
        var accent = getComputedStyle(document.documentElement).getPropertyValue('--magic').trim() || '#8051FF';
        cx.clearRect(0, 0, w, h);
        pts.forEach(function (p) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy) || 1;
          if (d < 90) { p.vx += dx / d * .35; p.vy += dy / d * .35; } // push away from pointer
          p.vx = (p.vx + (Math.random() - .5) * .05) * .98;
          p.vy = (p.vy + (Math.random() - .5) * .05) * .98;
          p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h;
        });
        cx.strokeStyle = accent;
        for (var a = 0; a < pts.length; a++) for (var b = a + 1; b < pts.length; b++) {
          var dist = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
          if (dist < 80) { cx.globalAlpha = 1 - dist / 80; cx.beginPath(); cx.moveTo(pts[a].x, pts[a].y); cx.lineTo(pts[b].x, pts[b].y); cx.stroke(); }
        }
        cx.globalAlpha = 1; cx.fillStyle = '#fff';
        pts.forEach(function (p) { cx.beginPath(); cx.arc(p.x, p.y, 1.8, 0, 7); cx.fill(); });
        if (visible && !still) requestAnimationFrame(frame); else running = false;
      }
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !running) { running = true; requestAnimationFrame(frame); }
      }).observe(cv);
    }
  });

  /* =====================================================================
     PRO UI PATTERNS
     ===================================================================== */

  demo({
    id: 'dashboard', cat: 'ui', wide: true, title: 'Analytics chart', tags: ['SVG', 'Data viz', 'A11y'],
    desc: 'A hand-built line chart: date ranges, period-over-period change, crosshair tooltip and arrow-key navigation.',
    html: `
<div class="d-dash">
  <div class="d-dash-head">
    <div>
      <span class="sub">{{Website visitors|Visitas al sitio}}</span>
      <b class="d-dash-total">0</b>
      <span class="badge d-dash-delta"></span>
    </div>
    <div class="segmented d-seg" role="group" aria-label="{{Date range|Rango de fechas}}">
      <button aria-pressed="false" data-days="7">7D</button>
      <button aria-pressed="true" data-days="30">30D</button>
      <button aria-pressed="false" data-days="90">90D</button>
    </div>
  </div>
  <div class="d-dash-plot">
    <svg class="d-dash-svg" tabindex="0" role="img" aria-label="{{Daily visitors. Use the arrow keys to read each day.|Visitas diarias. Usa las flechas para leer cada día.}}"></svg>
    <div class="d-dash-tip" hidden></div>
  </div>
  <div class="sr d-dash-live" aria-live="polite"></div>
</div>`,
    css: `
.d-dash-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.d-dash-total{display:block;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.d-dash-plot{position:relative}
.d-dash-svg{width:100%;height:190px;display:block;overflow:visible;touch-action:pan-y}
.d-dash-svg:focus-visible{outline:2px solid var(--magic);outline-offset:4px;border-radius:6px}
.d-dash-svg .grid{stroke:var(--border)}
.d-dash-svg .axis{fill:var(--text-3);font-size:11px}
.d-dash-svg .line{fill:none;stroke:var(--magic);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.d-dash-svg .line.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:d-dash-draw 1s cubic-bezier(.3,.7,.2,1) forwards}
@keyframes d-dash-draw{to{stroke-dashoffset:0}}
.d-dash-svg .cross{stroke:var(--text-3);stroke-dasharray:3 3;opacity:0}
.d-dash-svg .dot{fill:var(--magic);stroke:var(--surface);stroke-width:2;opacity:0}
.d-dash-svg.hover .cross,.d-dash-svg.hover .dot{opacity:1}
.d-dash-tip{position:absolute;pointer-events:none;background:var(--primary);color:var(--on-primary);font-size:12px;line-height:16px;padding:6px 8px;border-radius:8px;white-space:nowrap;box-shadow:var(--shadow-pop)}
.d-dash-tip b{display:block;font-size:13px}
.d-seg button[aria-pressed="true"]{background:var(--surface);box-shadow:var(--shadow-card)}`,
    js: function (el, t) {
      var svg = el.querySelector('svg'), plot = el.querySelector('.d-dash-plot'), tip = el.querySelector('.d-dash-tip');
      var totalEl = el.querySelector('.d-dash-total'), deltaEl = el.querySelector('.d-dash-delta'), live = el.querySelector('.d-dash-live');
      var locale = t('en-US', 'es');
      var day = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }), num = new Intl.NumberFormat(locale);

      // Sample data: steady growth, a weekly rhythm and some noise (seeded, so it is stable)
      var seed = 11, rnd = function () { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
      var data = [], now = new Date();
      for (var i = 179; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        var week = [.72, 1, 1.06, 1.08, 1.04, .94, .7][d.getDay()];
        data.push({ d: d, v: Math.round((800 + (179 - i) * 6) * week * (.88 + rnd() * .24)) });
      }

      var days = 30, pts = [], max = 0, idx = -1, shown = 0, animate = true;
      var H = 190, P = { l: 40, r: 12, t: 14, b: 26 };
      function sx(i) { return P.l + i * (plot.clientWidth - P.l - P.r) / (pts.length - 1); }
      function sy(v) { return P.t + (1 - v / max) * (H - P.t - P.b); }

      function draw() {
        var W = plot.clientWidth;
        pts = data.slice(-days);
        var sum = 0, prev = 0;
        pts.forEach(function (p) { sum += p.v; });
        data.slice(-days * 2, -days).forEach(function (p) { prev += p.v; });
        // Round the axis to a "nice" step (1, 2, 2.5 or 5 x 10^n) so gridlines land on readable numbers
        var raw = Math.max.apply(null, pts.map(function (p) { return p.v; })) / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
        var stepSize = [1, 2, 2.5, 5, 10].filter(function (s) { return s * mag >= raw; })[0] * mag;
        max = stepSize * 4;

        var g = '';
        for (var k = 0; k <= 4; k++) {
          var v = max * k / 4, y = sy(v);
          g += '<line class="grid" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + y + '" y2="' + y + '"/>' +
               '<text class="axis" x="' + (P.l - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (v >= 1000 ? v / 1000 + 'k' : v) + '</text>';
        }
        [0, Math.floor((pts.length - 1) / 2), pts.length - 1].forEach(function (i, n) {
          g += '<text class="axis" x="' + sx(i) + '" y="' + (H - 6) + '" text-anchor="' + ['start', 'middle', 'end'][n] + '">' + day.format(pts[i].d) + '</text>';
        });
        var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(p.v).toFixed(1); }).join(' ');
        var area = line + ' L' + sx(pts.length - 1) + ' ' + sy(0) + ' L' + sx(0) + ' ' + sy(0) + ' Z';

        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.innerHTML =
          '<defs><linearGradient id="d-dash-fill" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" style="stop-color:var(--magic);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--magic);stop-opacity:0"/></linearGradient></defs>' +
          g + '<path d="' + area + '" fill="url(#d-dash-fill)"/>' +
          '<path class="line' + (animate ? ' draw' : '') + '" d="' + line + '" pathLength="1"/>' +
          '<line class="cross" y1="' + P.t + '" y2="' + sy(0) + '"/><circle class="dot" r="4"/>';
        animate = false;

        countTo(sum);
        var change = (sum / prev - 1) * 100, up = change >= 0;
        deltaEl.className = 'badge d-dash-delta ' + (up ? 'success' : 'critical');
        deltaEl.textContent = (up ? '↑ ' : '↓ ') + new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(change)) + t('% vs previous ' + days + ' days', '% vs. los ' + days + ' días anteriores');
        hover(-1);
      }

      function countTo(target) {
        var from = shown, t0 = null;
        requestAnimationFrame(function step(t) {
          t0 = t0 || t;
          var p = Math.min(1, (t - t0) / 600);
          shown = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
          totalEl.textContent = num.format(shown);
          if (p < 1) requestAnimationFrame(step);
        });
      }

      function hover(i) {
        idx = i;
        svg.classList.toggle('hover', i > -1);
        tip.hidden = i < 0;
        if (i < 0) return;
        var x = sx(i), y = sy(pts[i].v);
        var cross = svg.querySelector('.cross'), dot = svg.querySelector('.dot');
        cross.setAttribute('x1', x); cross.setAttribute('x2', x);
        dot.setAttribute('cx', x); dot.setAttribute('cy', y);
        tip.innerHTML = '<b>' + num.format(pts[i].v) + t(' visitors', ' visitas') + '</b>' + day.format(pts[i].d);
        var left = Math.max(0, Math.min(plot.clientWidth - tip.offsetWidth, x - tip.offsetWidth / 2));
        tip.style.left = left + 'px';
        tip.style.top = Math.max(0, y - tip.offsetHeight - 12) + 'px';
      }

      svg.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect(), step = (plot.clientWidth - P.l - P.r) / (pts.length - 1);
        hover(Math.max(0, Math.min(pts.length - 1, Math.round((e.clientX - r.left - P.l) / step))));
      });
      svg.addEventListener('pointerleave', function () { hover(-1); });
      svg.addEventListener('blur', function () { hover(-1); });
      svg.addEventListener('keydown', function (e) {
        var next = { ArrowLeft: idx - 1, ArrowRight: idx + 1, Home: 0, End: pts.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        if (idx < 0) next = pts.length - 1;
        hover(Math.max(0, Math.min(pts.length - 1, next)));
        live.textContent = day.format(pts[idx].d) + ': ' + num.format(pts[idx].v) + t(' visitors', ' visitas');
      });

      el.querySelectorAll('[data-days]').forEach(function (b) {
        b.addEventListener('click', function () {
          el.querySelectorAll('[data-days]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          days = +b.dataset.days; animate = true; draw();
        });
      });
      new ResizeObserver(function () { draw(); }).observe(plot); // also does the first draw
    }
  });

  demo({
    id: 'kanban', cat: 'ui', wide: true, title: 'Kanban board', tags: ['Drag & drop', 'Touch', 'Keyboard'],
    desc: 'Pointer-based dragging that also works on phones, plus full keyboard control and screen-reader announcements.',
    html: `
<div class="d-kb">
  <div class="d-kb-cols">
    <section class="d-kb-col"><h4>{{To do|Pendiente}} <span class="badge">3</span></h4>
      <ul class="d-kb-list" aria-label="{{To do|Pendiente}}">
        <li class="d-kb-card" tabindex="0">Moodboard<span style="--c:#8051FF">{{Design|Diseño}}</span><i class="d-kb-grip" aria-hidden="true">&#8942;&#8942;</i></li>
        <li class="d-kb-card" tabindex="0">{{Write homepage copy|Textos de la portada}}<span style="--c:#29845A">{{Content|Contenido}}</span><i class="d-kb-grip" aria-hidden="true">&#8942;&#8942;</i></li>
        <li class="d-kb-card" tabindex="0">{{Set up analytics|Configurar analítica}}<span style="--c:#2C6ECB">Dev</span><i class="d-kb-grip" aria-hidden="true">&#8942;&#8942;</i></li>
      </ul>
    </section>
    <section class="d-kb-col"><h4>{{In progress|En curso}} <span class="badge">2</span></h4>
      <ul class="d-kb-list" aria-label="{{In progress|En curso}}">
        <li class="d-kb-card" tabindex="0">Design tokens<span style="--c:#8051FF">{{Design|Diseño}}</span><i class="d-kb-grip" aria-hidden="true">&#8942;&#8942;</i></li>
        <li class="d-kb-card" tabindex="0">{{Checkout API|API de pago}}<span style="--c:#2C6ECB">Dev</span><i class="d-kb-grip" aria-hidden="true">&#8942;&#8942;</i></li>
      </ul>
    </section>
    <section class="d-kb-col"><h4>{{Done|Hecho}} <span class="badge">1</span></h4>
      <ul class="d-kb-list" aria-label="{{Done|Hecho}}">
        <li class="d-kb-card" tabindex="0">{{Mobile QA pass|Pruebas en móvil}}<span style="--c:#E8731F">QA</span><i class="d-kb-grip" aria-hidden="true">&#8942;&#8942;</i></li>
      </ul>
    </section>
  </div>
  <p class="sub" style="margin-top:10px">{{Drag a card (on touch screens, by its &#8942;&#8942; handle), or focus one and use the arrow keys.|Arrastra una tarjeta (en pantallas táctiles, por su asa &#8942;&#8942;), o enfócala y usa las flechas.}}</p>
  <div class="sr d-kb-live" aria-live="polite"></div>
</div>`,
    css: `
.d-kb-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.d-kb-col{background:var(--surface-2);border-radius:12px;padding:10px}
.d-kb-col h4{font-size:13px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.d-kb-list{list-style:none;display:grid;gap:8px;min-height:120px;align-content:start}
.d-kb-card{background:var(--surface);border-radius:10px;padding:10px;box-shadow:var(--shadow-card);font-weight:550;font-size:13px;
  cursor:grab;user-select:none;-webkit-user-select:none;display:grid;gap:6px;position:relative;padding-right:40px}
.d-kb-grip{position:absolute;top:4px;right:4px;width:32px;height:32px;display:grid;place-items:center;border-radius:8px;color:var(--text-3);
  font-style:normal;font-size:14px;letter-spacing:-2px;touch-action:none;cursor:grab}
.d-kb-grip:hover{background:var(--surface-3)}
.d-kb-card span{justify-self:start;font-size:11px;font-weight:600;padding:1px 8px;border-radius:6px;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent)}
.d-kb-card:focus-visible{outline:2px solid var(--magic);outline-offset:2px}
.d-kb-card.dragging{position:fixed;z-index:400;pointer-events:none;cursor:grabbing;transform:rotate(3deg) scale(1.04);box-shadow:0 18px 40px rgba(0,0,0,.25)}
.d-kb-ph{border:2px dashed var(--border-strong);border-radius:10px;background:transparent}
@media (max-width:600px){
  .d-kb-cols{grid-template-columns:1fr}
  .d-kb-list{min-height:56px}
}`,
    js: function (el, t) {
      var lists = [].slice.call(el.querySelectorAll('.d-kb-list')), live = el.querySelector('.d-kb-live'), drag = null;
      function counts() { lists.forEach(function (l) { l.parentNode.querySelector('.badge').textContent = l.children.length; }); }
      function announce(card) {
        var list = card.parentNode;
        live.textContent = card.firstChild.textContent + t(' moved to ', ' movida a ') + list.getAttribute('aria-label') + t(', position ', ', posición ') + ([].indexOf.call(list.children, card) + 1);
      }

      el.addEventListener('pointerdown', function (e) {
        var card = e.target.closest('.d-kb-card');
        if (!card || e.button !== 0) return;
        if (e.pointerType === 'touch' && !e.target.closest('.d-kb-grip')) return; // touch drags by the handle, so swiping a card still scrolls the page
        var r = card.getBoundingClientRect();
        drag = { card: card, dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', end);
        document.addEventListener('pointercancel', end);
      });
      function move(e) {
        var c = drag.card;
        if (!drag.moved) {
          if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return; // a click, not a drag yet
          drag.moved = true;
          drag.ph = document.createElement('li');
          drag.ph.className = 'd-kb-ph';
          drag.ph.style.height = c.offsetHeight + 'px';
          c.style.width = c.offsetWidth + 'px';
          c.parentNode.insertBefore(drag.ph, c);
          document.body.appendChild(c); // float above everything while dragging
          c.classList.add('dragging');
        }
        c.style.left = e.clientX - drag.dx + 'px';
        c.style.top = e.clientY - drag.dy + 'px';
        var under = document.elementFromPoint(e.clientX, e.clientY);
        var list = under && under.closest('.d-kb-list');
        if (!list || !el.contains(list)) return;
        var before = [].slice.call(list.querySelectorAll('.d-kb-card')).filter(function (x) {
          var rr = x.getBoundingClientRect();
          return e.clientY < rr.top + rr.height / 2;
        })[0];
        list.insertBefore(drag.ph, before || null);
      }
      function end() {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
        if (drag.moved) {
          drag.card.classList.remove('dragging');
          drag.card.style.cssText = '';
          drag.ph.replaceWith(drag.card);
          counts(); announce(drag.card);
        }
        drag = null;
      }

      el.addEventListener('keydown', function (e) {
        var card = e.target.closest('.d-kb-card');
        if (!card) return;
        var list = card.parentNode, i = lists.indexOf(list);
        if (e.key === 'ArrowRight' && lists[i + 1]) lists[i + 1].appendChild(card);
        else if (e.key === 'ArrowLeft' && lists[i - 1]) lists[i - 1].appendChild(card);
        else if (e.key === 'ArrowUp' && card.previousElementSibling) list.insertBefore(card, card.previousElementSibling);
        else if (e.key === 'ArrowDown' && card.nextElementSibling) list.insertBefore(card.nextElementSibling, card);
        else return;
        e.preventDefault(); card.focus(); counts(); announce(card);
      });
    }
  });

  demo({
    id: 'combobox', cat: 'ui', title: 'Autocomplete combobox', tags: ['ARIA', 'Keyboard'],
    desc: 'Follows the WAI-ARIA combobox pattern: ranked matches, highlighted text and full keyboard support.',
    html: `
<div class="d-cb">
  <label class="label" for="d-cb-in" style="display:block;margin-bottom:6px;font-weight:550">{{Country|País}}</label>
  <div class="d-cb-wrap">
    <input class="input" id="d-cb-in" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="d-cb-list" autocomplete="off" placeholder="{{Try &quot;sp&quot; or &quot;united&quot;|Prueba &quot;es&quot; o &quot;rep&quot;}}">
    <ul id="d-cb-list" class="d-cb-list" role="listbox" aria-label="{{Countries|Países}}" hidden></ul>
  </div>
  <p class="sub d-cb-out">{{Up and down to move, Enter to pick, Esc to close.|Flechas para moverte, Enter para elegir, Esc para cerrar.}}</p>
</div>`,
    css: `
.d-cb{min-height:200px}
.d-cb-wrap{position:relative}
.d-cb-list{list-style:none;position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);max-height:180px;overflow:auto;padding:4px;
  background:var(--surface);border-radius:10px;box-shadow:var(--shadow-modal)}
.d-cb-list li{padding:7px 10px;border-radius:7px;cursor:pointer}
.d-cb-list li[aria-selected="true"]{background:var(--magic-soft)}
.d-cb-list mark{background:none;color:var(--magic);font-weight:700}
.d-cb-list .d-cb-none{color:var(--text-3);cursor:default}
.d-cb-out{margin-top:10px}`,
    js: function (el, t) {
      var countries = t(['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica',
        'Cuba', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Guatemala', 'India',
        'Ireland', 'Italy', 'Jamaica', 'Japan', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Panama', 'Peru',
        'Portugal', 'Puerto Rico', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela'],
        ['Alemania', 'Argentina', 'Australia', 'Austria', 'Bélgica', 'Brasil', 'Canadá', 'Chile', 'China', 'Colombia', 'Corea del Sur',
        'Costa Rica', 'Cuba', 'Dinamarca', 'Ecuador', 'Egipto', 'España', 'Estados Unidos', 'Finlandia', 'Francia', 'Grecia', 'Guatemala',
        'India', 'Irlanda', 'Italia', 'Jamaica', 'Japón', 'Marruecos', 'México', 'Noruega', 'Nueva Zelanda', 'Países Bajos', 'Panamá',
        'Perú', 'Portugal', 'Puerto Rico', 'Reino Unido', 'República Dominicana', 'Suecia', 'Suiza', 'Uruguay', 'Venezuela']);
      var input = el.querySelector('input'), list = el.querySelector('[role=listbox]'), out = el.querySelector('.d-cb-out');
      var items = [], active = -1;
      function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
      function open(show) { list.hidden = !show; input.setAttribute('aria-expanded', show); }
      function render() {
        var q = input.value.trim().toLowerCase();
        items = countries.filter(function (c) { return c.toLowerCase().indexOf(q) > -1; })
          .sort(function (a, b) { return (b.toLowerCase().indexOf(q) === 0) - (a.toLowerCase().indexOf(q) === 0); }); // prefix matches first
        active = items.length ? 0 : -1;
        list.innerHTML = items.length ? items.map(function (c, i) {
          var k = c.toLowerCase().indexOf(q);
          var label = q ? esc(c.slice(0, k)) + '<mark>' + esc(c.slice(k, k + q.length)) + '</mark>' + esc(c.slice(k + q.length)) : esc(c);
          return '<li role="option" id="d-cb-o' + i + '" data-i="' + i + '">' + label + '</li>';
        }).join('') : '<li class="d-cb-none">' + t('No matches', 'Sin resultados') + '</li>';
        paint(); open(true);
      }
      function paint() {
        list.querySelectorAll('[role=option]').forEach(function (li) { li.setAttribute('aria-selected', +li.dataset.i === active); });
        if (active < 0) return input.removeAttribute('aria-activedescendant');
        input.setAttribute('aria-activedescendant', 'd-cb-o' + active);
        var li = list.querySelector('#d-cb-o' + active);
        list.scrollTop = Math.min(list.scrollTop, li.offsetTop - 4);
        if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight + 4;
      }
      function pick(i) { input.value = items[i]; open(false); out.textContent = t('Selected: ', 'Elegiste: ') + items[i]; }
      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      input.addEventListener('blur', function () { setTimeout(function () { open(false); }, 120); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (list.hidden) return render();
          if (!items.length) return;
          active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          paint();
        }
        if (e.key === 'Enter' && !list.hidden && active > -1) { e.preventDefault(); pick(active); }
        if (e.key === 'Escape') open(false);
      });
      list.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus in the input
      list.addEventListener('click', function (e) { var li = e.target.closest('[data-i]'); if (li) pick(+li.dataset.i); });
    }
  });

  demo({
    id: 'datepicker', cat: 'ui', title: 'Date range picker', tags: ['Intl', 'Keyboard'],
    desc: 'Pick a check-in and check-out, with a hover preview, blocked past dates and arrow-key navigation.',
    html: `
<div class="d-dp">
  <div class="d-dp-head">
    <button class="btn btn-plain d-dp-prev" aria-label="{{Previous month|Mes anterior}}">&lsaquo;</button>
    <b class="d-dp-month" aria-live="polite"></b>
    <button class="btn btn-plain d-dp-next" aria-label="{{Next month|Mes siguiente}}">&rsaquo;</button>
  </div>
  <div class="d-dp-grid"></div>
  <p class="sub d-dp-out">{{Pick a check-in date.|Elige la fecha de entrada.}}</p>
</div>`,
    css: `
.d-dp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.d-dp-head .btn{font-size:18px;width:32px;padding:0}
.d-dp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px 0;text-align:center}
.d-dp-grid .dow{font-size:11px;color:var(--text-3);font-weight:600;padding:4px 0}
.d-dp-grid button{height:32px;border:0;background:none;border-radius:8px;cursor:pointer;font-variant-numeric:tabular-nums}
.d-dp-grid button:hover:not(:disabled){background:var(--surface-3)}
.d-dp-grid button:disabled{color:var(--text-3);opacity:.5;cursor:default}
.d-dp-grid button.today{font-weight:700;color:var(--magic)}
.d-dp-grid button.in{background:var(--magic-soft);border-radius:0}
.d-dp-grid button.edge{background:var(--magic);color:#fff}
.d-dp-out{margin-top:8px;min-height:20px}`,
    js: function (el, t) {
      var grid = el.querySelector('.d-dp-grid'), title = el.querySelector('.d-dp-month'), out = el.querySelector('.d-dp-out');
      var locale = t('en-US', 'es');
      var mf = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
      var df = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
      var full = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var view = new Date(today.getFullYear(), today.getMonth(), 1), focus = today.getTime(), start = null, end = null, hover = null;

      function render(moveFocus) {
        title.textContent = mf.format(view);
        el.querySelector('.d-dp-prev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
        var html = t(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']).map(function (d) { return '<span class="dow">' + d + '</span>'; }).join('');
        for (var i = 0; i < view.getDay(); i++) html += '<span></span>';
        var n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= n; d++) {
          var ts = new Date(view.getFullYear(), view.getMonth(), d).getTime();
          html += '<button type="button" data-ts="' + ts + '"' + (ts < today ? ' disabled' : '') + ' tabindex="' + (ts === focus ? 0 : -1) +
                  '" aria-label="' + full.format(ts) + '"' + (ts === today.getTime() ? ' class="today"' : '') + '>' + d + '</button>';
        }
        grid.innerHTML = html;
        paint();
        if (moveFocus) { var f = grid.querySelector('[tabindex="0"]'); if (f) f.focus(); }
      }
      function paint() {
        var to = end || (start && hover > start ? hover : null);
        grid.querySelectorAll('button').forEach(function (b) {
          var ts = +b.dataset.ts;
          b.classList.toggle('edge', ts === start || ts === end);
          b.classList.toggle('in', !!(start && to && ts > start && ts < to));
          b.setAttribute('aria-pressed', ts === start || ts === end);
        });
        if (start && end) out.textContent = df.format(start) + ' → ' + df.format(end) + ' · ' + Math.round((end - start) / 864e5) + t(' nights', ' noches');
        else if (start) out.textContent = t('Check-in ', 'Entrada: ') + df.format(start) + t('. Now pick check-out.', '. Ahora elige la salida.');
        else out.textContent = t('Pick a check-in date.', 'Elige la fecha de entrada.');
      }
      grid.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var ts = +b.dataset.ts; focus = ts;
        if (!start || end || ts <= start) { start = ts; end = null; } else end = ts;
        paint();
      });
      grid.addEventListener('mouseover', function (e) { var b = e.target.closest('button'); hover = b ? +b.dataset.ts : null; if (start && !end) paint(); });
      grid.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (!step) return;
        e.preventDefault();
        var next = new Date(focus); next.setDate(next.getDate() + step);
        if (next < today) return;
        focus = next.getTime(); hover = focus;
        if (next.getMonth() !== view.getMonth()) view = new Date(next.getFullYear(), next.getMonth(), 1);
        render(true);
      });
      function month(n) {
        view = new Date(view.getFullYear(), view.getMonth() + n, 1);
        focus = Math.max(view.getTime(), today.getTime());
        render();
      }
      el.querySelector('.d-dp-prev').addEventListener('click', function () { month(-1); });
      el.querySelector('.d-dp-next').addEventListener('click', function () { month(1); });
      render();
    }
  });

  demo({
    id: 'virtual', cat: 'ui', title: 'Virtual scroll: 100,000 rows', tags: ['Performance', 'JS'],
    desc: 'Only the rows you can see exist in the page, so a huge list scrolls as smoothly as a short one.',
    html: `
<div class="d-vl">
  <div class="row between" style="margin-bottom:8px">
    <span class="sub">{{100,000 rows|100.000 filas}} &middot; <b class="d-vl-dom">0</b> {{in the DOM|en el DOM}}</span>
    <input class="input d-vl-jump" type="number" min="1" max="100000" placeholder="{{Jump to row|Ir a la fila}}" aria-label="{{Jump to row|Ir a la fila}}">
  </div>
  <div class="d-vl-view" tabindex="0" aria-label="{{Orders list|Lista de pedidos}}">
    <div class="d-vl-spacer"></div>
  </div>
</div>`,
    css: `
.d-vl-jump{width:130px;height:30px}
.d-vl-view{position:relative;height:200px;overflow:auto;border:1px solid var(--border);border-radius:10px;overscroll-behavior:contain}
.d-vl-row{position:absolute;left:0;right:0;height:36px;display:grid;grid-template-columns:64px 1fr auto 76px;gap:10px;align-items:center;
  padding:0 12px;border-bottom:1px solid var(--border);font-size:13px;font-variant-numeric:tabular-nums}
.d-vl-row .id{color:var(--text-3)}
.d-vl-row .amt{text-align:right;font-weight:600}
.d-vl-row.hit{background:var(--magic-soft)}`,
    js: function (el, t) {
      var view = el.querySelector('.d-vl-view'), spacer = el.querySelector('.d-vl-spacer'), dom = el.querySelector('.d-vl-dom');
      var N = 100000, RH = 36, hit = -1, queued = false;
      var first = ['Ana', 'Luis', 'Mia', 'Leo', 'Sofia', 'Diego', 'Emma', 'Noah', 'Valeria', 'Mateo', 'Olivia', 'Lucas'];
      var last = ['Garcia', 'Smith', 'Lopez', 'Chen', 'Rossi', 'Martin', 'Silva', 'Kim', 'Novak', 'Diaz'];
      var status = [[t('Paid', 'Pagado'), 'success'], [t('Pending', 'Pendiente'), 'warning'], [t('Refunded', 'Reembolsado'), '']];
      var money = new Intl.NumberFormat(t('en-US', 'es-US'), { style: 'currency', currency: 'USD' });
      spacer.style.height = N * RH + 'px';

      function row(i) { // every row is computed from its index, so nothing is stored
        var h = Math.imul(i + 1, 2654435761) >>> 0, s = status[h % 3];
        return '<div class="d-vl-row' + (i === hit ? ' hit' : '') + '" style="top:' + i * RH + 'px">' +
          '<span class="id">#' + (i + 1).toLocaleString(t('en-US', 'es')) + '</span><span>' + first[h % 12] + ' ' + last[(h >>> 4) % 10] + '</span>' +
          '<span class="badge ' + s[1] + '">' + s[0] + '</span><span class="amt">' + money.format((h % 90000) / 100 + 5) + '</span></div>';
      }
      function render() {
        queued = false;
        var a = Math.max(0, Math.floor(view.scrollTop / RH) - 4);
        var b = Math.min(N, Math.ceil((view.scrollTop + view.clientHeight) / RH) + 4), html = '';
        for (var i = a; i < b; i++) html += row(i);
        view.querySelectorAll('.d-vl-row').forEach(function (r) { r.remove(); });
        spacer.insertAdjacentHTML('afterend', html);
        dom.textContent = b - a;
      }
      view.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(render); } });
      el.querySelector('.d-vl-jump').addEventListener('change', function () {
        var n = Math.max(1, Math.min(N, Math.round(+this.value || 1)));
        hit = n - 1;
        view.scrollTop = hit * RH - view.clientHeight / 2 + RH / 2;
        render();
      });
      render();
    }
  });

  demo({
    id: 'otp', cat: 'ui', title: 'One-time code input', tags: ['Forms', 'Paste', 'Autofill'],
    desc: 'Auto-advance, smart backspace, paste-to-fill and phone autofill support. Try the code below.',
    html: `
<div class="d-otp">
  <p class="sub">{{Your code is|Tu código es}} <b>428 913</b>. <button class="btn btn-plain d-otp-copy" type="button">{{Copy it|Cópialo}}</button> {{and paste, or type it.|y pégalo, o escríbelo.}}</p>
  <div class="d-otp-boxes" role="group" aria-label="{{6-digit code|Código de 6 dígitos}}">
    <input inputmode="numeric" autocomplete="one-time-code" aria-label="{{Digit|Dígito}} 1"><input inputmode="numeric" aria-label="{{Digit|Dígito}} 2"><input inputmode="numeric" aria-label="{{Digit|Dígito}} 3">
    <span aria-hidden="true">&ndash;</span>
    <input inputmode="numeric" aria-label="{{Digit|Dígito}} 4"><input inputmode="numeric" aria-label="{{Digit|Dígito}} 5"><input inputmode="numeric" aria-label="{{Digit|Dígito}} 6">
  </div>
  <p class="d-otp-msg" aria-live="polite"></p>
</div>`,
    css: `
.d-otp{display:grid;gap:12px;justify-items:center;text-align:center;padding:8px 0}
.d-otp .btn-plain{height:auto;padding:0 2px;color:var(--magic)}
.d-otp-boxes{display:flex;gap:6px;align-items:center}
.d-otp-boxes input{width:42px;height:50px;text-align:center;font-size:22px;font-weight:700;border-radius:10px;border:1px solid var(--border-strong);background:var(--surface);transition:border-color .2s,box-shadow .2s,transform .2s}
.d-otp-boxes input:focus{outline:none;border-color:var(--magic);box-shadow:0 0 0 3px color-mix(in srgb,var(--magic) 25%,transparent)}
.d-otp.ok input{border-color:var(--success);background:var(--success-soft)}
.d-otp.bad .d-otp-boxes{animation:d-otp-shake .4s}
.d-otp.bad input{border-color:var(--critical)}
@keyframes d-otp-shake{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}
.d-otp-msg{min-height:20px;font-weight:550;font-size:13px}
.d-otp.ok .d-otp-msg{color:var(--success)}
.d-otp.bad .d-otp-msg{color:var(--critical)}
@media (max-width:420px){.d-otp-boxes input{width:36px;height:44px;font-size:18px}}`,
    js: function (el, t) {
      var boxes = [].slice.call(el.querySelectorAll('input')), msg = el.querySelector('.d-otp-msg'), CODE = '428913';
      function fill(digits, from) {
        digits.split('').forEach(function (c, k) { if (boxes[from + k]) boxes[from + k].value = c; });
        boxes[Math.min(from + digits.length, 5)].focus();
        check();
      }
      function check() {
        var v = boxes.map(function (b) { return b.value; }).join('');
        el.classList.remove('ok', 'bad');
        msg.textContent = '';
        if (v.length < 6) return;
        if (v === CODE) {
          el.classList.add('ok'); msg.textContent = t('Verified. Welcome back.', 'Verificado. Bienvenido de nuevo.');
          if (window.yg) yg.toast(t('Code verified', 'Código verificado'));
        } else {
          el.classList.add('bad'); msg.textContent = t('That code does not match. Try again.', 'Ese código no coincide. Inténtalo de nuevo.');
          setTimeout(function () { boxes.forEach(function (b) { b.value = ''; }); el.classList.remove('bad'); boxes[0].focus(); }, 700);
        }
      }
      boxes.forEach(function (b, i) {
        b.addEventListener('input', function () {
          var d = b.value.replace(/\D/g, '');
          if (d.length > 1) return fill(d.slice(0, 6 - i), i); // phone autofill drops the whole code in one box
          b.value = d;
          if (d && boxes[i + 1]) boxes[i + 1].focus();
          check();
        });
        b.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !b.value && boxes[i - 1]) { e.preventDefault(); boxes[i - 1].value = ''; boxes[i - 1].focus(); check(); }
          if (e.key === 'ArrowLeft' && boxes[i - 1]) boxes[i - 1].focus();
          if (e.key === 'ArrowRight' && boxes[i + 1]) boxes[i + 1].focus();
        });
        b.addEventListener('focus', function () { b.select(); });
        b.addEventListener('paste', function (e) {
          e.preventDefault();
          fill((e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6), 0);
        });
      });
      el.querySelector('.d-otp-copy').addEventListener('click', function () {
        if (window.yg) yg.copy(CODE, t('Code copied. Paste it into the first box.', 'Código copiado. Pégalo en la primera casilla.'));
      });
    }
  });

  /* =====================================================================
     MODERN WEB PLATFORM
     ===================================================================== */

  demo({
    id: 'container', cat: 'web', title: 'Container queries', tags: ['CSS', '@container'],
    desc: 'The card adapts to the space it is given, not to the screen. Drag the slider to resize its container.',
    html: `
<div class="d-cq">
  <div class="row between" style="margin-bottom:10px">
    <input type="range" class="range d-cq-size" min="35" max="100" value="100" aria-label="{{Container width|Ancho del contenedor}}" style="flex:1;max-width:220px">
    <span class="badge magic d-cq-w"></span>
  </div>
  <div class="d-cq-box">
    <article class="d-cq-card">
      <div class="d-cq-img"></div>
      <div class="d-cq-body">
        <b>Coral Gables loft</b>
        <span class="sub">{{2 beds &middot; 1 bath &middot; 900 sq ft|2 hab. &middot; 1 baño &middot; 84 m&sup2;}}</span>
        <span class="d-cq-price">{{$2,850/mo|$2.850/mes}}</span>
      </div>
      <button class="btn btn-primary">{{Book a tour|Agendar visita}}</button>
    </article>
  </div>
</div>`,
    css: `
.d-cq-box{container-type:inline-size;border:1px dashed var(--border-strong);border-radius:12px;padding:10px;transition:width .15s}
.d-cq-card{display:grid;gap:10px;background:var(--surface-2);border-radius:10px;padding:10px}
.d-cq-img{height:70px;border-radius:8px;background:linear-gradient(135deg,#7CD4A3,#2FB5E8)}
.d-cq-body{display:grid;gap:2px}
.d-cq-price{font-weight:700;color:var(--magic)}
@container (min-width:360px){
  .d-cq-card{grid-template-columns:96px 1fr auto;align-items:center}
  .d-cq-img{height:76px}
}
@container (max-width:200px){
  .d-cq-body .sub{display:none}
  .d-cq-card .btn{width:100%}
}`,
    js: function (el, t) {
      var box = el.querySelector('.d-cq-box'), badge = el.querySelector('.d-cq-w');
      el.querySelector('.d-cq-size').addEventListener('input', function () {
        box.style.width = this.value + '%';
        this.style.setProperty('--p', (this.value - 35) / 65 * 100 + '%');
      });
      el.querySelector('.d-cq-size').style.setProperty('--p', '100%');
      new ResizeObserver(function () { // only used for the label; the layout itself is pure CSS
        var w = box.clientWidth - 20;
        badge.textContent = w + 'px · ' + (w >= 360 ? t('wide', 'ancho') : w <= 200 ? t('compact', 'compacto') : t('stacked', 'apilado'));
      }).observe(box);
    }
  });

  demo({
    id: 'has', cat: 'web', title: 'The :has() selector', tags: ['CSS only', ':has()'],
    desc: 'A parent that styles itself from its children’s state. The summary and button react with zero JavaScript.',
    html: `
<form class="d-has" onsubmit="return false">
  <label class="d-has-plan"><input type="radio" name="d-has" id="d-has-s"> <b>Starter</b><span>$9</span></label>
  <label class="d-has-plan"><input type="radio" name="d-has" id="d-has-p"> <b>Pro</b><span>$29</span></label>
  <label class="d-has-plan"><input type="radio" name="d-has" id="d-has-t"> <b>Team</b><span>$79</span></label>
  <label class="d-has-add"><input type="checkbox" id="d-has-x"> {{Add priority support (+$15)|Añadir soporte prioritario (+$15)}}</label>
  <div class="d-has-foot">
    <span class="d-has-total"></span>
    <button class="btn btn-primary d-has-cta">{{Continue|Continuar}}</button>
  </div>
</form>`,
    css: `
.d-has{display:grid;gap:8px}
.d-has-plan{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border-strong);border-radius:10px;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s}
.d-has-plan span{margin-left:auto;font-weight:600}
.d-has input{accent-color:var(--magic)}
.d-has-plan:has(:checked){border-color:var(--magic);background:var(--magic-soft);box-shadow:0 0 0 1px var(--magic) inset}
.d-has-add{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--text-2);padding:4px 2px}
.d-has-foot{display:flex;justify-content:space-between;align-items:center;margin-top:4px}
.d-has-cta{opacity:.45;pointer-events:none;transition:opacity .2s}
.d-has:has(.d-has-plan :checked) .d-has-cta{opacity:1;pointer-events:auto}
.d-has-total::after{content:"{{Choose a plan|Elige un plan}}";color:var(--text-3)}
.d-has:has(#d-has-s:checked) .d-has-total::after{content:"Starter \\00b7  $9{{/mo|/mes}}";color:var(--text)}
.d-has:has(#d-has-p:checked) .d-has-total::after{content:"Pro \\00b7  $29{{/mo|/mes}}";color:var(--text)}
.d-has:has(#d-has-t:checked) .d-has-total::after{content:"Team \\00b7  $79{{/mo|/mes}}";color:var(--text)}
.d-has:has(#d-has-x:checked) .d-has-total::before{content:"{{Priority + |Prioritario + }}";font-weight:600;color:var(--magic)}
@supports not selector(:has(a)){.d-has-total::after{content:"{{Your browser does not support :has() yet|Tu navegador aún no admite :has()}}"}}`,
    js: null
  });

  demo({
    id: 'intl', cat: 'web', title: 'Internationalization', tags: ['Intl API', 'i18n'],
    desc: 'Dates, money, plurals and lists formatted correctly for each language by the browser’s Intl API.',
    html: `
<div class="d-intl">
  <div class="row between" style="margin-bottom:10px">
    <select class="select d-intl-loc" aria-label="{{Language|Idioma}}" style="width:auto">
      <option value="en-US">English (US)</option>
      <option value="es-ES">Espa&ntilde;ol (Espa&ntilde;a)</option>
      <option value="es-MX">Espa&ntilde;ol (M&eacute;xico)</option>
      <option value="fr-FR">Fran&ccedil;ais</option>
      <option value="de-DE">Deutsch</option>
      <option value="ja-JP">&#26085;&#26412;&#35486;</option>
    </select>
    <label class="sub row" style="gap:6px">{{Messages|Mensajes}} <input type="range" class="range d-intl-n" min="0" max="5" value="3" style="width:80px"></label>
  </div>
  <dl class="d-intl-out"></dl>
</div>`,
    css: `
.d-intl-out{display:grid;grid-template-columns:auto 1fr;border:1px solid var(--border);border-radius:10px;overflow:hidden}
.d-intl-out dt,.d-intl-out dd{padding:8px 12px;border-bottom:1px solid var(--border)}
.d-intl-out dt{color:var(--text-3);font-size:12px;font-weight:600;background:var(--surface-2)}
.d-intl-out dd{font-weight:550}
.d-intl-out :nth-last-child(-n+2){border-bottom:0}`,
    js: function (el, t) {
      if (t('en', 'es') === 'es') el.querySelector('.d-intl-loc').value = 'es-MX'; // start in Spanish on the Spanish site
      var currency = { 'en-US': 'USD', 'es-ES': 'EUR', 'es-MX': 'MXN', 'fr-FR': 'EUR', 'de-DE': 'EUR', 'ja-JP': 'JPY' };
      var messages = {
        en: { one: '# new message', other: '# new messages' },
        es: { one: '# mensaje nuevo', other: '# mensajes nuevos' },
        fr: { one: '# nouveau message', other: '# nouveaux messages' },
        de: { one: '# neue Nachricht', other: '# neue Nachrichten' },
        ja: { other: '新着メッセージ # 件' }
      };
      var loc = el.querySelector('.d-intl-loc'), count = el.querySelector('.d-intl-n'), out = el.querySelector('.d-intl-out');
      function render() {
        var l = loc.value, n = +count.value, now = new Date(), dict = messages[l.slice(0, 2)];
        count.style.setProperty('--p', n / 5 * 100 + '%');
        var rows = [
          [t('Date', 'Fecha'), new Intl.DateTimeFormat(l, { dateStyle: 'full' }).format(now)],
          [t('Relative', 'Relativa'), new Intl.RelativeTimeFormat(l, { numeric: 'auto' }).format(-1, 'day') + ' · ' + new Intl.RelativeTimeFormat(l).format(3, 'week')],
          [t('Price', 'Precio'), new Intl.NumberFormat(l, { style: 'currency', currency: currency[l] }).format(1234.5)],
          [t('Compact', 'Compacto'), new Intl.NumberFormat(l, { notation: 'compact' }).format(2450000)],
          ['Plural', (dict[new Intl.PluralRules(l).select(n)] || dict.other).replace('#', new Intl.NumberFormat(l).format(n))],
          [t('List', 'Lista'), new Intl.ListFormat(l, { type: 'conjunction' }).format(['HTML', 'CSS', 'JavaScript'])]
        ];
        out.innerHTML = '';
        out.lang = l;
        rows.forEach(function (r) {
          var dt = document.createElement('dt'), dd = document.createElement('dd');
          dt.textContent = r[0]; dd.textContent = r[1];
          out.append(dt, dd);
        });
      }
      loc.addEventListener('change', render);
      count.addEventListener('input', render);
      render();
    }
  });

  demo({
    id: 'popover', cat: 'web', title: 'Native popover & dialog', tags: ['HTML', 'Popover API', 'Anchor positioning'],
    desc: 'Menus and modals with built-in focus handling, Esc to close and enter/exit animations, using almost no JavaScript.',
    html: `
<div class="d-pop">
  <div class="row" style="justify-content:center">
    <button class="btn d-pop-btn" popovertarget="d-pop-menu">{{Actions|Acciones}} &#9662;</button>
    <button class="btn btn-critical d-pop-open">{{Delete draft|Eliminar borrador}}</button>
  </div>
  <div id="d-pop-menu" class="d-pop-menu" popover>
    <button popovertarget="d-pop-menu" popovertargetaction="hide">{{Edit|Editar}}</button>
    <button popovertarget="d-pop-menu" popovertargetaction="hide">{{Duplicate|Duplicar}}</button>
    <button popovertarget="d-pop-menu" popovertargetaction="hide">{{Share link|Compartir enlace}}</button>
  </div>
  <dialog class="d-pop-dialog">
    <form method="dialog">
      <h3>{{Delete this draft?|¿Eliminar este borrador?}}</h3>
      <p class="sub">{{A native &lt;dialog&gt;: focus is trapped, Esc closes it and the page behind is inert.|Un &lt;dialog&gt; nativo: el foco queda dentro, Esc lo cierra y la página de fondo queda inactiva.}}</p>
      <div class="row" style="justify-content:flex-end;margin-top:16px">
        <button class="btn" value="cancel">{{Cancel|Cancelar}}</button>
        <button class="btn btn-critical" value="delete">{{Delete|Eliminar}}</button>
      </div>
    </form>
  </dialog>
  <p class="sub d-pop-out" aria-live="polite">{{Nothing chosen yet.|Aún no has elegido nada.}}</p>
</div>`,
    css: `
.d-pop{display:grid;gap:14px;justify-items:center;padding:24px 0}
.d-pop-btn{anchor-name:--d-pop}
.d-pop-menu{border:0;padding:4px;border-radius:10px;min-width:170px;background:var(--surface);color:var(--text);box-shadow:var(--shadow-modal);
  opacity:0;transform:translateY(-6px) scale(.98);transition:opacity .18s,transform .18s,overlay .18s allow-discrete,display .18s allow-discrete}
.d-pop-menu:popover-open{opacity:1;transform:none}
@starting-style{.d-pop-menu:popover-open{opacity:0;transform:translateY(-6px) scale(.98)}}
@supports (anchor-name:--a){.d-pop-menu{position-anchor:--d-pop;inset:auto;top:anchor(bottom);left:anchor(left);margin:6px 0 0}}
.d-pop-menu button{display:block;width:100%;text-align:left;border:0;background:none;padding:8px 10px;border-radius:7px;cursor:pointer}
.d-pop-menu button:hover,.d-pop-menu button:focus-visible{background:var(--surface-3);outline:none}
.d-pop-dialog{margin:auto;border:0;border-radius:16px;padding:20px;max-width:360px;background:var(--surface);color:var(--text);box-shadow:var(--shadow-modal)}
.d-pop-dialog[open]{animation:d-pop-in .2s cubic-bezier(.2,.9,.3,1)}
.d-pop-dialog::backdrop{background:rgba(0,0,0,.4);backdrop-filter:blur(3px)}
@keyframes d-pop-in{from{opacity:0;transform:translateY(10px) scale(.97)}}`,
    js: function (el, t) {
      var out = el.querySelector('.d-pop-out'), dialog = el.querySelector('dialog');
      el.querySelectorAll('.d-pop-menu button').forEach(function (b) {
        b.addEventListener('click', function () { out.textContent = t('You picked "', 'Elegiste "') + b.textContent + t('" from the popover.', '" en el popover.'); });
      });
      el.querySelector('.d-pop-open').addEventListener('click', function () { dialog.showModal(); });
      dialog.addEventListener('close', function () {
        out.textContent = dialog.returnValue === 'delete' ? t('Draft deleted (not really, it is a demo).', 'Borrador eliminado (en realidad no, es una demo).') : t('Dialog closed without deleting.', 'Diálogo cerrado sin eliminar.');
        dialog.returnValue = '';
      });
      if (!HTMLElement.prototype.hasOwnProperty('popover')) out.textContent = t('Your browser does not support popovers yet; the dialog still works.', 'Tu navegador aún no admite popovers; el diálogo sí funciona.');
    }
  });

  demo({
    id: 'contrast', cat: 'web', title: 'Contrast checker', tags: ['Accessibility', 'WCAG 2.2'],
    desc: 'Checks any text and background pair against WCAG AA and AAA, using the official relative-luminance formula.',
    html: `
<div class="d-con">
  <div class="d-con-preview"><b>{{Readable text matters|Un texto legible importa}}</b><span>{{The quick brown fox jumps over the lazy dog.|El veloz murciélago hindú comía feliz cardillo y kiwi.}}</span></div>
  <div class="d-con-controls">
    <label><input type="color" name="fg" value="#5b5b5b"> {{Text|Texto}} <code class="d-con-fg"></code></label>
    <button class="btn btn-plain d-con-swap" aria-label="{{Swap colors|Intercambiar colores}}">&#8646;</button>
    <label><input type="color" name="bg" value="#f3eeff"> {{Background|Fondo}} <code class="d-con-bg"></code></label>
  </div>
  <div class="d-con-result">
    <b class="d-con-ratio"></b>
    <div class="row">
      <span class="badge" data-min="4.5">AA</span><span class="badge" data-min="3">{{AA large|AA grande}}</span><span class="badge" data-min="7">AAA</span>
    </div>
  </div>
</div>`,
    css: `
.d-con-preview{border-radius:10px;padding:16px;display:grid;gap:2px;border:1px solid var(--border)}
.d-con-preview b{font-size:18px}
.d-con-controls{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0;flex-wrap:wrap}
.d-con-controls label{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:550}
.d-con-controls input{width:32px;height:32px;border:0;padding:0;background:none;cursor:pointer}
.d-con-controls code{font-size:12px;color:var(--text-3)}
.d-con-result{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.d-con-ratio{font-size:26px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}`,
    js: function (el) {
      var fg = el.querySelector('[name=fg]'), bg = el.querySelector('[name=bg]'), preview = el.querySelector('.d-con-preview');
      function luminance(hex) {
        var c = [1, 3, 5].map(function (i) {
          var v = parseInt(hex.substr(i, 2), 16) / 255;
          return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
        });
        return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
      }
      function update() {
        var a = luminance(fg.value), b = luminance(bg.value);
        var ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        preview.style.color = fg.value; preview.style.background = bg.value;
        el.querySelector('.d-con-fg').textContent = fg.value.toUpperCase();
        el.querySelector('.d-con-bg').textContent = bg.value.toUpperCase();
        el.querySelector('.d-con-ratio').textContent = ratio.toFixed(2) + ':1';
        el.querySelectorAll('[data-min]').forEach(function (badge) {
          var pass = ratio >= +badge.dataset.min, name = badge.textContent.replace(/^[✓✕] /, '');
          badge.className = 'badge ' + (pass ? 'success' : 'critical');
          badge.textContent = (pass ? '✓ ' : '✕ ') + name;
        });
      }
      fg.addEventListener('input', update);
      bg.addEventListener('input', update);
      el.querySelector('.d-con-swap').addEventListener('click', function () { var t = fg.value; fg.value = bg.value; bg.value = t; update(); });
      update();
    }
  });

  demo({
    id: 'worker', cat: 'web', title: 'Web Worker vs main thread', tags: ['Performance', 'Web Workers'],
    desc: 'Run the same heavy job both ways and watch the ball: on the main thread the page freezes, in a worker it stays smooth.',
    html: `
<div class="d-ww">
  <div class="d-ww-track"><span class="d-ww-ball"></span></div>
  <div class="row" style="margin-top:12px">
    <button class="btn d-ww-main">{{Run on main thread|Ejecutar en el hilo principal}}</button>
    <button class="btn btn-primary d-ww-worker">{{Run in a worker|Ejecutar en un worker}}</button>
  </div>
  <p class="sub d-ww-out" aria-live="polite">{{Counts the prime numbers below 5 million.|Cuenta los números primos menores que 5 millones.}}</p>
</div>`,
    css: `
.d-ww-track{position:relative;height:44px;border-radius:22px;background:var(--surface-2);border:1px solid var(--border)}
.d-ww-ball{position:absolute;top:7px;left:7px;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--magic),var(--magic-2));box-shadow:0 4px 10px rgba(0,0,0,.2)}
.d-ww-out{margin-top:10px;min-height:40px}`,
    js: function (el, t) {
      var ball = el.querySelector('.d-ww-ball'), track = el.querySelector('.d-ww-track'), out = el.querySelector('.d-ww-out');
      var buttons = el.querySelectorAll('button'), LIMIT = 5e6, phase = 0, visible = false, running = false;
      function countPrimes(limit) {
        var n = 0;
        for (var i = 2; i < limit; i++) {
          var prime = true;
          for (var j = 2; j * j <= i; j++) if (i % j === 0) { prime = false; break; }
          if (prime) n++;
        }
        return n;
      }
      // The ball is moved by JavaScript on purpose: a CSS animation would keep running even when the main thread is blocked
      function frame() {
        phase += .03;
        ball.style.transform = 'translateX(' + (Math.sin(phase) + 1) / 2 * (track.clientWidth - 44) + 'px)';
        if (visible) requestAnimationFrame(frame); else running = false;
      }
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !running) { running = true; requestAnimationFrame(frame); }
      }).observe(track);
      function busy(on) { buttons.forEach(function (b) { b.disabled = on; }); }
      function report(where, n, ms) { out.innerHTML = '<b>' + where + ':</b> ' + n.toLocaleString(t('en-US', 'es')) + t(' primes in ', ' primos en ') + Math.round(ms) + ' ms.'; busy(false); }

      el.querySelector('.d-ww-main').addEventListener('click', function () {
        busy(true); out.textContent = t('Working on the main thread. Watch the ball freeze…', 'Trabajando en el hilo principal. Mira cómo se congela la bola…');
        setTimeout(function () { var t0 = performance.now(), n = countPrimes(LIMIT); report(t('Main thread', 'Hilo principal'), n, performance.now() - t0); }, 60);
      });
      el.querySelector('.d-ww-worker').addEventListener('click', function () {
        busy(true); out.textContent = t('Working in a background thread. The ball keeps moving…', 'Trabajando en un hilo en segundo plano. La bola sigue moviéndose…');
        var src = 'var countPrimes = ' + countPrimes.toString() + ';\nonmessage = function (e) { postMessage(countPrimes(e.data)); };';
        var url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        var worker = new Worker(url), t0 = performance.now();
        worker.onmessage = function (e) { report('Web Worker', e.data, performance.now() - t0); worker.terminate(); URL.revokeObjectURL(url); };
        worker.postMessage(LIMIT);
      });
    }
  });

  /* =====================================================================
     MINI APPS
     ===================================================================== */

  demo({
    id: 'palette', cat: 'apps', title: 'Palette generator', tags: ['Color theory', 'HSL'],
    desc: 'Harmonious palettes from real color rules. Lock the colors you like, press Space for more, copy as CSS variables.',
    html: `
<div class="d-pal" tabindex="0" aria-label="{{Palette generator. Press Space for a new palette.|Generador de paletas. Pulsa Espacio para una paleta nueva.}}">
  <div class="d-pal-row"></div>
  <div class="row between" style="margin-top:12px">
    <span class="badge magic d-pal-mode"></span>
    <div class="row">
      <button class="btn d-pal-copy">{{Copy CSS|Copiar CSS}}</button>
      <button class="btn btn-primary d-pal-gen">{{Generate|Generar}} <kbd>{{Space|Espacio}}</kbd></button>
    </div>
  </div>
</div>`,
    css: `
.d-pal{outline:none}
.d-pal-row{display:grid;grid-template-columns:repeat(5,1fr);height:150px;border-radius:12px;overflow:hidden}
.d-pal-sw{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;padding:10px 4px;transition:background .4s}
.d-pal-sw button{border:0;background:rgba(255,255,255,.18);color:inherit;border-radius:6px;font:600 11px/1 ui-monospace,Menlo,Consolas,monospace;padding:5px 6px;cursor:pointer}
.d-pal-sw .lock{font-size:14px;padding:4px 6px;opacity:.6}
.d-pal-sw .lock[aria-pressed="true"]{opacity:1;background:rgba(0,0,0,.2)}
.d-pal kbd{font:inherit;font-size:11px;opacity:.7;border:1px solid currentColor;border-radius:4px;padding:0 4px;margin-left:4px}
.d-pal:focus-visible .d-pal-row{outline:2px solid var(--magic);outline-offset:3px}`,
    js: function (el, t) {
      var row = el.querySelector('.d-pal-row'), mode = el.querySelector('.d-pal-mode'), colors = [], locked = [false, false, false, false, false];
      var names = { Analogous: t('Analogous', 'Análoga'), Complementary: t('Complementary', 'Complementaria'), Triadic: t('Triadic', 'Triádica'),
        'Split complementary': t('Split complementary', 'Complementaria dividida'), Monochrome: t('Monochrome', 'Monocromática') };
      var rules = {
        Analogous: [-40, -20, 0, 20, 40], Complementary: [0, 10, 0, 180, 190], Triadic: [0, 120, 0, 240, 120],
        'Split complementary': [0, 150, 0, 210, 30], Monochrome: [0, 0, 0, 0, 0]
      };
      function hex(h, s, l) {
        s /= 100; l /= 100;
        var a = s * Math.min(l, 1 - l);
        function f(n) { var k = (n + h / 30) % 12; return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255).toString(16).padStart(2, '0'); }
        return '#' + f(0) + f(8) + f(4);
      }
      function isLight(c) { var n = parseInt(c.slice(1), 16); return (.299 * (n >> 16) + .587 * (n >> 8 & 255) + .114 * (n & 255)) > 150; }
      row.innerHTML = locked.map(function (x, i) {
        return '<div class="d-pal-sw"><button class="lock" data-lock="' + i + '" aria-pressed="false" aria-label="' + t('Lock color ', 'Bloquear color ') + (i + 1) + '">&#128275;</button><button class="hex" data-copy="' + i + '"></button></div>';
      }).join('');
      var swatches = row.querySelectorAll('.d-pal-sw');
      function generate() {
        var names = Object.keys(rules), name = names[Math.floor(Math.random() * names.length)];
        var base = Math.random() * 360, sat = 55 + Math.random() * 30, light = [88, 70, 55, 38, 20];
        mode.textContent = names[name];
        rules[name].forEach(function (off, i) {
          if (!locked[i]) colors[i] = hex((base + off + 360) % 360, sat - (name === 'Monochrome' ? i * 4 : 0), light[i]);
          swatches[i].style.background = colors[i];
          swatches[i].style.color = isLight(colors[i]) ? '#1a1a1a' : '#fff';
          swatches[i].querySelector('.hex').textContent = colors[i].toUpperCase();
        });
      }
      el.addEventListener('click', function (e) {
        var lock = e.target.closest('[data-lock]'), copy = e.target.closest('[data-copy]');
        if (lock) { var i = +lock.dataset.lock; locked[i] = !locked[i]; lock.setAttribute('aria-pressed', locked[i]); lock.innerHTML = locked[i] ? '&#128274;' : '&#128275;'; }
        if (copy && window.yg) yg.copy(colors[+copy.dataset.copy].toUpperCase(), colors[+copy.dataset.copy].toUpperCase() + t(' copied', ' copiado'));
      });
      el.addEventListener('keydown', function (e) { if (e.code === 'Space' && e.target === el) { e.preventDefault(); generate(); } });
      el.querySelector('.d-pal-gen').addEventListener('click', generate);
      el.querySelector('.d-pal-copy').addEventListener('click', function () {
        var css = ':root {\n' + colors.map(function (c, i) { return '  --color-' + (i + 1) + '00: ' + c + ';'; }).join('\n') + '\n}';
        if (window.yg) yg.copy(css, t('Palette copied as CSS variables', 'Paleta copiada como variables CSS'));
      });
      generate();
    }
  });

  demo({
    id: 'gradient', cat: 'apps', title: 'Gradient builder', tags: ['CSS', 'Tool'],
    desc: 'Linear, radial and conic gradients with live preview and copy-ready CSS.',
    html: `
<div class="d-gr">
  <div class="d-gr-preview"></div>
  <div class="d-gr-controls">
    <select class="select d-gr-type" aria-label="{{Gradient type|Tipo de degradado}}"><option>linear</option><option>radial</option><option>conic</option></select>
    <input type="color" class="d-gr-c" value="#8051ff" aria-label="Color 1">
    <input type="color" class="d-gr-c" value="#2fb5e8" aria-label="Color 2">
    <input type="color" class="d-gr-c" value="#ff6fd8" aria-label="Color 3">
    <label class="sub d-gr-angle-wrap">{{Angle|Ángulo}} <input type="range" class="range d-gr-angle" min="0" max="360" value="135"></label>
  </div>
  <div class="d-gr-code"><code></code><button class="btn d-gr-copy">{{Copy|Copiar}}</button></div>
</div>`,
    css: `
.d-gr-preview{height:110px;border-radius:12px;transition:background .3s}
.d-gr-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}
.d-gr-controls .select{width:auto}
.d-gr-c{width:34px;height:34px;border:0;padding:0;background:none;cursor:pointer}
.d-gr-angle-wrap{display:flex;align-items:center;gap:8px;flex:1;min-width:140px}
.d-gr-code{display:flex;gap:8px;align-items:center;background:var(--surface-2);border-radius:10px;padding:6px 6px 6px 12px}
.d-gr-code code{flex:1;font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;color:var(--text-2);word-break:break-all}`,
    js: function (el, t) {
      var type = el.querySelector('.d-gr-type'), angle = el.querySelector('.d-gr-angle'), cols = el.querySelectorAll('.d-gr-c');
      var preview = el.querySelector('.d-gr-preview'), code = el.querySelector('code'), css = '';
      function update() {
        var c = [].map.call(cols, function (x) { return x.value; }), a = angle.value;
        var g = type.value === 'linear' ? 'linear-gradient(' + a + 'deg, ' + c.join(', ') + ')'
              : type.value === 'radial' ? 'radial-gradient(circle at 30% 30%, ' + c.join(', ') + ')'
              : 'conic-gradient(from ' + a + 'deg, ' + c.join(', ') + ', ' + c[0] + ')';
        css = 'background: ' + g + ';';
        preview.style.background = g;
        code.textContent = css;
        angle.disabled = type.value === 'radial';
        angle.style.setProperty('--p', a / 360 * 100 + '%');
      }
      el.addEventListener('input', update);
      el.querySelector('.d-gr-copy').addEventListener('click', function () { if (window.yg) yg.copy(css, t('CSS copied', 'CSS copiado')); });
      update();
    }
  });

  demo({
    id: 'markdown', cat: 'apps', wide: true, title: 'Markdown editor', tags: ['Parser', 'Security'],
    desc: 'A small Markdown parser written from scratch. It escapes HTML first, so pasted text can never run scripts.',
    html: `
<div class="d-md">
  <textarea class="textarea d-md-src" aria-label="{{Markdown source|Texto Markdown}}" spellcheck="false">{{## Project notes
Write in **Markdown** and see it *instantly*.

- Live preview as you type
- Safe: \`<script>\` tags show as text
- Links like [my GitHub](https://github.com/yainel)

> Simple tools, carefully built.

1. Draft
2. Review
3. Ship|## Notas del proyecto
Escribe en **Markdown** y míralo *al instante*.

- Vista previa mientras escribes
- Seguro: las etiquetas \`<script>\` se ven como texto
- Enlaces como [mi GitHub](https://github.com/yainel)

> Herramientas simples, hechas con cuidado.

1. Borrador
2. Revisión
3. Lanzamiento}}</textarea>
  <div class="d-md-out" aria-live="off"></div>
</div>
<div class="row between" style="margin-top:8px"><span class="sub d-md-stat"></span><button class="btn d-md-copy">{{Copy HTML|Copiar HTML}}</button></div>`,
    css: `
.d-md{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.d-md-src{height:240px;padding:12px;font:13px/1.55 ui-monospace,Menlo,Consolas,monospace;resize:none}
.d-md-out{height:240px;overflow:auto;padding:12px 16px;border-radius:var(--radius-sm);background:var(--surface-2);font-size:14px;line-height:1.55}
.d-md-out>*+*{margin-top:8px}
.d-md-out h1,.d-md-out h2,.d-md-out h3{line-height:1.25;letter-spacing:-.01em}
.d-md-out ul,.d-md-out ol{padding-left:20px}
.d-md-out blockquote{border-left:3px solid var(--magic);padding-left:12px;color:var(--text-2)}
.d-md-out code{font:12px ui-monospace,Menlo,Consolas,monospace;background:var(--surface-3);padding:1px 5px;border-radius:5px}
@media (max-width:640px){.d-md{grid-template-columns:1fr}}`,
    js: function (el, t) {
      var src = el.querySelector('.d-md-src'), out = el.querySelector('.d-md-out'), stat = el.querySelector('.d-md-stat');
      function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
      function inline(s) {
        return esc(s)
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>'); // only http(s) links
      }
      function parse(md) {
        var html = '', list = null, para = [];
        function flush() {
          if (para.length) { html += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; }
          if (list) { html += '</' + list + '>'; list = null; }
        }
        md.split('\n').forEach(function (line) {
          var m;
          if ((m = line.match(/^(#{1,3})\s+(.*)/))) { flush(); html += '<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'; }
          else if ((m = line.match(/^\s*([-*]|\d+\.)\s+(.*)/))) {
            var type = /\d/.test(m[1]) ? 'ol' : 'ul';
            if (para.length || list !== type) flush();
            if (!list) { html += '<' + type + '>'; list = type; }
            html += '<li>' + inline(m[2]) + '</li>';
          }
          else if ((m = line.match(/^>\s?(.*)/))) { flush(); html += '<blockquote>' + inline(m[1]) + '</blockquote>'; }
          else if (!line.trim()) flush();
          else { if (list) flush(); para.push(line); }
        });
        flush();
        return html;
      }
      function update() {
        out.innerHTML = parse(src.value);
        var words = (src.value.match(/\S+/g) || []).length;
        stat.textContent = words + t(' words · ', ' palabras · ') + Math.max(1, Math.round(words / 230)) + t(' min read', ' min de lectura');
      }
      src.addEventListener('input', update);
      el.querySelector('.d-md-copy').addEventListener('click', function () { if (window.yg) yg.copy(out.innerHTML, t('HTML copied', 'HTML copiado')); });
      update();
    }
  });

  demo({
    id: 'timer', cat: 'apps', title: 'Focus timer', tags: ['SVG', 'Timing'],
    desc: 'A Pomodoro timer that stays accurate even when the tab sleeps, because it measures the clock instead of counting ticks.',
    html: `
<div class="d-tm">
  <div class="segmented d-seg d-tm-modes" role="group" aria-label="{{Timer mode|Modo del temporizador}}">
    <button aria-pressed="true" data-min="25">{{Focus|Enfoque}}</button>
    <button aria-pressed="false" data-min="5">{{Short break|Pausa corta}}</button>
    <button aria-pressed="false" data-min="15">{{Long break|Pausa larga}}</button>
  </div>
  <div class="d-tm-ring">
    <svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/><circle class="val" cx="60" cy="60" r="52"/></svg>
    <div><b class="d-tm-time" role="timer">25:00</b><span class="sub d-tm-done">{{0 sessions done|0 sesiones hechas}}</span></div>
  </div>
  <div class="row" style="justify-content:center">
    <button class="btn btn-primary d-tm-go" style="min-width:90px">{{Start|Iniciar}}</button>
    <button class="btn d-tm-reset">{{Reset|Reiniciar}}</button>
    <button class="btn btn-plain d-tm-skip">{{Skip|Saltar}}</button>
  </div>
</div>`,
    css: `
.d-tm{display:grid;justify-items:center;gap:12px}
.d-tm-ring{position:relative;width:150px;height:150px;display:grid;place-items:center;text-align:center}
.d-tm-ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
.d-tm-ring circle{fill:none;stroke-width:8;stroke-linecap:round}
.d-tm-ring .track{stroke:var(--surface-3)}
.d-tm-ring .val{stroke:var(--magic);stroke-dasharray:326.7;transition:stroke-dashoffset .3s linear}
.d-tm-time{display:block;font-size:30px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}`,
    js: function (el, t) {
      var timeEl = el.querySelector('.d-tm-time'), ring = el.querySelector('.val'), go = el.querySelector('.d-tm-go'), doneEl = el.querySelector('.d-tm-done');
      var total = 25 * 60e3, left = total, endAt = 0, timer = 0, sessions = 0, C = 326.7;
      function show() {
        var s = Math.ceil(left / 1000);
        timeEl.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
        ring.style.strokeDashoffset = C * (1 - left / total);
      }
      function tick() {
        left = Math.max(0, endAt - Date.now()); // real time, so it stays right after the tab sleeps
        show();
        if (!left) finish();
      }
      function start() { endAt = Date.now() + left; timer = setInterval(tick, 250); go.textContent = t('Pause', 'Pausar'); }
      function pause() { clearInterval(timer); timer = 0; go.textContent = t('Start', 'Iniciar'); }
      function reset() { pause(); left = total; show(); }
      function finish() {
        pause(); sessions++;
        doneEl.textContent = sessions + (sessions === 1 ? t(' session done', ' sesión hecha') : t(' sessions done', ' sesiones hechas'));
        if (window.yg) { yg.toast(t('Time is up. Nice work.', 'Se acabó el tiempo. Buen trabajo.')); yg.confetti(); }
        left = total; show();
      }
      go.addEventListener('click', function () { timer ? pause() : start(); });
      el.querySelector('.d-tm-reset').addEventListener('click', reset);
      el.querySelector('.d-tm-skip').addEventListener('click', finish);
      el.querySelectorAll('[data-min]').forEach(function (b) {
        b.addEventListener('click', function () {
          el.querySelectorAll('[data-min]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          total = b.dataset.min * 60e3; reset();
        });
      });
      show();
    }
  });

  demo({
    id: 'filters', cat: 'apps', title: 'Photo filters', tags: ['CSS filters', 'File API'],
    desc: 'Adjust a photo with sliders or presets, hold to compare with the original, or load your own image (it never leaves your device).',
    html: `
<div class="d-fx">
  <div class="d-fx-view"><img class="d-fx-img" alt="{{Sample photo: palm tree at sunset|Foto de ejemplo: palmera al atardecer}}"></div>
  <div class="d-fx-sliders"></div>
  <div class="row">
    <button class="btn btn-plain" data-preset="vivid">{{Vivid|Vívido}}</button>
    <button class="btn btn-plain" data-preset="noir">Noir</button>
    <button class="btn btn-plain" data-preset="vintage">Vintage</button>
    <button class="btn btn-plain" data-preset="reset">{{Reset|Restablecer}}</button>
    <button class="btn d-fx-hold" style="margin-left:auto">{{Hold to compare|Mantén para comparar}}</button>
    <label class="btn">{{Your photo|Tu foto}}<input type="file" accept="image/*" class="sr d-fx-file"></label>
  </div>
</div>`,
    css: `
.d-fx-view{height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2)}
.d-fx-img{width:100%;height:100%;object-fit:cover}
.d-fx-sliders{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin:12px 0}
.d-fx-sliders label{display:grid;grid-template-columns:72px 1fr;align-items:center;gap:8px;font-size:12px;color:var(--text-2)}`,
    js: function (el, t) {
      var img = el.querySelector('img'), wrap = el.querySelector('.d-fx-sliders');
      var labels = t(['brightness', 'contrast', 'saturate', 'hue', 'sepia', 'blur'], ['brillo', 'contraste', 'saturación', 'tono', 'sepia', 'desenfoque']);
      var scene = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><defs><linearGradient id="s" x2="0" y2="1"><stop offset="0" stop-color="#ff9a8b"/><stop offset=".6" stop-color="#ffd3a5"/></linearGradient></defs>' +
        '<rect width="400" height="200" fill="url(#s)"/><circle cx="290" cy="110" r="34" fill="#fff3c4"/>' +
        '<path d="M0 140 Q80 100 160 130 T320 120 T400 115 V200 H0Z" fill="#e2725b"/><path d="M0 170 Q100 135 200 165 T400 155 V200 H0Z" fill="#2e7d6b"/>' +
        '<path d="M70 200 Q66 150 74 112 M74 112 q-24 -12 -42 2 M74 112 q22 -16 44 -4 M74 113 q-6 -24 -28 -30 M74 113 q10 -26 34 -26" stroke="#1d3b34" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
      img.src = 'data:image/svg+xml,' + encodeURIComponent(scene);
      var defs = [['brightness', 0, 200, 100, '%'], ['contrast', 0, 200, 100, '%'], ['saturate', 0, 300, 100, '%'], ['hue-rotate', 0, 360, 0, 'deg'], ['sepia', 0, 100, 0, '%'], ['blur', 0, 8, 0, 'px']];
      var presets = { vivid: [110, 120, 170, 0, 0, 0], noir: [105, 140, 0, 0, 0, 0], vintage: [105, 90, 80, 340, 45, 0], reset: [100, 100, 100, 0, 0, 0] };
      wrap.innerHTML = defs.map(function (d, i) {
        return '<label>' + labels[i] + '<input type="range" class="range" min="' + d[1] + '" max="' + d[2] + '" value="' + d[3] + '"></label>';
      }).join('');
      var ranges = wrap.querySelectorAll('input');
      function update() {
        img.style.filter = [].map.call(ranges, function (r, i) {
          r.style.setProperty('--p', (r.value - r.min) / (r.max - r.min) * 100 + '%');
          return defs[i][0] + '(' + r.value + defs[i][4] + ')';
        }).join(' ');
      }
      wrap.addEventListener('input', update);
      el.addEventListener('click', function (e) {
        var p = e.target.closest('[data-preset]');
        if (p) { presets[p.dataset.preset].forEach(function (v, i) { ranges[i].value = v; }); update(); }
      });
      var hold = el.querySelector('.d-fx-hold'), saved = '';
      hold.addEventListener('pointerdown', function () { saved = img.style.filter; img.style.filter = 'none'; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hold.addEventListener(ev, function () { if (saved) { img.style.filter = saved; saved = ''; } }); });
      el.querySelector('.d-fx-file').addEventListener('change', function () {
        if (this.files[0]) img.src = URL.createObjectURL(this.files[0]); // local preview only, nothing is uploaded
      });
      update();
    }
  });

  demo({
    id: 'signature', cat: 'apps', wide: true, title: 'Signature pad', tags: ['Canvas', 'Pointer pressure'],
    desc: 'Smooth, pressure-aware ink with undo and PNG export. The same idea powers the consent platform I built.',
    html: `
<div class="d-sig">
  <canvas class="d-sig-pad" aria-label="{{Signature area. Draw with a mouse, finger or stylus.|Área de firma. Dibuja con el ratón, el dedo o un lápiz.}}"></canvas>
  <div class="row" style="margin-top:10px">
    <button class="btn d-sig-undo">{{Undo|Deshacer}}</button>
    <button class="btn d-sig-clear">{{Clear|Borrar}}</button>
    <button class="btn btn-primary d-sig-save" style="margin-left:auto">{{Download PNG|Descargar PNG}}</button>
  </div>
</div>`,
    css: `
.d-sig-pad{width:100%;height:170px;display:block;border-radius:12px;background:var(--surface-2);touch-action:none;cursor:crosshair;
  background-image:linear-gradient(var(--border-strong),var(--border-strong));background-size:calc(100% - 48px) 1px;background-position:24px 75%;background-repeat:no-repeat}`,
    js: function (el, t) {
      var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), strokes = [], cur = null, dpr = Math.min(2, window.devicePixelRatio || 1);
      function ink() { return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#303030'; }
      function size() { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; redraw(); }
      function drawStroke(ctx, s, color) {
        ctx.strokeStyle = color; ctx.lineCap = ctx.lineJoin = 'round';
        for (var i = 1; i < s.length; i++) { // midpoint curves give a smooth line
          var a = s[i - 1], b = s[i], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          ctx.lineWidth = b.w;
          ctx.beginPath(); ctx.moveTo(a.mx || a.x, a.my || a.y); ctx.quadraticCurveTo(a.x, a.y, m.x, m.y); ctx.stroke();
          b.mx = m.x; b.my = m.y;
        }
      }
      function redraw() {
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.clearRect(0, 0, cv.width, cv.height);
        var c = ink();
        strokes.forEach(function (s) { drawStroke(cx, s, c); });
      }
      function point(e, prev) {
        var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        var speed = prev ? Math.hypot(x - prev.x, y - prev.y) : 0;
        var w = e.pressure && e.pointerType === 'pen' ? 1 + e.pressure * 3 : Math.max(1.2, 3.4 - speed * .12); // faster = thinner, like real ink
        if (prev) w = prev.w * .6 + w * .4;
        return { x: x, y: y, w: w };
      }
      cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); cur = [point(e)]; strokes.push(cur); });
      cv.addEventListener('pointermove', function (e) {
        if (!cur) return;
        cur.push(point(e, cur[cur.length - 1]));
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawStroke(cx, cur.slice(-2), ink());
      });
      ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { cur = null; }); });
      el.querySelector('.d-sig-undo').addEventListener('click', function () { strokes.pop(); redraw(); });
      el.querySelector('.d-sig-clear').addEventListener('click', function () { strokes = []; redraw(); });
      el.querySelector('.d-sig-save').addEventListener('click', function () {
        if (!strokes.length) { if (window.yg) yg.toast(t('Sign first, then download', 'Firma primero y luego descarga'), true); return; }
        var out = document.createElement('canvas'), o = out.getContext('2d');
        out.width = cv.width; out.height = cv.height;
        o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height);
        o.setTransform(dpr, 0, 0, dpr, 0, 0);
        strokes.forEach(function (s) { drawStroke(o, s, '#1a1a1a'); });
        var a = document.createElement('a');
        a.href = out.toDataURL('image/png'); a.download = t('signature.png', 'firma.png'); a.click();
      });
      new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); // re-ink on theme change
      new ResizeObserver(size).observe(cv);
    }
  });

  /* =====================================================================
     Rendering, lazy start, filter and code viewer
     ===================================================================== */

  var root = document.getElementById('pgRoot');
  var style = document.createElement('style');
  style.id = 'pg-demos';
  style.textContent = demos.map(function (d) { return loc(d.css); }).join('\n');
  document.head.appendChild(style);

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var byId = {};
  groups.forEach(function (g) {
    var items = demos.filter(function (d) { return d.cat === g.id; });
    var wrap = document.createElement('div');
    wrap.className = 'pg-group'; wrap.id = 'pg-' + g.id; wrap.dataset.cat = g.id;
    wrap.innerHTML = '<div class="pg-group-head"><h3>' + esc(T(g.t)) + ' <span class="badge">' + items.length + '</span></h3><p>' + esc(T(g.p)) + '</p></div><div class="pg-grid"></div>';
    var grid = wrap.querySelector('.pg-grid');
    items.forEach(function (d) {
      byId[d.id] = d;
      var card = document.createElement('article');
      card.className = 'card pg-card reveal' + (d.wide ? ' wide' : '');
      card.id = 'demo-' + d.id;
      card.dataset.search = [d.title, d.desc, d.tags.join(' '), g.t, T(d.title), T(d.desc), d.tags.map(function (x) { return T(x); }).join(' '), T(g.t)].join(' ').toLowerCase(); // finds a demo in either language
      card.innerHTML =
        '<div class="pg-head"><h3>' + esc(T(d.title)) + '</h3><div class="pg-tags">' + d.tags.map(function (x) { return '<span class="badge">' + esc(T(x)) + '</span>'; }).join('') + '</div></div>' +
        '<p class="pg-desc">' + esc(T(d.desc)) + '</p>' +
        '<div class="pg-stage"></div>' +
        '<div class="pg-foot"><button class="btn btn-plain pg-code" data-code="' + d.id + '"><svg width="16" height="16" viewBox="0 0 20 20"><path fill="currentColor" d="M7.3 5.3a.8.8 0 0 1 0 1.1L3.7 10l3.6 3.6a.8.8 0 1 1-1.1 1.1L2.1 10.5a.8.8 0 0 1 0-1l4.1-4.2a.8.8 0 0 1 1.1 0Zm5.4 0a.8.8 0 0 1 1.1 0l4.1 4.2c.3.3.3.7 0 1l-4.1 4.2a.8.8 0 1 1-1.1-1.1l3.6-3.6-3.6-3.6a.8.8 0 0 1 0-1.1Z"/></svg>' + T('View code') + '</button></div>';
      card.querySelector('.pg-stage').innerHTML = loc(d.html).trim();
      grid.appendChild(card);
      if (yg) yg.reveal(card);
    });
    root.appendChild(wrap);
  });

  // Start each demo only when it comes near the screen, so the page loads fast
  var starter = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      starter.unobserve(en.target);
      var d = byId[en.target.id.slice(5)];
      if (!d.js) return;
      try { d.js(en.target.querySelector('.pg-stage'), t); }
      catch (err) {
        console.error(d.id, err);
        en.target.querySelector('.pg-stage').insertAdjacentHTML('beforeend', '<p class="sub">' + T('This demo needs a newer browser.') + '</p>');
      }
    });
  }, { rootMargin: '300px 0px' });
  root.querySelectorAll('.pg-card').forEach(function (c) { starter.observe(c); });

  // Filter and search
  var cat = 'all', search = document.getElementById('pgSearch'), empty = document.getElementById('pgEmpty');
  function applyFilter() {
    var q = search.value.trim().toLowerCase(), any = false;
    root.querySelectorAll('.pg-group').forEach(function (g) {
      var shown = 0;
      g.querySelectorAll('.pg-card').forEach(function (c) {
        var ok = (cat === 'all' || g.dataset.cat === cat) && (!q || c.dataset.search.indexOf(q) > -1);
        c.hidden = !ok; if (ok) { shown++; c.classList.add('in'); }
      });
      g.hidden = !shown; any = any || shown > 0;
    });
    empty.hidden = any;
  }
  var seg = yg ? yg.segmented(document.getElementById('pgFilter'), function (b) { cat = b.dataset.f; applyFilter(); }) : null;
  search.addEventListener('input', applyFilter);
  document.getElementById('pgClear').addEventListener('click', function () { search.value = ''; if (seg) seg.reset(); applyFilter(); });
  function showAll() { if (cat !== 'all' || search.value) { search.value = ''; if (seg) seg.reset(); applyFilter(); } }
  document.querySelectorAll('[data-pg-link]').forEach(function (a) { a.addEventListener('click', showAll); });
  document.getElementById('pgCount').textContent = demos.length;
  document.querySelectorAll('[data-pg-total]').forEach(function (n) { n.textContent = demos.length; });

  /* ---------- Code viewer ---------- */
  function dedent(s) {
    var lines = s.replace(/^\n+|\s+$/g, '').split('\n'), min = Infinity;
    lines.slice(1).forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    if (!isFinite(min)) min = 0;
    return lines.map(function (l, i) { return i ? l.slice(min) : l; }).join('\n');
  }
  // A tiny highlighter: one regex per language, each capture group maps to a color class
  var syntax = {
    html: [/(<!--[\s\S]*?-->)|(<\/?[\w-]+|\/?>)|([\w:-]+)(?==)|("[^"]*")/g, ['c', 't', 'a', 's']],
    css: [/(\/\*[\s\S]*?\*\/)|(@[\w-]+)|("[^"]*")|([\w-]+)(?=\s*:[^;{}]*[;}])|(#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|%|s|ms|deg|fr|em|rem|vh|vw)?\b)/g, ['c', 'k', 's', 'p', 'n']],
    js: [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(function|var|return|if|else|for|new|this|true|false|null|typeof|break|while)\b|\b(\d+\.?\d*(?:e\d+)?)\b/g, ['c', 's', 'k', 'n']]
  };
  function highlight(code, lang) {
    var re = syntax[lang][0], cls = syntax[lang][1], out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(code))) {
      if (!m[0]) { re.lastIndex++; continue; }
      out += esc(code.slice(last, m.index));
      for (var g = 1; g < m.length; g++) if (m[g] !== undefined) { out += '<span class="t-' + cls[g - 1] + '">' + esc(m[0]) + '</span>'; break; }
      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last));
  }

  var modal = document.getElementById('codeModal'), codeEl = document.getElementById('cmCode'), note = document.getElementById('cmNote');
  var tabs = [].slice.call(modal.querySelectorAll('[role=tab]')), current = null, lang = 'html';
  function source(d, l) {
    if (l === 'html') return dedent(loc(d.html));
    if (l === 'css') return dedent(loc(d.css));
    return d.js ? dedent(d.js.toString()) : '';
  }
  function showLang(l, focusTab) {
    lang = l;
    tabs.forEach(function (t) {
      var on = t.dataset.lang === l;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on && focusTab) t.focus();
    });
    var src = source(current, l);
    codeEl.innerHTML = src ? highlight(src, l) : '<span class="t-c">' + T('// No JavaScript needed. This one is pure HTML and CSS.') + '</span>';
    var lines = src ? src.split('\n').length : 0;
    note.textContent = lines ? T('{n} lines of {l}', { n: lines, l: l.toUpperCase() }) : T('Zero JavaScript');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-code]');
    if (!b) return;
    current = byId[b.dataset.code];
    document.getElementById('cmTitle').textContent = T(current.title);
    showLang('html');
    yg.openOverlay(modal);
  });
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showLang(t.dataset.lang); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) showLang(tabs[(i + n + tabs.length) % tabs.length].dataset.lang, true);
    });
  });
  document.getElementById('cmCopy').addEventListener('click', function () {
    var src = source(current, lang);
    if (src) yg.copy(src, T('{l} copied to clipboard', { l: lang.toUpperCase() }));
  });

  /* ---------- Quick actions ---------- */
  if (yg) {
    demos.forEach(function (d) {
      yg.commands.push({ g: 'Playground', t: T(d.title), run: function () {
        showAll();
        location.hash = ''; location.hash = 'demo-' + d.id;
        var card = document.getElementById('demo-' + d.id);
        card.classList.remove('pg-flash'); void card.offsetWidth; card.classList.add('pg-flash');
      } });
    });
  }
})();
