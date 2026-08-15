// キャッシュ名。ファイルを更新して再反映させたいときは、この番号を上げる。
const CACHE_NAME = "teleapo-training-cache-v1";

// 事前キャッシュしておきたいファイル
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./characters.html",
  "./manifest.json",
  "./assets/zoomy.png"
];

// インストール時:必要なファイルを事前キャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // 存在しないファイルがあってもインストール全体は失敗させない
        return Promise.resolve();
      })
    )
  );
  self.skipWaiting();
});

// 有効化時:古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// リクエスト時:ネットワーク優先、失敗したらキャッシュを返す
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 同一サイト以外(外部API等)はキャッシュ対象外
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
