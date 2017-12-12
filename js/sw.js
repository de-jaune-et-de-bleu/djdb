//!! HORS DU SCOPE GULP !! => A AJOUTER AVEC EXCEPTION DANS GULP POUR LOADER BABEL DESSUS
// pour + => voir https://github.com/GoogleChromeLabs/sw-toolbox
// préférable utiliser toolbox ??

var cacheName = 'pwa'; //le nom de mon cache !

var filesToCache = [
 '/',
 'index.html',
 '/css/styles.css',
 '/js/app.js',
 '/js/vendors/TweenMax.min.js',
 '/fonts/montserrat-black.woff2',
 '/fonts/montserrat-black.woff',
 '/fonts/montserrat-bold.woff2',
 '/fonts/montserrat-bold.woff',
 '/fonts/montserrat-medium.woff2',
 '/fonts/montserrat-medium.woff',
 '/fonts/poppins-bold.woff2',
 '/fonts/poppins-bold.woff',
 '/fonts/poppins-light.woff2',
 '/fonts/poppins-light.woff',
 '/fonts/poppins-medium.woff2',
 '/fonts/poppins-medium.woff',
 '/fonts/poppins-regular.woff2',
 '/fonts/poppins-regular.woff'
]

// J'assigne un écouteur 'install' à mon service worker
self.addEventListener('install', function(e){
  // Cool il est installé !
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    // Je récupére mon cache du nom de pwa
    caches.open(cacheName).then(function(cache) {
      // Je fais là mise en cache de ma PWA
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
      // filesToCache : tableaux contenant les différents path vers les fichiers que je veux stocker.
    })
  );
});


/* OFFLINE -> check en ligne */
// J'assigne un écouteur 'fetch' à mon service worker
self.addEventListener('fetch', function(e) {
  // J'intercepte bien une requête x ou y.
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    // Jy réponds soit avec une ressource trouvée dans mon cache (responde) soit en renvoyant la requête
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
