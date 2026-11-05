// Layout guides: shows the 12-column grid the site is built on.
(function () {
  var g = document.createElement('div');
  g.className = 'guides';
  g.setAttribute('aria-hidden', 'true');
  g.innerHTML = '<div class="wrap"><div class="cols">' + new Array(13).join('<span></span>') + '</div></div>';
  document.body.appendChild(g);

  var btn = document.querySelector('.toggle');
  var key = 'yg-guides';
  function set(on) {
    document.body.classList.toggle('show-guides', on);
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  var saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  if (saved === '1') set(true);
  else if (document.body.dataset.intro === 'yes') document.body.classList.add('intro');

  if (btn) btn.addEventListener('click', function () {
    document.body.classList.remove('intro');
    var on = !document.body.classList.contains('show-guides');
    set(on);
    try { localStorage.setItem(key, on ? '1' : '0'); } catch (e) {}
  });
})();
