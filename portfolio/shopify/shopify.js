/* Shopify portfolio: live component demos + code viewer. Plain JavaScript, no dependencies.
   The demos simulate the storefront, admin, checkout and Hydrogen with sample data; the code viewer
   loads the real source files from /shopify/code (the same files published on GitHub). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var T = window.ygT || function (s) { return s; }, spanish = window.ygLang === 'es';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var money = new Intl.NumberFormat(spanish ? 'es-US' : 'en-US', { style: 'currency', currency: 'USD' });
  var fmt = function (cents) { return money.format(cents / 100); };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (children || []).forEach(function (c) { if (c != null) el.append(c); });
    return el;
  }

  /* ---------- Toasts ---------- */
  function toast(msg) {
    var t = h('div', { class: 'toast' }, [h('span', { text: msg })]);
    $('#toasts').appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 250); }, 2600);
  }

  /* ---------- Theme, mobile menu, scroll spy ---------- */
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('yg-theme', t); } catch (e) {}
    $('#themeBtn use').setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
  }
  setTheme(root.dataset.theme || 'light');
  $('#themeBtn').addEventListener('click', function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); });
  var menuBtn = $('#menuBtn');
  function nav(open) { document.body.classList.toggle('nav-open', open); menuBtn.setAttribute('aria-expanded', open); }
  menuBtn.addEventListener('click', function () { nav(!document.body.classList.contains('nav-open')); });
  $('#scrim').addEventListener('click', function () { nav(false); });
  $$('.sidebar a').forEach(function (a) { a.addEventListener('click', function () { nav(false); }); });

  /* ---------- Sample store: Aroma & Hoja ---------- */
  var catalog = [
    { id: 'eth', title: 'Ethiopia Yirgacheffe', type: 'Coffee', roast: 'Light', origin: 'Africa', price: 1800, color: '#C8643B', tags: ['floral', 'single origin'] },
    { id: 'ken', title: 'Kenya AA', type: 'Coffee', roast: 'Light', origin: 'Africa', price: 2000, color: '#B5465A', tags: ['berry', 'single origin'] },
    { id: 'col', title: 'Colombia Huila', type: 'Coffee', roast: 'Medium', origin: 'Latin America', price: 1600, color: '#6E7F5C', tags: ['caramel', 'single origin'] },
    { id: 'gua', title: 'Guatemala Antigua', type: 'Coffee', roast: 'Medium', origin: 'Latin America', price: 1700, color: '#8C5A3C', tags: ['cocoa'] },
    { id: 'bra', title: 'Brazil Cerrado', type: 'Coffee', roast: 'Dark', origin: 'Latin America', price: 1400, color: '#4A3426', tags: ['espresso', 'nutty'] },
    { id: 'sum', title: 'Sumatra Mandheling', type: 'Coffee', roast: 'Dark', origin: 'Asia', price: 1700, color: '#2F4F4F', tags: ['earthy'] },
    { id: 'egr', title: 'Earl Grey', type: 'Tea', origin: 'Asia', price: 1200, color: '#5B6C8F', tags: ['black tea', 'bergamot'] },
    { id: 'sen', title: 'Sencha', type: 'Tea', origin: 'Asia', price: 1400, color: '#7A9A4A', tags: ['green tea'] },
    { id: 'cha', title: 'Masala Chai', type: 'Tea', origin: 'Asia', price: 1100, color: '#A0522D', tags: ['spiced', 'black tea'] },
    { id: 'v60', title: 'Hario V60 Dripper', type: 'Accessory', price: 2800, color: '#C9C2B8', tags: ['pour-over', 'brewing'] },
    { id: 'gri', title: 'Burr Grinder', type: 'Accessory', price: 8900, color: '#3A3A3A', tags: ['grinder', 'brewing'] },
    { id: 'chx', title: 'Chemex 6-Cup', type: 'Accessory', price: 4900, color: '#D9CFC1', tags: ['pour-over', 'brewing'] }
  ];
  var byId = {}; catalog.forEach(function (p) { byId[p.id] = p; });

  // Product art: a bag for coffee, a tin for tea, a dripper for accessories
  function art(p) {
    var c = p.color, svg;
    if (p.type === 'Tea') svg = '<rect x="14" y="14" width="52" height="64" rx="6" fill="' + c + '"/><rect x="12" y="8" width="56" height="12" rx="4" fill="#2B1D16" opacity=".85"/><rect x="22" y="36" width="36" height="22" rx="3" fill="#FBF6EE" opacity=".9"/>';
    else if (p.type === 'Accessory') svg = '<path d="M14 22 h52 l-18 34 h-16z" fill="' + c + '"/><rect x="30" y="56" width="20" height="6" fill="#2B1D16" opacity=".7"/><rect x="18" y="64" width="44" height="14" rx="4" fill="#2B1D16" opacity=".85"/>';
    else svg = '<path d="M18 16 h44 l6 62 h-56z" fill="' + c + '"/><path d="M18 16 l6 -8 h32 l6 8z" fill="#2B1D16" opacity=".8"/><rect x="24" y="36" width="32" height="24" rx="3" fill="#FBF6EE" opacity=".92"/><circle cx="40" cy="48" r="6" fill="' + c + '"/>';
    return '<svg class="bag" viewBox="0 0 80 84" aria-hidden="true">' + svg + '</svg>';
  }
  function artEl(p) { var d = document.createElement('span'); d.innerHTML = art(p); return d.firstChild; }

  /* =====================================================================
     Component demos
     ===================================================================== */
  var demos = [];

  /* 1. Product page with variant picker, selling plans and AJAX cart drawer */
  demos.push({
    id: 'product', cat: 'theme', wide: true, title: 'Product page, subscriptions & cart drawer',
    desc: 'Size × grind variants with sold-out logic, Subscribe & save through selling plans, and an AJAX cart drawer with a free-shipping bar re-rendered by the Section Rendering API.',
    tags: ['Liquid', 'Web components', 'Cart API', 'Selling plans'],
    files: ['theme/sections/main-product.liquid', 'theme/assets/variant-picker.js', 'theme/sections/cart-drawer.liquid', 'theme/assets/cart-drawer.js'],
    render: function (stage) {
      var p = byId.eth;
      var options = [{ name: T('Size'), values: ['250 g', '1 kg'] }, { name: T('Grind'), values: ['Whole bean', 'Espresso', 'Pour-over'] }];
      var variants = [];
      options[0].values.forEach(function (size, i) {
        options[1].values.forEach(function (grind, j) {
          variants.push({ id: 44012733440000 + i * 10 + j, options: [size, grind], price: size === '1 kg' ? 5600 : 1800, available: !(size === '1 kg' && grind === 'Espresso') });
        });
      });
      var plans = [{ id: '', name: T('One-time purchase'), off: 0 }, { id: '6912073', name: T('Every 2 weeks'), off: 10 }, { id: '6912074', name: T('Every month'), off: 10 }];
      var sel = ['250 g', 'Whole bean'], plan = plans[0], cart = [], THRESHOLD = 5000;

      var store = h('div', { class: 'store' });
      var wrap = h('div', { class: 'd-product' });
      store.append(wrap);
      stage.append(store, h('p', { class: 'log', 'aria-live': 'polite' }));
      var log = $('.log', stage);

      function find(opts) { return variants.filter(function (v) { return v.options[0] === opts[0] && v.options[1] === opts[1]; })[0]; }
      function render() {
        var v = find(sel), price = Math.round(v.price * (100 - plan.off) / 100);
        wrap.innerHTML = '';
        var info = h('div', {}, [
          h('p', { class: 'muted', text: 'Aroma & Hoja · ' + T('Single origin') }),
          h('h4', { text: p.title }),
          h('p', { class: 'price', html: fmt(price) + (plan.off ? '<s>' + fmt(v.price) + '</s>' : '') }),
          h('div', { class: 'notes' }, ['jasmine', 'bergamot', 'peach'].map(function (n) { return h('span', { text: n }); }))
        ]);
        options.forEach(function (o, oi) {
          var opts = h('div', { class: 'opts' });
          o.values.forEach(function (val, vi) {
            var test = sel.slice(); test[oi] = val;
            var available = find(test).available, id = 'pv-' + oi + '-' + vi;
            opts.append(
              h('input', { type: 'radio', id: id, name: 'pv-opt-' + oi, value: val, checked: sel[oi] === val, onchange: function () { sel[oi] = val; render(); log.innerHTML = '<b>variant:change</b> → ?variant=' + find(sel).id; } }),
              h('label', { for: id, class: available ? null : 'is-unavailable', text: T(val) })
            );
          });
          info.append(h('fieldset', { class: 'picker' }, [h('legend', { text: o.name }), opts]));
        });
        var planSet = h('fieldset', { class: 'picker plans' }, [h('legend', { text: T('Purchase options') })]);
        plans.forEach(function (pl) {
          planSet.append(h('label', {}, [
            h('input', { type: 'radio', name: 'pv-plan', checked: pl === plan, onchange: function () { plan = pl; render(); } }),
            pl.name, pl.off ? h('span', { class: 'save', text: T('Save') + ' ' + pl.off + '%' }) : null
          ]));
        });
        info.append(planSet);
        info.append(h('button', { class: 's-btn', disabled: !v.available, onclick: function () { add(v, price); }, text: v.available ? T('Add to cart') : T('Sold out') }));
        info.append(h('p', { class: 'url-bar', text: '/products/ethiopia-yirgacheffe?variant=' + v.id + (plan.id ? '&selling_plan=' + plan.id : '') }));
        wrap.append(h('div', { class: 'media' }, [artEl(p)]), info, cartButton(), drawer);
        renderDrawer();
      }
      var drawer = h('aside', { class: 'drawer', 'aria-label': T('Cart') });
      function cartButton() {
        var n = cart.reduce(function (s, l) { return s + l.qty; }, 0);
        return h('button', { class: 'cart-toggle', onclick: function () { drawer.classList.toggle('open'); }, 'aria-label': T('Cart') }, [T('Cart'), h('b', { text: String(n) })]);
      }
      function renderDrawer() {
        var subtotal = cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0), left = THRESHOLD - subtotal;
        drawer.innerHTML = '';
        drawer.append(h('header', {}, [h('h4', { text: T('Your cart') }), h('button', { 'aria-label': T('Close'), html: '&times;', onclick: function () { drawer.classList.remove('open'); } })]));
        if (cart.length) {
          drawer.append(h('div', { class: 'ship', role: 'status' }, [
            h('span', { text: left > 0 ? T('{x} away from free shipping').replace('{x}', fmt(left)) : T('Free shipping unlocked') }),
            h('div', { class: 'track' }, [h('i', { style: 'width:' + Math.min(100, subtotal / THRESHOLD * 100) + '%' })])
          ]));
        }
        var ul = h('ul', { class: 'lines' });
        cart.forEach(function (l) {
          ul.append(h('li', {}, [artEl(p), h('div', {}, [h('b', { text: p.title }), h('div', { class: 'muted', text: l.label }),
            h('span', { class: 'qty' }, [h('button', { 'aria-label': T('Decrease'), text: '−', onclick: function () { change(l, -1); } }), h('span', { text: String(l.qty) }), h('button', { 'aria-label': T('Increase'), text: '+', onclick: function () { change(l, 1); } })])]),
            h('b', { text: fmt(l.price * l.qty) })]));
        });
        if (!cart.length) ul.append(h('li', { class: 'muted', text: T('Your cart is empty.') }));
        drawer.append(ul);
        if (cart.length) drawer.append(h('footer', {}, [h('p', {}, [h('span', { text: T('Subtotal') }), h('span', { text: fmt(subtotal) })]), h('button', { class: 's-btn', text: T('Check out'), onclick: function () { toast(T('Checkout is out of scope for this demo')); } })]));
        var toggle = $('.cart-toggle b', wrap); if (toggle) toggle.textContent = cart.reduce(function (s, x) { return s + x.qty; }, 0);
      }
      function rerenderLog(endpoint) { log.innerHTML = '<b>POST ' + endpoint + '</b> · sections=cart-drawer · ' + T('re-rendered in') + ' ' + (80 + Math.round(Math.random() * 70)) + ' ms'; }
      function add(v, price) {
        var key = v.id + ':' + plan.id, line = cart.filter(function (l) { return l.key === key; })[0];
        if (line) line.qty++;
        else cart.push({ key: key, qty: 1, price: price, label: T(v.options[0]) + ' / ' + T(v.options[1]) + (plan.off ? ' · ' + plan.name : '') });
        renderDrawer(); drawer.classList.add('open'); rerenderLog('/cart/add.js');
      }
      function change(l, d) { l.qty += d; if (l.qty <= 0) cart.splice(cart.indexOf(l), 1); renderDrawer(); rerenderLog('/cart/change.js'); }
      render();
    }
  });

  /* 2. Predictive search */
  demos.push({
    id: 'search', cat: 'theme', title: 'Predictive search',
    desc: 'Instant results for products and collections as you type, with highlighted matches and full keyboard support. Slow responses can never overwrite newer ones.',
    tags: ['Predictive Search API', 'ARIA combobox'],
    files: ['theme/assets/predictive-search.js'],
    render: function (stage) {
      var collections = [{ title: 'Coffee' }, { title: 'Tea' }, { title: 'Brewing gear' }, { title: 'Single origins' }];
      var store = h('div', { class: 'store d-search' });
      var input = h('input', { type: 'search', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'ps-results', 'aria-autocomplete': 'list', autocomplete: 'off', placeholder: T('Search coffee, tea, gear…'), 'aria-label': T('Search the store') });
      var box = h('div', { class: 'results', id: 'ps-results', role: 'listbox', hidden: true });
      store.append(h('div', { class: 'field', html: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M8.5 3a5.5 5.5 0 1 0 3.2 10l3.5 3.5a1 1 0 0 0 1.4-1.4L13.1 11.6A5.5 5.5 0 0 0 8.5 3ZM5 8.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"/></svg>' }, [input]), box);
      stage.append(store, h('p', { class: 'log', text: T('Try “light”, “ber”, “brew” or “chai”.') }));
      var active = -1, timer;
      function mark(text, q) {
        var i = text.toLowerCase().indexOf(q.toLowerCase()), span = document.createElement('span');
        if (i < 0) { span.textContent = text; return span; }
        span.append(text.slice(0, i), h('mark', { text: text.slice(i, i + q.length) }), text.slice(i + q.length));
        return span;
      }
      function run() {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
        var products = catalog.filter(function (p) { return (p.title + ' ' + p.type + ' ' + (p.roast || '') + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) > -1; }).slice(0, 4);
        var cols = collections.filter(function (c) { return c.title.toLowerCase().indexOf(q) > -1; }).slice(0, 2);
        box.innerHTML = ''; active = -1;
        if (products.length) box.append(h('h5', { text: T('Products') }));
        products.forEach(function (p, i) {
          box.append(h('a', { href: '#', role: 'option', id: 'ps-' + i, 'aria-selected': 'false', onclick: function (e) { e.preventDefault(); toast(T('Opens') + ' /products/' + p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')); } }, [artEl(p), mark(p.title, q), h('small', { text: fmt(p.price) })]));
        });
        if (cols.length) box.append(h('h5', { text: T('Collections') }));
        cols.forEach(function (c, i) {
          box.append(h('a', { href: '#', role: 'option', id: 'ps-c' + i, 'aria-selected': 'false', onclick: function (e) { e.preventDefault(); toast(T('Opens') + ' /collections/' + c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')); } }, [h('span'), mark(c.title, q), h('small', { text: T('Collection') })]));
        });
        if (!products.length && !cols.length) box.append(h('p', { class: 'none', text: T('No results for “{q}”').replace('{q}', input.value.trim()) }));
        box.hidden = false; input.setAttribute('aria-expanded', 'true');
        $('.log', stage).innerHTML = '<b>GET</b> /search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product,collection';
      }
      input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 200); });
      input.addEventListener('keydown', function (e) {
        var opts = $$('[role=option]', box);
        if (e.key === 'Escape') { box.hidden = true; return; }
        if (!opts.length || ['ArrowDown', 'ArrowUp', 'Enter'].indexOf(e.key) < 0) return;
        e.preventDefault();
        if (e.key === 'Enter') { if (opts[active]) opts[active].click(); return; }
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        opts.forEach(function (o, i) { o.setAttribute('aria-selected', String(i === active)); });
        input.setAttribute('aria-activedescendant', opts[active].id);
      });
    }
  });

  /* 3. Origin story from a metaobject */
  demos.push({
    id: 'origin', cat: 'theme', title: 'Origin story (metaobjects)',
    desc: 'The merchant fills each farm once in Content › Metaobjects and reuses it on every coffee from that farm, with no theme edits.',
    tags: ['Metaobjects', 'Section settings'],
    files: ['theme/sections/origin-story.liquid'],
    render: function (stage) {
      var entries = [
        { handle: 'konga-washing-station', farm_name: 'Konga Washing Station', country: 'Ethiopia', region: 'Yirgacheffe', producer: '650 smallholders', altitude: '1,950', process: 'Washed', color: '#C8643B' },
        { handle: 'la-esperanza', farm_name: 'Finca La Esperanza', country: 'Colombia', region: 'Huila', producer: 'Familia Ramírez', altitude: '1,700', process: 'Washed', color: '#6E7F5C' },
        { handle: 'santa-clara', farm_name: 'Finca Santa Clara', country: 'Guatemala', region: 'Antigua', producer: 'Zelaya family', altitude: '1,600', process: 'Honey', color: '#8C5A3C' }
      ];
      var current = entries[0];
      var card = h('div', { class: 'origin-card' });
      var select = h('select', { class: 'select', 'aria-label': T('Origin metaobject') });
      entries.forEach(function (e, i) { select.append(h('option', { value: i, text: e.farm_name })); });
      var json = h('pre');
      select.addEventListener('change', function () { current = entries[select.value]; render(); });
      stage.append(h('div', { class: 'd-origin' }, [card, h('div', { class: 'mo-panel' }, [h('b', { text: T('Section setting · Origin') }), select, json])]));
      function render() {
        card.innerHTML = '<svg viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true"><rect width="300" height="70" fill="' + current.color + '"/><path d="M0 50 Q60 20 120 42 T240 34 T300 30 V70 H0Z" fill="#1F3329" opacity=".55"/><path d="M0 60 Q80 40 160 58 T300 52 V70 H0Z" fill="#1F3329"/></svg>';
        card.append(h('span', { class: 'eye', text: current.country + ' · ' + current.region }), h('h4', { text: current.farm_name }),
          h('p', { text: T('Grown on volcanic soil and picked by hand, one ripe pass at a time.') }),
          h('dl', {}, [h('div', {}, [h('dt', { text: T('Producer') }), h('dd', { text: current.producer })]), h('div', {}, [h('dt', { text: T('Altitude') }), h('dd', { text: current.altitude + ' m' })]), h('div', {}, [h('dt', { text: T('Process') }), h('dd', { text: T(current.process) })])]));
        json.textContent = JSON.stringify({ type: 'origin', handle: current.handle, fields: { farm_name: current.farm_name, country: current.country, region: current.region, producer: current.producer, altitude: current.altitude.replace(',', ''), process: current.process } }, null, 2);
      }
      render();
    }
  });

  /* 4. Collection filters */
  demos.push({
    id: 'filters', cat: 'theme', wide: true, title: 'Collection filters',
    desc: 'Storefront filtering by product type, a roast-level metafield, origin and price, with live counts, removable pills and shareable URLs. Works as a plain form without JavaScript.',
    tags: ['Storefront Filtering', 'Metafields', 'Section Rendering API'],
    files: ['theme/sections/main-collection.liquid'],
    render: function (stage) {
      var facets = [
        { key: 'type', label: T('Product type'), param: 'filter.p.product_type', values: ['Coffee', 'Tea', 'Accessory'] },
        { key: 'roast', label: T('Roast level'), param: 'filter.p.m.custom.roast_level', values: ['Light', 'Medium', 'Dark'] },
        { key: 'origin', label: T('Origin'), param: 'filter.p.m.custom.origin', values: ['Africa', 'Latin America', 'Asia'] }
      ];
      var active = { type: [], roast: [], origin: [] }, min = '', max = '';
      var store = h('div', { class: 'store d-filters' });
      var side = h('form', { class: 'facets', 'aria-label': T('Filters'), onsubmit: function (e) { e.preventDefault(); } });
      var main = h('div');
      store.append(side, main);
      stage.append(store, h('p', { class: 'log' }));
      function matches(p, skip) {
        return facets.every(function (f) { return f.key === skip || !active[f.key].length || active[f.key].indexOf(p[f.key]) > -1; }) &&
          (min === '' || p.price >= min * 100) && (max === '' || p.price <= max * 100);
      }
      function buildSide() {
        side.innerHTML = '';
        facets.forEach(function (f) {
          var d = h('details', { open: true }, [h('summary', { text: f.label + (active[f.key].length ? ' (' + active[f.key].length + ')' : '') })]);
          f.values.forEach(function (v) {
            var count = catalog.filter(function (p) { return p[f.key] === v && matches(p, f.key); }).length, on = active[f.key].indexOf(v) > -1;
            d.append(h('label', { class: !count && !on ? 'off' : null }, [
              h('input', { type: 'checkbox', checked: on, disabled: !count && !on, onchange: function () { toggle(f.key, v); } }), T(v), h('span', { text: '(' + count + ')' })
            ]));
          });
          side.append(d);
        });
        var minIn = h('input', { type: 'number', min: 0, placeholder: '0', value: min, 'aria-label': T('Minimum price'), onchange: function () { min = minIn.value === '' ? '' : Number(minIn.value); update(); } });
        var maxIn = h('input', { type: 'number', min: 0, placeholder: '89', value: max, 'aria-label': T('Maximum price'), onchange: function () { max = maxIn.value === '' ? '' : Number(maxIn.value); update(); } });
        side.append(h('details', { open: true }, [h('summary', { text: T('Price') }), h('div', { class: 'range' }, [minIn, maxIn])]));
      }
      function toggle(k, v) { var i = active[k].indexOf(v); if (i > -1) active[k].splice(i, 1); else active[k].push(v); update(); }
      function update() {
        buildSide();
        var list = catalog.filter(function (p) { return matches(p); });
        main.innerHTML = '';
        var pills = h('div', { class: 'pills' });
        facets.forEach(function (f) { active[f.key].forEach(function (v) { pills.append(h('button', { text: f.label + ': ' + T(v) + ' ×', onclick: function () { toggle(f.key, v); } })); }); });
        if (min !== '' || max !== '') pills.append(h('button', { text: T('Price') + ' ×', onclick: function () { min = ''; max = ''; update(); } }));
        main.append(pills, h('div', { class: 'count-line', role: 'status' }, [h('span', { text: T('{n} products').replace('{n}', list.length) })]));
        var grid = h('div', { class: 'pgrid' });
        list.forEach(function (p) { grid.append(h('div', {}, [artEl(p), h('b', { text: p.title }), h('span', { class: 'muted', text: fmt(p.price) })])); });
        if (!list.length) grid.append(h('div', { class: 'muted', text: T('No products match these filters.') }));
        main.append(grid);
        var params = [];
        facets.forEach(function (f) { active[f.key].forEach(function (v) { params.push(f.param + '=' + encodeURIComponent(v)); }); });
        if (min !== '') params.push('filter.v.price.gte=' + min);
        if (max !== '') params.push('filter.v.price.lte=' + max);
        $('.log', stage).innerHTML = '<b>GET</b> /collections/all' + (params.length ? '?' + esc(params.join('&')) : '') + (params.length ? '&amp;section_id=main-collection' : '');
      }
      update();
    }
  });

  /* 5. Responsive images */
  demos.push({
    id: 'images', cat: 'theme', wide: true, title: 'Responsive images & performance',
    desc: 'One snippet gives every image a srcset, so phones download a fraction of a desktop photo. Move the sliders to see which file the browser would pick.',
    tags: ['image_url', 'srcset', 'Core Web Vitals'],
    files: ['theme/snippets/responsive-image.liquid'],
    render: function (stage) {
      var widths = [360, 540, 720, 900, 1080, 1440, 1800];
      var layouts = [{ label: T('Product photo'), sizes: '(min-width: 990px) 50vw, 100vw', f: function (vw) { return vw >= 990 ? vw / 2 : vw; } },
        { label: T('Full-width banner'), sizes: '100vw', f: function (vw) { return vw; } },
        { label: T('Collection card'), sizes: '(min-width: 990px) 25vw, 50vw', f: function (vw) { return vw >= 990 ? vw / 4 : vw / 2; } }];
      var vwIn = h('input', { type: 'range', class: 'range', min: 320, max: 1920, step: 10, value: 390 });
      var dprIn = h('select', { class: 'select' }, [1, 2, 3].map(function (d) { return h('option', { value: d, text: d + '×', selected: d === 3 }); }));
      var layIn = h('select', { class: 'select' }, layouts.map(function (l, i) { return h('option', { value: i, text: l.label }); }));
      var chips = h('div', { class: 'srcset' }), result = h('div', { class: 'img-result' });
      stage.append(h('div', { class: 'd-images' }, [
        h('div', { class: 'controls' }, [h('label', {}, [h('span', { class: 'vw-label' }), vwIn]), h('label', {}, [T('Screen density'), dprIn]), h('label', {}, [T('Where the image sits'), layIn]), h('div', {}, [h('span', { class: 'sub', text: 'srcset' }), chips])]),
        result]));
      function kb(w) { return Math.round(w * w * 1.25 * 0.15 / 1024); } // portrait 4:5 photo, ~0.15 bytes per pixel as WebP
      function update() {
        var vw = Number(vwIn.value), dpr = Number(dprIn.value), lay = layouts[layIn.value];
        vwIn.style.setProperty('--p', (vw - 320) / 1600 * 100 + '%');
        $('.vw-label', stage).textContent = T('Screen width') + ': ' + vw + 'px';
        var need = Math.ceil(lay.f(vw) * dpr), pick = widths.filter(function (w) { return w >= need; })[0] || 1800;
        chips.innerHTML = '';
        widths.forEach(function (w) { chips.append(h('span', { class: w === pick ? 'pick' : null, text: w + 'w' })); });
        var saved = Math.max(0, Math.round((1 - kb(pick) / kb(1800)) * 100));
        result.innerHTML = '';
        result.append(h('span', { class: 'sub', text: 'sizes="' + lay.sizes + '"' }),
          h('span', { text: T('The image is {w}px wide on screen, so the browser needs {n}px.').replace('{w}', Math.round(lay.f(vw))).replace('{n}', need) }),
          h('span', { class: 'big', text: pick + 'w · ~' + kb(pick) + ' KB' }),
          h('div', { class: 'bars2' }, [
            h('div', {}, [h('span', { text: T('With srcset') }), h('i', { class: 'good', style: 'width:' + Math.max(3, kb(pick) / kb(1800) * 100) + '%' }), h('b', { text: kb(pick) + ' KB' })]),
            h('div', {}, [h('span', { text: T('Without') }), h('i', { style: 'width:100%' }), h('b', { text: kb(1800) + ' KB' })])
          ]),
          h('span', { class: 'sub', text: saved ? T('{n}% less data for this visitor.').replace('{n}', saved) : T('Large screen: the full-size file is the right choice.') }));
      }
      [vwIn, dprIn, layIn].forEach(function (el) { el.addEventListener('input', update); });
      update();
    }
  });

  /* 6. Admin app: low stock */
  demos.push({
    id: 'lowstock', cat: 'apps', wide: true, title: 'Embedded admin app: low stock',
    desc: 'A Polaris app inside the Shopify admin that finds variants running out with the Admin GraphQL API and tags their products for restock in one click.',
    tags: ['Remix', 'Admin GraphQL', 'Polaris'],
    files: ['app/app/routes/app.low-stock.jsx'],
    render: function (stage) {
      var rows = [
        { p: 'Kenya AA', v: '1 kg / Whole bean', sku: 'CAF-KEN-1KG-GRA', q: 0 }, { p: 'Ethiopia Yirgacheffe', v: '1 kg / Espresso', sku: 'CAF-ETI-1KG-ESP', q: 0 },
        { p: 'Burr Grinder', v: 'Default', sku: 'ACC-GRI', q: 2 }, { p: 'Sencha', v: '50 g', sku: 'TE-SEN-050G', q: 4 },
        { p: 'Colombia Huila', v: '250 g / Pour-over', sku: 'CAF-COL-250G-FIL', q: 7 }, { p: 'Chemex 6-Cup', v: 'Default', sku: 'ACC-CHX', q: 9 },
        { p: 'Masala Chai', v: '100 g', sku: 'TE-CHA-100G', q: 14 }, { p: 'Brazil Cerrado', v: '250 g / Espresso', sku: 'CAF-BRA-250G-ESP', q: 21 }
      ];
      var tagged = {}, threshold = 10;
      var body = h('div', { class: 'admin-body' });
      stage.append(h('div', { class: 'd-admin' }, [h('div', { class: 'admin-top', html: '<i></i>Aroma &amp; Hoja · ' + esc(T('Apps')) + ' › Stock Watch' }), body]));
      // The slider is built once; only its label and the table re-render, so dragging stays smooth
      var label = h('span'), slider = h('input', { type: 'range', class: 'range', min: 1, max: 30, value: threshold, 'aria-label': T('Threshold') });
      var table = h('div'), query = h('p', { class: 'log' });
      body.append(h('h4', { text: T('Low stock') }), h('div', { class: 'pcard pad' }, [h('label', { style: 'display:grid;gap:6px' }, [label, slider])]), table, query);
      slider.addEventListener('input', function () { threshold = Number(slider.value); render(); });
      function render() {
        slider.style.setProperty('--p', (threshold - 1) / 29 * 100 + '%');
        label.textContent = T('Show variants with fewer than {n} units').replace('{n}', threshold);
        table.innerHTML = '';
        var list = rows.filter(function (r) { return r.q < threshold; });
        var card = h('div', { class: 'pcard' });
        if (!list.length) card.append(h('p', { class: 'pempty', text: T('Everything is in stock.') }));
        else {
          var tb = h('tbody');
          list.forEach(function (r) {
            var done = tagged[r.p];
            tb.append(h('tr', {}, [h('td', {}, [h('b', { text: r.p }), ' · ' + T(r.v)]), h('td', { text: r.sku }),
              h('td', {}, [h('span', { class: 'pbadge ' + (r.q ? 'warn' : 'crit'), text: r.q ? T('{n} left').replace('{n}', r.q) : T('Out of stock') })]),
              h('td', {}, [h('button', { class: 'pbtn', disabled: !!done, text: done ? T('Tagged') : T('Tag for restock'), onclick: function (e) {
                var b = e.currentTarget; b.textContent = '…'; b.disabled = true;
                setTimeout(function () { tagged[r.p] = true; render(); toast('tagsAdd → "restock" · ' + r.p); }, 450);
              } })])]));
          });
          card.append(h('table', {}, [h('thead', {}, [h('tr', {}, [T('Product'), 'SKU', T('Stock'), ''].map(function (t) { return h('th', { text: t }); }))]), tb]));
        }
        table.append(card);
        query.innerHTML = '<b>query</b> productVariants(query: "inventory_quantity:&lt;' + threshold + '", sortKey: INVENTORY_QUANTITY)';
      }
      render();
    }
  });

  /* 7. Webhook */
  demos.push({
    id: 'webhook', cat: 'apps', title: 'Webhooks: orders → roasting queue',
    desc: 'Every coffee order is verified, then scheduled for the next roast day. Retried deliveries are harmless, and forged requests are rejected.',
    tags: ['Webhooks', 'HMAC', 'Idempotency'],
    files: ['app/app/routes/webhooks.orders.create.jsx'],
    render: function (stage) {
      var logEl = h('div', { class: 'hook-log', role: 'log', 'aria-live': 'polite' }), queue = h('div', { class: 'queue' });
      var orders = {}, last = null, n = 1040;
      stage.append(h('div', { class: 'd-hook' }, [h('div', { class: 'row' }, [
        h('button', { class: 'btn btn-primary', text: T('Place test order'), onclick: function () { deliver(newOrder()); } }),
        h('button', { class: 'btn', text: T('Retry last delivery'), onclick: function () { if (last) deliver(last, true); else line('dim', T('No delivery to retry yet.')); } }),
        h('button', { class: 'btn btn-plain', text: T('Send forged request'), onclick: forged })
      ]), logEl, queue]));
      function line(cls, text) { logEl.append(h('div', { class: cls, text: text })); logEl.scrollTop = logEl.scrollHeight; }
      function newOrder() { n++; return { id: 5800000000 + n, name: '#' + n, bags: 1 + Math.floor(Math.random() * 3), at: new Date() }; }
      function nextRoastDay(d) { d = new Date(d); if (d.getHours() >= 12) d.setDate(d.getDate() + 1); while ([2, 5].indexOf(d.getDay()) < 0) d.setDate(d.getDate() + 1); return d; }
      var dayFmt = new Intl.DateTimeFormat(spanish ? 'es' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      function deliver(o, retry) {
        last = o;
        line('dim', 'POST /webhooks/orders/create  X-Shopify-Topic: orders/create' + (retry ? '  (' + T('retry') + ')' : ''));
        line('ok', '✓ HMAC ' + T('verified'));
        if (orders[o.id]) { line('warn', '↺ ' + T('Order {o} already queued: duplicate ignored').replace('{o}', o.name)); line('dim', '200 OK'); return; }
        orders[o.id] = o;
        line('ok', '+ ' + T('{o}: {b} bag(s) → roast on {d}').replace('{o}', o.name).replace('{b}', o.bags).replace('{d}', dayFmt.format(nextRoastDay(o.at))));
        line('dim', '200 OK · ' + (12 + Math.round(Math.random() * 20)) + ' ms');
        queue.append(h('span', { text: o.name + ' · ' + o.bags + ' ' + T('bags') }));
      }
      function forged() { line('dim', 'POST /webhooks/orders/create  X-Shopify-Hmac-Sha256: Zm9yZ2Vk…'); line('bad', '✕ HMAC ' + T('mismatch: request rejected')); line('dim', '401 Unauthorized'); }
      line('dim', T('Waiting for webhooks…'));
    }
  });

  /* 8. Theme app extension */
  demos.push({
    id: 'rating', cat: 'apps', title: 'Theme app block: star rating',
    desc: 'An app block merchants drop into any product section from the theme editor. It reads Shopify’s standard reviews metafield, so it works with any reviews app.',
    tags: ['Theme app extension', 'App blocks'],
    files: ['app/extensions/star-rating/blocks/star-rating.liquid'],
    render: function (stage) {
      var s = { color: '#C8643B', size: 16, count: true };
      var preview = h('div', { class: 'store' });
      var color = h('input', { type: 'color', value: s.color, 'aria-label': T('Star color') });
      var size = h('input', { type: 'range', class: 'range', min: 12, max: 28, step: 2, value: s.size, 'aria-label': T('Star size') });
      var count = h('input', { type: 'checkbox', checked: true });
      stage.append(h('div', { class: 'd-rating' }, [preview, h('div', { class: 'editor' }, [h('b', { text: T('Theme editor · Star rating') }),
        h('label', {}, [T('Star color'), color]), h('label', {}, [T('Star size'), size]), h('label', { class: 'chk' }, [count, T('Show review count')])])]));
      function render() {
        size.style.setProperty('--p', (s.size - 12) / 16 * 100 + '%');
        preview.innerHTML = '';
        preview.append(h('span', { class: 'muted', text: 'Aroma & Hoja' }), h('h4', { text: 'Colombia Huila' }),
          h('div', { class: 'row', style: 'gap:8px' }, [h('span', { class: 'stars', style: '--percent:92%;--star-color:' + s.color + ';--star-size:' + s.size + 'px', text: '★★★★★', 'aria-hidden': 'true' }),
            h('span', { text: '4.6' + (s.count ? ' (128)' : '') }), h('span', { class: 'sr', text: T('Rated 4.6 out of 5') })]),
          h('p', { class: 'muted', text: T('Caramel, red apple and milk chocolate. Balanced and sweet.') }), h('p', { style: 'font-weight:700;font-size:1rem', text: fmt(1600) }));
      }
      color.addEventListener('input', function () { s.color = color.value; render(); });
      size.addEventListener('input', function () { s.size = Number(size.value); render(); });
      count.addEventListener('change', function () { s.count = count.checked; render(); });
      render();
    }
  });

  /* 9. Shopify Function: bundle discount (same logic as run.js, running live) */
  function run(input) {
    var coffeeLines = input.cart.lines.filter(function (line) { return line.merchandise.__typename === 'ProductVariant' && line.merchandise.product.isCoffee; });
    var bags = coffeeLines.reduce(function (t, line) { return t + line.quantity; }, 0);
    if (bags < 2) return { discountApplicationStrategy: 'FIRST', discounts: [] };
    return { discountApplicationStrategy: 'FIRST', discounts: [{ message: '2+ bags: 10% off coffee', targets: coffeeLines.map(function (line) { return { cartLine: { id: line.id } }; }), value: { percentage: { value: '10.0' } } }] };
  }
  demos.push({
    id: 'discount', cat: 'checkout', title: 'Shopify Function: bundle discount',
    desc: '“Buy 2+ bags, save 10%” runs on Shopify’s servers for every cart and checkout. Change the quantities: the panel shows the Function’s real output.',
    tags: ['Shopify Functions', 'Discounts', 'GraphQL input'],
    files: ['app/extensions/coffee-bundle-discount/src/run.graphql', 'app/extensions/coffee-bundle-discount/src/run.js'],
    render: function (stage) {
      var lines = [{ id: 'gid://shopify/CartLine/1', p: byId.eth, qty: 1 }, { id: 'gid://shopify/CartLine/2', p: byId.col, qty: 0 }, { id: 'gid://shopify/CartLine/3', p: byId.egr, qty: 1 }, { id: 'gid://shopify/CartLine/4', p: byId.v60, qty: 0 }];
      var sim = h('div', { class: 'cartsim' }), out = h('pre', { class: 'fn-out', 'aria-live': 'polite' });
      stage.append(h('div', { class: 'd-discount' }, [sim, out]));
      function color(json) {
        return esc(json).replace(/("[^"]+")(\s*:)/g, '<span class="k">$1</span>$2').replace(/: ("[^"]*")/g, ': <span class="s">$1</span>').replace(/: (\d+)/g, ': <span class="n">$1</span>');
      }
      function render() {
        sim.innerHTML = '';
        lines.forEach(function (l) {
          sim.append(h('div', { class: 'line' }, [artEl(l.p), h('div', {}, [h('b', { text: l.p.title }), h('div', { class: 'sub', text: T(l.p.type) + ' · ' + fmt(l.p.price) })]),
            h('span', { class: 'counter', style: 'transform:scale(.85);transform-origin:right' }, [h('button', { 'aria-label': T('Decrease'), text: '−', onclick: function () { l.qty = Math.max(0, l.qty - 1); render(); } }), h('output', { text: String(l.qty) }), h('button', { 'aria-label': T('Increase'), text: '+', onclick: function () { l.qty++; render(); } })])]));
        });
        var inCart = lines.filter(function (l) { return l.qty > 0; });
        var input = { cart: { lines: inCart.map(function (l) { return { id: l.id, quantity: l.qty, merchandise: { __typename: 'ProductVariant', product: { isCoffee: l.p.type === 'Coffee' } } }; }) } };
        var result = run(input), targets = {};
        (result.discounts[0] ? result.discounts[0].targets : []).forEach(function (t) { targets[t.cartLine.id] = true; });
        var subtotal = 0, off = 0;
        inCart.forEach(function (l) { subtotal += l.p.price * l.qty; if (targets[l.id]) off += Math.round(l.p.price * l.qty * 0.1); });
        sim.append(h('div', { class: 'totals' }, [h('div', {}, [h('span', { text: T('Subtotal') }), h('span', { text: fmt(subtotal) })]),
          off ? h('div', { class: 'disc' }, [h('span', { text: result.discounts[0].message }), h('span', { text: '−' + fmt(off) })]) : h('div', { class: 'sub' }, [h('span', { text: T('Add a second bag of coffee to unlock 10% off.') })]),
          h('div', { class: 'sum' }, [h('span', { text: T('Total') }), h('span', { text: fmt(subtotal - off) })])]));
        out.innerHTML = '<span class="c">// FunctionRunResult</span>\n' + color(JSON.stringify(result, null, 2));
      }
      render();
    }
  });

  /* 10. Checkout UI extension */
  demos.push({
    id: 'upsell', cat: 'checkout', title: 'Checkout UI extension: upsell',
    desc: 'Suggests a grinder only when the order has whole-bean coffee and the grinder isn’t already in the cart. Upgrade-safe, configured from the checkout editor.',
    tags: ['Checkout UI extensions', 'React', 'Storefront API'],
    files: ['app/extensions/checkout-upsell/src/Checkout.jsx'],
    render: function (stage) {
      var grind = 'Whole bean', added = false;
      var box = h('div', { class: 'd-checkout' });
      stage.append(box);
      function render(loading) {
        box.innerHTML = '';
        var sel = h('select', { class: 'select', style: 'height:28px;width:auto;font-size:12px', 'aria-label': T('Grind') }, ['Whole bean', 'Espresso'].map(function (g) { return h('option', { value: g, text: T(g), selected: g === grind }); }));
        sel.addEventListener('change', function () { grind = sel.value; render(); });
        box.append(h('b', { text: T('Order summary') }), h('div', { class: 'co-line' }, [artEl(byId.eth), h('div', {}, [h('b', { text: byId.eth.title }), h('small', {}, ['250 g / ', sel])]), h('span', { text: fmt(1800) })]));
        if (added) box.append(h('div', { class: 'co-line' }, [artEl(byId.gri), h('div', {}, [h('b', { text: byId.gri.title }), h('small', { text: T('Added from the upsell') })]), h('span', { text: fmt(8900) })]));
        if (loading) box.append(h('div', { class: 'upsell' }, [h('div', { class: 'skel', style: 'width:60%' }), h('div', { class: 'skel' })]));
        else if (!added && grind === 'Whole bean') {
          var btn = h('button', { class: 'co-btn', text: T('Add'), onclick: function () { btn.setAttribute('aria-busy', 'true'); btn.textContent = '…'; setTimeout(function () { added = true; render(); toast('applyCartLinesChange → addCartLine'); }, 600); } });
          box.append(h('div', { class: 'upsell' }, [h('b', { text: T('Grinding at home? Freshly ground tastes better.') }), h('div', { class: 'row2' }, [artEl(byId.gri), h('div', {}, [h('b', { text: byId.gri.title }), h('div', { style: 'color:#707070', text: fmt(8900) })]), btn])]));
        }
        box.append(h('div', { class: 'co-total' }, [h('span', { text: T('Total') }), h('span', { text: fmt(1800 + (added ? 8900 : 0)) })]));
        if (added) box.append(h('button', { class: 'btn btn-plain', style: 'justify-self:start', text: T('Reset demo'), onclick: function () { added = false; render(true); setTimeout(function () { render(); }, 700); } }));
      }
      render(true);
      setTimeout(function () { render(); }, reduce ? 0 : 700);
    }
  });

  /* 11. Hydrogen */
  demos.push({
    id: 'hydrogen', cat: 'headless', wide: true, title: 'Hydrogen product route',
    desc: 'A headless product page rendered at the edge from the Storefront API. The selected size lives in the URL, so every variant has its own shareable link.',
    tags: ['Hydrogen', 'Remix', 'Storefront API', 'Oxygen'],
    files: ['hydrogen/app/routes/products.$handle.jsx'],
    render: function (stage) {
      var sizes = [{ label: '250 g', price: 1800 }, { label: '1 kg', price: 5600 }], current = sizes[0];
      var page = h('div', { class: 'hy-page' }), meta = h('div', { class: 'hy-meta' });
      stage.append(h('div', { class: 'd-hydrogen' }, [page, meta]));
      function render() {
        page.innerHTML = '';
        var links = h('div', { class: 'hy-sizes' });
        sizes.forEach(function (s) { links.append(h('a', { href: '#', 'aria-current': s === current ? 'page' : null, text: s.label, onclick: function (e) { e.preventDefault(); current = s; render(); } })); });
        page.append(h('div', { class: 'hy-nav' }, [h('span', { text: 'AROMA & HOJA' }), h('span', { text: T('Cart') + ' (0)' })]),
          h('div', { class: 'hy-body' }, [h('div', { class: 'media' }, [artEl(byId.eth)]), h('div', {}, [h('h4', { text: byId.eth.title }), h('p', { text: fmt(current.price) }),
            h('div', { class: 'notes' }, ['jasmine', 'bergamot', 'peach'].map(function (n) { return h('span', { text: n }); })), links,
            h('button', { class: 'hy-btn', text: T('Add to cart'), onclick: function () { toast('CartForm → LinesAdd'); } })])]));
        meta.innerHTML = '';
        var ms = 38 + Math.round(Math.random() * 30);
        meta.append(h('div', { class: 'row3' }, [h('span', { text: 'GET /products/ethiopia-yirgacheffe?Size=' + encodeURIComponent(current.label) }), h('span', { text: 'loader · ' + ms + ' ms' }), h('span', { text: 'CacheShort()' })]),
          h('pre', { class: 'fn-out', text: JSON.stringify({ product: { title: byId.eth.title, tastingNotes: { value: '["jasmine","bergamot","peach"]' }, selectedOrFirstAvailableVariant: { title: current.label + ' / Whole bean', availableForSale: true, price: { amount: (current.price / 100).toFixed(1), currencyCode: 'USD' } } } }, null, 2) }));
      }
      render();
    }
  });

  /* =====================================================================
     Rendering: groups, cards, code viewer
     ===================================================================== */
  var groups = [
    { id: 'theme', icon: 'i-theme', t: 'Theme development', p: 'Online Store 2.0 sections and snippets: fast, accessible, and editable by the merchant in the theme editor.' },
    { id: 'apps', icon: 'i-app', t: 'Apps & APIs', p: 'Embedded admin apps, webhooks and theme app extensions that add features without touching the theme code.' },
    { id: 'checkout', icon: 'i-card', t: 'Checkout & Functions', p: 'Business logic that runs inside Shopify’s checkout: upgrade-safe, fast, and impossible to bypass from the browser.' },
    { id: 'headless', icon: 'i-layers', t: 'Headless', p: 'Hydrogen and the Storefront API for stores that need a fully custom front end.' }
  ];
  var BASE = 'code/', GITHUB = 'https://github.com/yainel/nanefy-portfolio/blob/main/shopify/code/';
  var shRoot = $('#shRoot');
  groups.forEach(function (g) {
    var items = demos.filter(function (d) { return d.cat === g.id; });
    var sec = h('section', { class: 'section sh-group', id: g.id });
    sec.innerHTML = '<div class="sh-group-head"><h2><svg width="20" height="20" style="color:var(--magic)"><use href="#' + g.icon + '"/></svg>' + esc(T(g.t)) + ' <span class="badge">' + items.length + '</span></h2><p>' + esc(T(g.p)) + '</p></div>';
    var grid = h('div', { class: 'sh-grid' });
    items.forEach(function (d) {
      var stageEl = h('div', { class: 'sh-stage' });
      var card = h('article', { class: 'card sh-card' + (d.wide ? ' wide' : ''), id: 'demo-' + d.id }, [
        h('div', { class: 'pg-head' }, [h('h3', { text: T(d.title) }), h('div', { class: 'sh-tags' }, d.tags.map(function (t) { return h('span', { class: 'badge', text: T(t) }); }))]),
        h('p', { class: 'sh-desc', text: T(d.desc) }),
        stageEl,
        h('div', { class: 'sh-foot' }, [h('span', { class: 'sh-files-list', text: d.files.map(function (f) { return f.split('/').pop(); }).join(' · ') }),
          h('button', { class: 'btn btn-plain sh-code-btn', onclick: function () { openCode(d); }, html: '<svg width="16" height="16"><use href="#i-code"/></svg>' + esc(T('View code')) })])
      ]);
      grid.append(card);
      try { d.render(stageEl); } catch (err) { console.error(d.id, err); stageEl.append(h('p', { class: 'sub', text: T('This demo needs a newer browser.') })); }
    });
    sec.append(grid);
    shRoot.append(sec);
    $$('[data-count-cat="' + g.id + '"]').forEach(function (c) { c.textContent = items.length; });
  });

  /* Code viewer: real files from /shopify/code with a small highlighter */
  var syntax = {
    liquid: [/(\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\})|(\{%-?|-?%\}|\{\{-?|-?\}\})|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(<\/?[\w-]+|\/?>)|\b(if|else|elsif|endif|for|endfor|unless|endunless|assign|render|form|endform|case|when|endcase|liquid|paginate|endpaginate|schema|endschema|and|or|in|blank|contains|default)\b|(\|\s*[a-z_]+)/g, ['c', 'l', 's', 't', 'k', 'p']],
    js: [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(import|export|from|default|function|const|let|var|return|if|else|for|of|new|class|extends|async|await|try|catch|finally|throw|this|true|false|null|undefined|typeof)\b|(<\/?[A-Za-z][\w.]*|\/?>)|\b(\d+\.?\d*)\b/g, ['c', 's', 'k', 't', 'n']],
    graphql: [/(#[^\n]*)|("(?:[^"\\]|\\.)*")|\b(query|mutation|fragment|on|true|false)\b|(\$\w+|@\w+)|\b([A-Z]\w*)\b/g, ['c', 's', 'k', 'n', 't']]
  };
  function langOf(path) { return /\.liquid$/.test(path) ? 'liquid' : /\.graphql$/.test(path) ? 'graphql' : 'js'; }
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
  var modal = $('#codeModal'), codeEl = $('#cmCode'), filesEl = $('#cmFiles'), current = null, currentText = '', cache = {}, lastFocus = null;
  function showFile(path, focusTab) {
    current = path;
    $$('button', filesEl).forEach(function (b) { var on = b.dataset.path === path; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focusTab) b.focus(); });
    $('#cmGithub').href = GITHUB + path;
    var done = function (text) {
      if (current !== path) return;
      currentText = text;
      codeEl.innerHTML = highlight(text, langOf(path));
      $('#cmNote').textContent = 'shopify/code/' + path + ' · ' + text.split('\n').length + ' ' + T('lines');
    };
    if (cache[path]) return done(cache[path]);
    codeEl.textContent = T('Loading…');
    fetch(BASE + path).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) { cache[path] = t; done(t); })
      .catch(function () { codeEl.textContent = T('Could not load this file. Open it on GitHub instead.'); });
  }
  function openCode(d) {
    lastFocus = document.activeElement;
    $('#cmTitle').textContent = T(d.title);
    filesEl.innerHTML = '';
    d.files.forEach(function (f, i) {
      filesEl.append(h('button', { role: 'tab', 'data-path': f, text: f.split('/').pop(), title: f, onclick: function () { showFile(f); }, onkeydown: function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) showFile(d.files[(i + k + d.files.length) % d.files.length], true);
      } }));
    });
    showFile(d.files[0]);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('[data-close]', modal).focus(); }, 50);
  }
  function closeCode() { modal.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close]')) closeCode(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeCode(); });
  $('#cmCopy').addEventListener('click', function () {
    if (!currentText) return;
    if (navigator.clipboard) navigator.clipboard.writeText(currentText).then(function () { toast(T('Copied to clipboard')); }, function () {});
  });

  /* Scroll spy for the sidebar */
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      $$('.sidebar .nav-item').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main .section').forEach(function (s) { spy.observe(s); });
  if (location.hash && document.getElementById(location.hash.slice(1))) document.getElementById(location.hash.slice(1)).scrollIntoView();
})();
