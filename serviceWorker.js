// Cache the assets
const staticEve = "eve-v1";
const assets = [
    "index.html",
    "style/app.min.css",
    "data.json",
    "script/app.min.js",
    "script/html5shiv.js",
    "img/logo.svg",
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticEve).then(cache => {
            cache.addAll(assets);
        })
    );
});

// Fetch the assets
self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request);
        })
    );
});