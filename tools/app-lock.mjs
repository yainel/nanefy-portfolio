#!/usr/bin/env node
// Password-locks the pages under app/.
//
// The repo is public and GitHub Pages has no server-side auth, so the pages are
// stored encrypted (AES-256-GCM, key from the password with PBKDF2-SHA256).
// The browser decrypts them only after the right password is typed.
//
//   node tools/app-lock.mjs unlock   app/**/*.html (encrypted)  -> app-src/ (plain, git-ignored)
//   node tools/app-lock.mjs lock     app-src/**/*.html (plain)  -> app/ (encrypted)
//
// Edit the plain copies in app-src/, then lock again and commit app/.
// The password is read from NANEFY_APP_PASSWORD or asked for on the terminal.

import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCKED = join(ROOT, 'app');
const PLAIN = join(ROOT, 'app-src');
const ITERATIONS = 250000;
const MARK = /<script id="locked" type="application\/json">([\s\S]*?)<\/script>/;

const b64 = (u8) => Buffer.from(u8).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));

function htmlFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmlFiles(p) : n.endsWith('.html') ? [p] : [];
  });
}

async function keyFrom(password, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, 256);
  return crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function askPassword() {
  if (process.env.NANEFY_APP_PASSWORD) return Promise.resolve(process.env.NANEFY_APP_PASSWORD);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question('Password: ', (a) => { rl.close(); res(a); }));
}

function gatePage(payload, depth) {
  const icon = '../'.repeat(depth) + 'img/nanefy-icon.svg';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Nanefy</title>
<link rel="icon" href="${icon}" type="image/svg+xml">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090D;color:#EEEEF3;font:16px/1.5 Inter,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px}
form{width:100%;max-width:340px;background:#15151D;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:28px;display:grid;gap:14px}
h1{margin:0;font-size:1.25rem;letter-spacing:-.02em;display:flex;align-items:center;gap:10px}
h1 img{width:28px;height:28px}
label{font-size:.875rem;color:#A4A4B4}
input{width:100%;height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#09090D;color:inherit;font:inherit;padding:0 12px}
input:focus{outline:2px solid #2FB5E8;outline-offset:1px}
button{height:44px;border:0;border-radius:10px;background:linear-gradient(135deg,#8051FF,#B24BF3 55%,#2FB5E8);color:#fff;font:inherit;font-weight:600;cursor:pointer}
button:disabled{opacity:.6;cursor:wait}
.err{margin:0;min-height:1.2em;font-size:.875rem;color:#FF8FA3}
</style>
</head>
<body>
<form id="gate" autocomplete="on" hidden>
  <h1><img src="${icon}" alt="">Nanefy</h1>
  <label for="pw">Contraseña · Password</label>
  <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
  <button type="submit">Entrar · Enter</button>
  <p class="err" id="err" role="alert"></p>
</form>
<script id="locked" type="application/json">${JSON.stringify(payload)}</script>
<script>
(function () {
  var D = JSON.parse(document.getElementById('locked').textContent), STORE = 'nanefy-app-key';
  var form = document.getElementById('gate'), pw = document.getElementById('pw'), err = document.getElementById('err');
  function bin(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function str(u8) { var s = ''; u8.forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s); }
  function derive(p) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(p), 'PBKDF2', false, ['deriveBits']).then(function (base) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bin(D.s), iterations: D.n, hash: 'SHA-256' }, base, 256);
    }).then(function (bits) { return new Uint8Array(bits); });
  }
  function open(raw) {
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']).then(function (k) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bin(D.i) }, k, bin(D.c));
    }).then(function (buf) {
      try { localStorage.setItem(STORE, D.s + ':' + str(raw)); } catch (e) {}
      var html = new TextDecoder().decode(buf);
      // Replace the page only once this one has finished loading; writing while it is still
      // being parsed would insert the decrypted page into this one instead.
      function swap() { setTimeout(function () { 
        document.open(); document.write(html); document.close();
        var h = location.hash.slice(1);
        if (h) setTimeout(function () { var el = document.getElementById(decodeURIComponent(h)); if (el) el.scrollIntoView(); }, 300);
      }, 0); }
      if (document.readyState === 'complete') swap(); else addEventListener('load', swap, { once: true });
    });
  }
  function ask() { form.hidden = false; pw.focus(); }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.textContent = '';
    var btn = form.querySelector('button'); btn.disabled = true;
    derive(pw.value).then(open).catch(function () {
      btn.disabled = false; pw.select();
      err.textContent = 'Contraseña incorrecta · Wrong password';
    });
  });
  var saved = null;
  try { saved = (localStorage.getItem(STORE) || '').split(':'); } catch (e) {}
  if (saved && saved[0] === D.s && saved[1]) {
    open(bin(saved[1])).catch(function () { try { localStorage.removeItem(STORE); } catch (e) {} ask(); });
  } else ask();
})();
</script>
</body>
</html>
`;
}

async function lock(password) {
  const files = htmlFiles(PLAIN);
  if (!files.length) throw new Error('No pages in app-src/. Run "unlock" first.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await keyFrom(password, salt, ITERATIONS);
  for (const f of files) {
    const rel = relative(PLAIN, f), out = join(LOCKED, rel);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, readFileSync(f)));
    const depth = rel.split(/[\\/]/).length - 1;
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, gatePage({ s: b64(salt), i: b64(iv), n: ITERATIONS, c: b64(c) }, depth));
    console.log('locked  app/' + rel);
  }
}

async function unlock(password) {
  for (const f of htmlFiles(LOCKED)) {
    const m = readFileSync(f, 'utf8').match(MARK);
    if (!m) continue;
    const D = JSON.parse(m[1]);
    const key = await keyFrom(password, unb64(D.s), D.n);
    let plain;
    try { plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(D.i) }, key, unb64(D.c)); }
    catch { throw new Error('Wrong password for ' + relative(ROOT, f)); }
    const out = join(PLAIN, relative(LOCKED, f));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(plain));
    console.log('unlocked ' + relative(ROOT, out));
  }
}

const cmd = process.argv[2];
if (cmd !== 'lock' && cmd !== 'unlock') {
  console.error('Usage: node tools/app-lock.mjs lock|unlock');
  process.exit(1);
}
const password = await askPassword();
if (!password) { console.error('Empty password'); process.exit(1); }
await (cmd === 'lock' ? lock : unlock)(password).catch((e) => { console.error(e.message); process.exit(1); });
