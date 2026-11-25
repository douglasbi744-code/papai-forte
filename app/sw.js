// Service worker: app offline + notificações de água.
// Ao mudar qualquer arquivo do app, aumente a versão abaixo e o ?v= em index.html.
const VERSION = 'pf-v6';
const INBOX = 'pf-inbox';
const SHELL = [
  './', './index.html', './styles.css', './data.js', './foods.js', './app.js', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== INBOX).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fontes do Google: usa o cache e atualiza em segundo plano
  if (url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  // App: rede primeiro (pega atualizações), cache se estiver offline
  e.respondWith(
    // no-cache: sempre confere com o servidor (o GitHub Pages manda guardar por 10 min)
    fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })).then(r => {
      const copy = r.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});

/* ---------- notificações de água ---------- */
const opts = body => ({
  body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'agua', renotify: true, vibrate: [200, 100, 200],
  actions: [{ action: 'bebi', title: '✅ Bebi 500 ml' }, { action: 'depois', title: 'Ainda não' }],
  data: { url: './?agua=1#hoje' }
});

self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) { p = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(p.title || '💧 Hora da água', opts(p.body || 'Bebeu sua garrafa de 500 ml?')));
});

const pad = n => String(n).padStart(2, '0');
const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

async function addToInbox() {
  const c = await caches.open(INBOX), r = await c.match('inbox');
  const list = r ? await r.json() : [];
  list.push({ d: localDay(), ts: Date.now() });
  await c.put('inbox', new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } }));
  const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  wins.forEach(w => w.postMessage({ type: 'inbox' }));
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'depois') return;
  if (e.action === 'bebi') {
    // confirmação manual direto na notificação: marca 1 garrafa
    e.waitUntil(addToInbox().then(() => self.registration.showNotification('✅ +500 ml marcado', {
      body: 'Boa! Continue assim.', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'agua-ok', silent: true
    })).then(() => new Promise(r => setTimeout(r, 3500))).then(async () => {
      (await self.registration.getNotifications({ tag: 'agua-ok' })).forEach(n => n.close());
    }));
    return;
  }
  // toque na notificação: abre o app perguntando se bebeu
  const target = new URL(e.notification.data && e.notification.data.url || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
    const w = wins.find(x => x.url.startsWith(self.registration.scope));
    if (w) return w.navigate(target).then(c => (c || w).focus());
    return self.clients.openWindow(target);
  }));
});
