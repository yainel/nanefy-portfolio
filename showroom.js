/* Showroom interactions. Plain JavaScript, no dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = window.ygT || function (s) { return s; }, spanish = window.ygLang === 'es'; // from i18n.js
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Toasts ---------- */
  function toast(msg, err) {
    var t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = '<span></span><button aria-label="' + T('Dismiss') + '">×</button>';
    t.firstChild.textContent = T(msg);
    $('#toasts').appendChild(t);
    var kill = function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 250); };
    t.lastChild.onclick = kill;
    setTimeout(kill, 3200);
  }
  $$('[data-toast]').forEach(function (b) { b.addEventListener('click', function () { toast(b.dataset.toast, b.hasAttribute('data-err')); }); });

  /* ---------- Sound ---------- */
  var actx = null;
  function tick() {
    if (!$('#soundSwitch').checked) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(.06, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + .08);
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + .09);
    } catch (e) {}
  }

  /* ---------- Ripple on every button ---------- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn');
    if (!b || b.disabled) return;
    tick();
    if (reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    var c = document.createElement('span');
    c.className = 'ripple';
    c.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(c);
    setTimeout(function () { c.remove(); }, 600);
  });

  /* ---------- Theme ---------- */
  function setTheme(t) {
    root.dataset.theme = t;
    store('yg-theme', t);
    $('#themeBtn use').setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
    $('#darkSwitch').checked = t === 'dark';
  }
  setTheme(root.dataset.theme || 'light');
  $('#themeBtn').addEventListener('click', function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); });
  $('#darkSwitch').addEventListener('change', function (e) { setTheme(e.target.checked ? 'dark' : 'light'); });

  /* ---------- Accent color ---------- */
  function setAccent(c) {
    root.style.setProperty('--magic', c);
    store('yg-accent', c);
    $$('#swatches button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === c ? 'true' : 'false'); });
  }
  var savedAccent = store('yg-accent');
  if (savedAccent) setAccent(savedAccent);
  $$('#swatches button').forEach(function (b) { b.addEventListener('click', function () { setAccent(b.dataset.c); toast('Accent color updated'); }); });

  /* ---------- Sidebar (mobile) and scroll spy ---------- */
  var menuBtn = $('#menuBtn');
  function nav(open) { document.body.classList.toggle('nav-open', open); menuBtn.setAttribute('aria-expanded', open); }
  menuBtn.addEventListener('click', function () { nav(!document.body.classList.contains('nav-open')); });
  $('#scrim').addEventListener('click', function () { nav(false); });
  $$('.sidebar a').forEach(function (a) { a.addEventListener('click', function () { nav(false); }); });
  var sections = $$('main .section');
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      $$('.sidebar .nav-item').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  var rev = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
  }, { threshold: .08 });
  $$('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; rev.observe(el); });

  /* ---------- Greeting, clock, typing ---------- */
  var h = new Date().getHours();
  $('#greet').textContent = T((h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', thanks for stopping by');
  function clock() {
    try { $('#localTime').textContent = T('{t} in Miami', { t: new Date().toLocaleTimeString(spanish ? 'es-US' : 'en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) }); } catch (e) {}
  }
  clock(); setInterval(clock, 30000);
  var words = ['interfaces', 'animations', 'design systems', 'web apps'].map(function (w) { return T(w); });
  $('.typed-ghost').textContent = words.reduce(function (a, b) { return b.length > a.length ? b : a; });
  var typed = $('#typed'), wi = 0, ci = words[0].length, del = true;
  function type() {
    var w = words[wi];
    if (del) { ci--; if (ci === 0) { del = false; wi = (wi + 1) % words.length; } }
    else { ci++; if (ci === words[wi].length) { del = true; typed.textContent = words[wi]; return setTimeout(type, 1800); } }
    typed.textContent = words[wi].slice(0, ci) || '​';
    setTimeout(type, del ? 45 : 85);
  }
  if (!reduce) setTimeout(type, 2200);

  /* ---------- Copy email ---------- */
  $('#copyEmail').addEventListener('click', function (e) {
    e.preventDefault();
    copy('garcia.yainel@gmail.com', 'Email copied to clipboard');
  });
  function copy(text, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { toast(text); });
    else toast(text);
  }

  /* ---------- Count-up stats ---------- */
  var counted = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null;
      counted.unobserve(el);
      if (reduce) { el.textContent = end + suf; return; }
      requestAnimationFrame(function step(t) {
        t0 = t0 || t; var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e) + suf;
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach(function (el) { counted.observe(el); });

  /* ---------- Ask about me ---------- */
  var answers = [
    { k: ['best', 'good at', 'strength', 'special', 'mejor', 'fuerte'], a: "Taking a messy, stressful process and turning it into a calm interface people actually enjoy using. Then building it so it works exactly as designed." },
    { k: ['tool', 'figma', 'software', 'adobe', 'use', 'herramienta'], a: 'Figma, Adobe XD and Photoshop for design. HTML, CSS, JavaScript, React, WordPress and Laravel to build.' },
    { k: ['code', 'build', 'develop', 'program', 'código', 'codigo', 'desarroll', 'constru'], a: "Yes. I'm a designer who codes. Everything on this page is hand-built by me, and every demo in the Skills playground has a View code button so you can read the source." },
    { k: ['work', 'portfolio', 'project', 'see', 'example', 'skill', 'demo', 'habilidad', 'trabajo', 'proyecto', 'ejemplo', 'portafolio'], a: 'Start with the Skills playground just below: live demos of motion, UI patterns, modern CSS and browser APIs, and small apps. Selected client work is further down, and I can walk you through private projects on a call.' },
    { k: ['process', 'approach', 'how do you', 'proceso', 'cómo trabajas'], a: 'Listen first, then structure (grid, type scale, content order), then refine the details, then build. Desktop and mobile get designed side by side.' },
    { k: ['spanish', 'language', 'english', 'french', 'español', 'idioma', 'inglés', 'francés'], a: 'Spanish is my first language, I work in English every day, and I know some French.' },
    { k: ['where', 'location', 'miami', 'remote', 'based', 'dónde', 'donde', 'remoto'], a: "I'm in Miami and happy to work remote, hybrid or on site." },
    { k: ['hire', 'available', 'freelance', 'contact', 'email', 'price', 'cost', 'rate', 'contrat', 'disponib', 'precio', 'costo', 'tarifa', 'correo', 'contacto'], a: "I'm available for freelance and full-time work. The quickest way to start is the Start a project form at the bottom of the page." }
  ];
  function answer(q) {
    var l = q.toLowerCase(), hit = null;
    answers.forEach(function (x) { if (!hit && x.k.some(function (k) { return l.indexOf(k) > -1; })) hit = T(x.a); });
    return hit || T("Good question. That one is better answered in person, so send it through the Start a project form and I'll reply within a day.");
  }
  function ask(q) {
    if (!q.trim()) return;
    var log = $('#askLog');
    log.innerHTML = '<div class="q"></div><div class="a"><span class="sk" style="display:inline-block;width:120px;height:10px"></span></div>';
    log.firstChild.textContent = q;
    var text = answer(q), a = log.lastChild, i = 0;
    setTimeout(function () {
      a.textContent = '';
      if (reduce) { a.textContent = text; return; }
      (function go() { a.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(go, 12); })();
    }, 500);
  }
  $('#askForm').addEventListener('submit', function (e) { e.preventDefault(); ask($('#askInput').value); $('#askInput').value = ''; });
  $$('#suggest button').forEach(function (b) { b.addEventListener('click', function () { ask(b.textContent); }); });

  /* ---------- Segmented controls ---------- */
  function segmented(el, onChange) {
    var thumb = $('.thumb', el), btns = $$('button', el);
    function place(b) { thumb.style.left = b.offsetLeft + 'px'; thumb.style.width = b.offsetWidth + 'px'; }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        place(b); onChange(b);
      });
    });
    var cur = function () { return btns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0]; };
    requestAnimationFrame(function () { place(cur()); });
    window.addEventListener('resize', function () { place(cur()); });
    document.fonts && document.fonts.ready.then(function () { place(cur()); });
    return { reset: function () { btns[0].click(); } };
  }

  /* ---------- Selected work: tilt, modal ---------- */
  var cards = $$('.project');
  cards.forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      if (!$('#motionSwitch').checked || reduce || e.pointerType !== 'mouse') return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--x', x * 100 + '%'); c.style.setProperty('--y', y * 100 + '%');
      c.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 6) + 'deg) rotateY(' + ((x - .5) * 6) + 'deg) translateY(-2px)';
    });
    c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    c.addEventListener('click', function () { openProject(c.dataset.id); });
  });

  var projects = {
    palma: {
      es: {
        t: 'Palma Alta, concepto de hotel boutique',
        b: '<p>Un concepto de sitio web, por iniciativa propia, para un hotel de catorce habitaciones en una casa restaurada de 1926 en Coral Gables.</p><h4>Mi papel</h4><ul><li>Dirección de marca, diseño de interfaz y maquetas adaptables</li><li>Front end escrito a mano en HTML y CSS</li></ul><h4>Pensamiento de diseño</h4><ul><li>El arco, la forma emblemática de Coral Gables, es el único elemento audaz; todo lo demás se mantiene sereno</li><li>Una paleta tomada del lugar: verdes de banyan, rosas de piedra coralina y latón de las rejas de hierro</li></ul><h4>Reto resuelto</h4><ul><li>Mantener visible la reserva sin romper el ambiente. En móviles pasa a una barra fina al alcance del pulgar</li></ul>',
        f: '<a class="btn" href="work/palma-alta.html">Leer el caso de estudio</a><a class="btn btn-primary" href="palma-alta/index.html">Abrir el sitio</a>'
      },
      t: 'Palma Alta, boutique hotel concept',
      b: '<p>A self-initiated website concept for a fourteen-room hotel inside a restored 1926 house in Coral Gables.</p><h4>My role</h4><ul><li>Brand direction, UI design and responsive layouts</li><li>Front-end build in hand-written HTML and CSS</li></ul><h4>Design thinking</h4><ul><li>The arch, the signature shape of Coral Gables, is the one bold element; everything else stays quiet</li><li>A palette taken from the place: banyan greens, coral rock pinks, brass from the iron gates</li></ul><h4>Challenge solved</h4><ul><li>Keeping the booking path visible without breaking the mood. On phones it moves into a slim bar within thumb reach</li></ul>',
      f: '<a class="btn" href="work/palma-alta.html">Read case study</a><a class="btn btn-primary" href="palma-alta/index.html">Open live site</a>'
    },
    consent: {
      es: {
        t: 'Plataforma de consentimiento de pacientes',
        b: '<p>Una aplicación web que reemplazó los formularios de consentimiento en papel en una clínica quirúrgica con varios especialistas. Es privada, así que muestro pantallas con datos de ejemplo si me lo pides.</p><h4>Mi papel</h4><ul><li>Único diseñador y desarrollador, de la UX a producción, en más de 16 versiones</li></ul><h4>Pensamiento de diseño</h4><ul><li>Dos públicos, dos experiencias: un flujo de firma tranquilo, paso a paso, para pacientes nerviosos, y una consola rápida para un personal ocupado</li><li>Ilustraciones de cada procedimiento para que los pacientes reconozcan su cirugía de un vistazo</li><li>Una vista de dos paneles donde la lista de pacientes sigue visible mientras aparecen los detalles</li></ul><h4>Retos resueltos</h4><ul><li>Mantener los registros de pacientes sincronizados en tiempo real con el CRM y las herramientas de formularios</li><li>Un registro de auditoría con filtros por día, semana y año, para tener constancia de cada firma</li><li>Permisos y manejo de datos que respetan la privacidad médica</li></ul>',
        f: '<a class="btn btn-primary" href="#contact" data-close>Pedir una demostración</a>'
      },
      t: 'Patient consent platform',
      b: '<p>A web application that replaced paper consent forms at a multi-provider surgical practice. It is private, so I share screens with sample data on request.</p><h4>My role</h4><ul><li>Sole designer and developer, from UX to production, across 16+ releases</li></ul><h4>Design thinking</h4><ul><li>Two audiences, two experiences: a calm step-by-step signing flow for nervous patients, and a fast console for busy staff</li><li>Procedure illustrations as visual cues so patients recognize their surgery at a glance</li><li>A two-panel staff layout where the patient list stays in view while details slide in</li></ul><h4>Challenges solved</h4><ul><li>Keeping patient records in sync with the CRM and form tools in real time</li><li>An audit log with day, week and year filters for a clear record of every signature</li><li>Permissions and data handling that respect healthcare privacy</li></ul>',
      f: '<a class="btn btn-primary" href="#contact" data-close>Ask for a walkthrough</a>'
    },
    golf: {
      es: {
        t: 'Golf Mapify',
        b: '<p>Una app de golf, en desarrollo, con dos partes que trabajan juntas.</p><h4>Cómo funciona</h4><ul><li>Un panel interno para mapear campos de golf reales, hoyo por hoyo</li><li>Una app para iPhone y Android que sabe en qué hoyo estás por tu ubicación y te pide el resultado</li></ul><h4>Enfoque de diseño</h4><ul><li>Pantallas grandes y fáciles de leer, que funcionan a pleno sol y con una sola mano</li></ul>',
        f: '<a class="btn" href="#contact" data-close>Preguntar por el proyecto</a>'
      },
      t: 'Golf Mapify',
      b: '<p>A golf app, currently in development, with two parts that work together.</p><h4>How it works</h4><ul><li>A back office for mapping real golf courses, hole by hole</li><li>A player app for iPhone and Android that knows which hole you are on from your location, and asks for your score</li></ul><h4>Design focus</h4><ul><li>Big, glanceable screens that work in bright sun with one hand</li></ul>',
      f: '<a class="btn" href="#contact" data-close>Ask about it</a>'
    }
  };

  var lastFocus = null;
  function openOverlay(o) { lastFocus = document.activeElement; o.classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(function () { var f = $('input,button,a', o); f && f.focus(); }, 50); }
  function closeOverlay(o) { o.classList.remove('open'); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
  function openProject(id) {
    var p = projects[id]; if (!p) return;
    if (spanish) p = p.es;
    $('#pmTitle').textContent = p.t; $('#pmBody').innerHTML = p.b; $('#pmFoot').innerHTML = p.f;
    openOverlay($('#projModal'));
  }
  $$('.overlay').forEach(function (o) {
    o.addEventListener('click', function (e) {
      if (e.target === o || e.target.closest('[data-close]')) closeOverlay(o);
    });
  });

  /* ---------- Command palette ---------- */
  var pal = $('#palette'), palInput = $('#palInput'), palList = $('#palList'), sel = 0, shown = [];
  var go = function (h) { return function () { location.hash = ''; location.hash = h; }; };
  var commands = [
    { g: 'Go to', t: 'Home', run: go('#home') },
    { g: 'Go to', t: 'Skills playground', run: go('#playground') },
    { g: 'Go to', t: 'UI kit', run: go('#lab') },
    { g: 'Go to', t: 'Selected work', run: go('#projects') },
    { g: 'Go to', t: 'Experience', run: go('#experience') },
    { g: 'Go to', t: 'Start a project', run: go('#contact') },
    { g: 'Selected work', t: 'Palma Alta hotel concept', run: function () { openProject('palma'); } },
    { g: 'Selected work', t: 'Patient consent platform', run: function () { openProject('consent'); } },
    { g: 'Selected work', t: 'Golf Mapify', run: function () { openProject('golf'); } },
    { g: 'Actions', t: 'Toggle dark mode', k: 'D', run: function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); } },
    { g: 'Actions', t: 'Copy email address', run: function () { copy('garcia.yainel@gmail.com', 'Email copied to clipboard'); } },
    { g: 'Actions', t: 'Celebrate', run: function () { confetti(); } },
    { g: 'Actions', t: spanish ? 'Switch to English' : 'Cambiar a español', run: function () { window.ygSetLang(spanish ? 'en' : 'es'); } },
    { g: 'Actions', t: 'Open the Palma Alta live site', run: function () { location.href = 'palma-alta/index.html'; } }
  ];
  function renderPal() {
    var q = palInput.value.trim().toLowerCase(), html = '', last = '';
    shown = commands.filter(function (c) { return !q || (T(c.g) + ' ' + T(c.t) + ' ' + c.g + ' ' + c.t).toLowerCase().indexOf(q) > -1; });
    if (sel >= shown.length) sel = 0;
    shown.forEach(function (c, i) {
      if (c.g !== last) { html += '<li class="group" role="presentation">' + T(c.g) + '</li>'; last = c.g; }
      html += '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '">' + T(c.t) + (c.k ? '<small><kbd>' + c.k + '</kbd></small>' : '') + '</li>';
    });
    palList.innerHTML = html || '<li class="group">' + T('No results. Try "playground" or "dark".') + '</li>';
  }
  function openPal() { palInput.value = ''; sel = 0; renderPal(); openOverlay(pal); }
  function runSel(i) { var c = shown[i]; if (!c) return; closeOverlay(pal); setTimeout(c.run, 60); }
  $('#openPalette').addEventListener('click', openPal);
  palInput.addEventListener('input', function () { sel = 0; renderPal(); });
  palList.addEventListener('click', function (e) { var li = e.target.closest('[data-i]'); if (li) runSel(+li.dataset.i); });
  palList.addEventListener('mousemove', function (e) { var li = e.target.closest('[data-i]'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; renderPal(); } });
  palInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); renderPal(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); renderPal(); }
    if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? closeOverlay(pal) : openPal(); }
    if (e.key === 'Escape') $$('.overlay.open').forEach(closeOverlay);
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (!typing && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'd' && !$('.overlay.open')) setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Lab: loading button ---------- */
  $('#loadBtn').addEventListener('click', function () {
    var b = this; if (b.disabled) return;
    b.disabled = true; b.innerHTML = '<span class="spin"></span>' + T('Saving');
    $('#loadMsg').textContent = T('Saving your changes');
    setTimeout(function () { b.disabled = false; b.textContent = T('Saved'); $('#loadMsg').textContent = T('All changes saved.'); toast('Changes saved'); setTimeout(function () { b.textContent = T('Save changes'); }, 1500); }, 1400);
  });

  /* ---------- Lab: pricing ---------- */
  var mult = 1;
  var billSeg = segmented($('#billing'), function (b) { mult = +b.dataset.m; price(); });
  function rangeFill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
  var shownPrice = 0;
  function price() {
    var r = $('#pages'); rangeFill(r);
    $('#pagesOut').textContent = r.value;
    var target = Math.round((49 + r.value * 12) * mult), from = shownPrice, t0 = null;
    requestAnimationFrame(function step(t) {
      t0 = t0 || t; var p = Math.min(1, (t - t0) / 300);
      shownPrice = Math.round(from + (target - from) * p);
      $('#priceOut').textContent = '$' + shownPrice + T('/mo');
      if (p < 1) requestAnimationFrame(step);
    });
  }
  $('#pages').addEventListener('input', price); price();

  /* ---------- Lab: rating ---------- */
  var starsEl = $('#stars'), labels = ['Not for me', 'It is okay', 'Pretty good', 'Really nice', 'I love it'].map(function (l) { return T(l); }), rating = 0;
  for (var s = 1; s <= 5; s++) {
    var sb = document.createElement('button');
    sb.setAttribute('role', 'radio'); sb.setAttribute('aria-label', T(s + ' star' + (s > 1 ? 's' : ''))); sb.dataset.v = s;
    sb.innerHTML = '<svg><use href="#i-star"/></svg>';
    starsEl.appendChild(sb);
  }
  function paintStars(n) { $$('button', starsEl).forEach(function (b) { b.classList.toggle('on', +b.dataset.v <= n); b.setAttribute('aria-checked', +b.dataset.v === rating); }); }
  starsEl.addEventListener('mouseover', function (e) { var b = e.target.closest('button'); if (b) paintStars(+b.dataset.v); });
  starsEl.addEventListener('mouseleave', function () { paintStars(rating); });
  starsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    rating = +b.dataset.v; paintStars(rating);
    $('#starsOut').textContent = labels[rating - 1];
    if (rating === 5) confetti();
  });

  /* ---------- Lab: ring ---------- */
  var ringN = 72;
  function ring() {
    var c = 263.9; $('#ringVal').style.strokeDashoffset = c - c * ringN / 100;
    $('#ringOut').textContent = ringN + '%'; $('#ringNum').textContent = ringN;
    if (ringN === 100) { toast('Ready to launch'); confetti(); }
  }
  $('#ringPlus').addEventListener('click', function () { ringN = Math.min(100, ringN + 7 > 100 ? 100 : ringN + 7); ring(); });
  $('#ringMinus').addEventListener('click', function () { ringN = Math.max(0, ringN - 7); ring(); });
  var ringObs = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ring(); ringObs.disconnect(); } });
  ringObs.observe($('.ring'));

  /* ---------- Lab: tabs ---------- */
  var tabs = $$('#tabs [role=tab]');
  function selectTab(t) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  /* ---------- Lab: sortable ---------- */
  var list = $('#sortable'), dragged = null;
  list.addEventListener('dragstart', function (e) { dragged = e.target.closest('li'); dragged.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ''); } catch (x) {} });
  list.addEventListener('dragend', function () { dragged && dragged.classList.remove('dragging'); $$('li', list).forEach(function (l) { l.classList.remove('over'); }); sortMsg(); });
  list.addEventListener('dragover', function (e) {
    e.preventDefault(); var li = e.target.closest('li'); if (!li || li === dragged) return;
    $$('li', list).forEach(function (l) { l.classList.toggle('over', l === li); });
    var r = li.getBoundingClientRect();
    list.insertBefore(dragged, e.clientY > r.top + r.height / 2 ? li.nextSibling : li);
  });
  function sortMsg() { $('#sortOut').textContent = T('Your top priority: {x}. Noted.', { x: $('li', list).textContent.replace('⋮⋮', '').trim() }); }

  /* ---------- Lab: dropzone ---------- */
  var dz = $('#dropzone');
  ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); }); });
  dz.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });
  $('#fileInput').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
  function addFiles(fl) {
    Array.prototype.slice.call(fl, 0, 4).forEach(function (f) {
      var li = document.createElement('li');
      li.innerHTML = '<span></span><span class="bar"><i></i></span><span class="sub"></span>';
      li.firstChild.textContent = f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name;
      li.lastChild.textContent = (f.size / 1024).toFixed(0) + ' KB';
      $('#files').appendChild(li);
      requestAnimationFrame(function () { requestAnimationFrame(function () { $('i', li).style.width = '100%'; }); });
    });
    setTimeout(function () { toast('Files ready. Nothing left your device.'); }, 1300);
  }

  /* ---------- Lab: skeleton ---------- */
  var skelHTML = $('#skel').innerHTML;
  $('#skelBtn').addEventListener('click', function () {
    var sk = $('#skel');
    if (sk.dataset.loaded) { sk.innerHTML = skelHTML; delete sk.dataset.loaded; this.textContent = T('Load content'); return; }
    this.textContent = T('Loading');
    var btn = this;
    setTimeout(function () {
      sk.innerHTML = '<div class="avatar" style="width:40px;height:40px;border-radius:50%;font-size:14px">YG</div><div><b>' + T('Content loaded') + '</b><div class="sub">' + T('Skeletons keep the layout steady while data arrives.') + '</div></div>';
      sk.dataset.loaded = '1'; btn.textContent = T('Show skeleton again');
    }, 900);
  });

  /* ---------- Lab: table ---------- */
  var tbl = $('#skillTable'), tbody = $('tbody', tbl);
  $$('th', tbl).forEach(function (th) {
    th.addEventListener('click', function () {
      var k = +th.dataset.k, asc = th.getAttribute('aria-sort') !== 'ascending';
      $$('th', tbl).forEach(function (x) { x.removeAttribute('aria-sort'); $('.arr', x).textContent = '↕'; });
      th.setAttribute('aria-sort', asc ? 'ascending' : 'descending'); $('.arr', th).textContent = asc ? '↑' : '↓';
      $$('tr', tbody).sort(function (a, b) {
        var x = a.cells[k].textContent, y = b.cells[k].textContent;
        return (asc ? 1 : -1) * x.localeCompare(y);
      }).forEach(function (r) { tbody.appendChild(r); });
    });
  });
  $('#tblSearch').addEventListener('input', function () {
    var q = this.value.toLowerCase();
    $$('tr', tbody).forEach(function (r) { r.hidden = r.textContent.toLowerCase().indexOf(q) < 0; });
  });

  /* ---------- Toolkit chips ---------- */
  function chipToggle(container, cb) {
    container.addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (!c) return;
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); cb && cb();
    });
  }
  function pressed(container) { return $$('.chip[aria-pressed="true"]', container).map(function (c) { return c.textContent; }); }
  chipToggle($('#toolChips'), function () {
    var p = pressed($('#toolChips'));
    $('#chipOut').textContent = p.length ? T('Good news: I work with {x}.', { x: new Intl.ListFormat(spanish ? 'es' : 'en').format(p) }) : '';
  });

  /* ---------- Reset lab ---------- */
  $('#resetLab').addEventListener('click', function () {
    setAccent('#8051FF'); setTheme('light'); $('#motionSwitch').checked = true; $('#soundSwitch').checked = false;
    $('#pages').value = 5; billSeg.reset(); price();
    rating = 0; paintStars(0); $('#starsOut').textContent = T('Rate this showroom');
    ringN = 72; ring(); $('#files').innerHTML = ''; $('#tblSearch').value = ''; $$('tr', tbody).forEach(function (r) { r.hidden = false; });
    toast('UI kit reset');
  });

  /* ---------- Contact wizard ---------- */
  var step = 1, total = 4, form = $('#wizard');
  var fmt = function (n) { return '$' + Number(n).toLocaleString('en-US'); };
  function data() {
    return {
      name: $('#fName').value.trim(), email: $('#fEmail').value.trim(), company: $('#fCompany').value.trim(),
      needs: pressed($('#needChips')), industry: $('#fIndustry').value, msg: $('#fMsg').value.trim(),
      budget: fmt($('#fBudget').value), time: T(($('input[name=timeline]:checked') || {}).value), call: $('#fCall').checked
    };
  }
  function summary() {
    var d = data();
    $('#sName').textContent = d.name ? d.name + (d.company ? ', ' + d.company : '') : T('Not added yet');
    $('#sNeeds').textContent = d.needs.length ? d.needs.join(', ') : T('Not added yet');
    $('#sInd').textContent = d.industry; $('#sBudget').textContent = d.budget; $('#sTime').textContent = d.time;
  }
  function field(id) { return $('#' + id).closest('.field'); }
  function check(id, ok) { field(id).classList.toggle('invalid', !ok); return ok; }
  function validate(n) {
    if (n === 1) {
      var a = check('fName', $('#fName').value.trim().length > 1);
      var b = check('fEmail', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#fEmail').value.trim()));
      return a && b;
    }
    if (n === 2) {
      var hasNeed = pressed($('#needChips')).length > 0;
      $('#needErr').style.display = hasNeed ? 'none' : 'flex';
      var m = check('fMsg', $('#fMsg').value.trim().length >= 10);
      return hasNeed && m;
    }
    return true;
  }
  function show(n) {
    step = n;
    $$('.step', form).forEach(function (s) { s.hidden = +s.dataset.step !== n; });
    $$('#wizSteps li').forEach(function (li, i) { li.classList.toggle('current', i + 1 === n); li.classList.toggle('done', i + 1 < n); $('.n', li).innerHTML = i + 1 < n ? '✓' : i + 1; });
    $('#wizProg').style.width = (n / total * 100) + '%';
    $('#wizBack').disabled = n === 1;
    $('#wizNext').innerHTML = n === total ? '<svg width="14" height="14"><use href="#i-mail"/></svg>' + T('Send by email') : T('Continue');
    $('#wizNext').className = 'btn ' + (n === total ? 'btn-magic' : 'btn-primary');
    if (n === 4) {
      var d = data();
      $('#preview').textContent = body(d);
    }
    var first = $('.step:not([hidden]) input, .step:not([hidden]) textarea', form);
    if (first && n > 1) first.focus({ preventScroll: true });
  }
  function body(d) {
    return T('Hi Yainel,') + '\n\n' + d.msg + '\n\n' + T('Name: ') + d.name + (d.company ? '\n' + T('Company: ') + d.company : '') + '\n' + T('Email: ') + d.email +
      '\n' + T('Needs: ') + d.needs.join(', ') + '\n' + T('Industry: ') + d.industry + '\n' + T('Budget: about ') + d.budget + '\n' + T('Timeline: ') + d.time +
      (d.call ? '\n' + T('I would like a quick video call first.') : '');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(step)) { toast('Check the highlighted fields', true); var bad = $('.field.invalid input, .field.invalid textarea', form); bad && bad.focus(); return; }
    if (step < total) return show(step + 1);
    var d = data();
    location.href = 'mailto:garcia.yainel@gmail.com?subject=' + encodeURIComponent(T('New project: {need} for {who}', { need: d.needs[0] || T('Website'), who: d.company || d.name })) + '&body=' + encodeURIComponent(body(d));
    $$('.step', form).forEach(function (s) { s.hidden = true; });
    $('#wizDone').hidden = false; $('#wizFoot').hidden = true; $('#wizProg').style.width = '100%';
    $$('#wizSteps li').forEach(function (li) { li.className = 'done'; $('.n', li).textContent = '✓'; });
    confetti();
  });
  $('#wizBack').addEventListener('click', function () { if (step > 1) show(step - 1); });
  $('#wizRestart').addEventListener('click', function () {
    form.reset(); $$('#needChips .chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    $('#wizDone').hidden = true; $('#wizFoot').hidden = false; budget(); summary(); $('#msgCount').textContent = '0 / 600'; show(1);
  });
  chipToggle($('#needChips'), function () { summary(); if (pressed($('#needChips')).length) $('#needErr').style.display = 'none'; });
  ['fName', 'fEmail', 'fCompany', 'fIndustry', 'fMsg'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { summary(); if (field(id).classList.contains('invalid')) validate(step); });
  });
  $('#fMsg').addEventListener('input', function () { $('#msgCount').textContent = this.value.length + ' / 600'; });
  function budget() { var r = $('#fBudget'); rangeFill(r); $('#budgetOut').textContent = fmt(r.value) + (r.value == r.max ? '+' : ''); summary(); }
  $('#fBudget').addEventListener('input', budget); budget();
  $$('input[name=timeline]').forEach(function (r) { r.addEventListener('change', summary); });

  /* ---------- Confetti ---------- */
  var cv = $('#confetti'), cx = cv.getContext('2d'), bits = [], running = false;
  function confetti() {
    if (reduce) return;
    cv.width = innerWidth; cv.height = innerHeight;
    var accent = getComputedStyle(root).getPropertyValue('--magic').trim() || '#8051FF';
    var cols = [accent, '#2FB5E8', '#FF6FD8', '#FFB800', '#29845A'];
    for (var i = 0; i < 140; i++) bits.push({ x: innerWidth / 2, y: innerHeight * .4, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 4, r: Math.random() * 6 + 4, c: cols[i % cols.length], a: Math.random() * 6, life: 0 });
    if (!running) { running = true; requestAnimationFrame(draw); }
  }
  function draw() {
    cx.clearRect(0, 0, cv.width, cv.height);
    bits = bits.filter(function (b) { return b.life < 160 && b.y < cv.height + 20; });
    bits.forEach(function (b) {
      b.life++; b.vy += .32; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.a += .2;
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.a); cx.fillStyle = b.c; cx.fillRect(-b.r / 2, -b.r / 4, b.r, b.r / 2); cx.restore();
    });
    if (bits.length) requestAnimationFrame(draw); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
  }

  /* ---------- Shared helpers for playground.js ---------- */
  window.yg = {
    toast: toast, copy: copy, confetti: confetti, openOverlay: openOverlay, segmented: segmented, commands: commands,
    reveal: function (el) { el.style.transitionDelay = (rev.n = (rev.n || 0) + 1) % 2 * 60 + 'ms'; rev.observe(el); }
  };
})();
