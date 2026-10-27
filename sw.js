// Kritik Seçim Espor - çevrimdışı çalışma (service worker)
// Önce internetten yeni dosyayı dener, internet yoksa kayıtlı kopyayı açar.
const ONBELLEK = "kritik-secim-v1";
const DOSYALAR = [
  "./",
  "./index.html",
  "./kartlar.js",
  "./manifest.json",
  "./ikon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(ONBELLEK).then(function (c) { return c.addAll(DOSYALAR); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (adlar) {
      return Promise.all(adlar.filter(function (a) { return a !== ONBELLEK; })
        .map(function (a) { return caches.delete(a); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (yanit) {
      const kopya = yanit.clone();
      caches.open(ONBELLEK).then(function (c) { c.put(e.request, kopya); });
      return yanit;
    }).catch(function () {
      return caches.match(e.request).then(function (k) {
        return k || caches.match("./index.html");
      });
    })
  );
});
