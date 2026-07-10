const CACHE_NAME = 'coin-hunter-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];


// 서비스 워커 설치 및 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 기존 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 데이터 요청은 항상 네트워크를 우선으로 타도록 핸들링 (정적 파일만 로컬 캐싱)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API 요청은 항상 네트워크에서 가져오고 캐시를 적용하지 않음 (실시간성 확보)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
