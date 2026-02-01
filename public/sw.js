// Second Brain Service Worker
const CACHE_NAME = 'second-brain-v1';
const STATIC_CACHE = 'second-brain-static-v1';
const DYNAMIC_CACHE = 'second-brain-dynamic-v1';
const NOTES_CACHE = 'second-brain-notes-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/offline.html'
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/notes',
  '/api/folders',
  '/api/search',
  '/api/todos',
  '/api/bookmarks'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Remove old version caches
            return name.startsWith('second-brain-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE &&
                   name !== NOTES_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine caching strategy
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }
  
  // Static assets - cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    return 'cache-first';
  }
  
  // HTML pages - stale while revalidate
  return 'stale-while-revalidate';
}

// Network first strategy
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">📷</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Fetch event - apply appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  const strategy = getCacheStrategy(request);
  
  switch (strategy) {
    case 'network-first':
      event.respondWith(networkFirst(request, NOTES_CACHE));
      break;
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(fetch(request));
  }
});

// Handle background sync for offline notes
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Sync notes when back online
async function syncNotes() {
  try {
    // Get pending changes from IndexedDB
    const pendingChanges = await getPendingChanges();
    
    for (const change of pendingChanges) {
      try {
        await fetch(change.url, {
          method: change.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.data)
        });
        
        // Remove from pending after successful sync
        await removePendingChange(change.id);
      } catch (error) {
        console.error('[SW] Failed to sync change:', change, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB calls
async function getPendingChanges() {
  // TODO: Implement IndexedDB read
  return [];
}

async function removePendingChange(id) {
  // TODO: Implement IndexedDB delete
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New notification from Second Brain',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Second Brain', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const url = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message handling for communication with the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_NOTES') {
    cacheNotes(event.data.notes);
  }
});

// Cache notes data for offline access
async function cacheNotes(notes) {
  const cache = await caches.open(NOTES_CACHE);
  
  // Create a synthetic response for the notes
  const response = new Response(JSON.stringify({ success: true, data: notes }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await cache.put('/api/notes', response);
  console.log('[SW] Notes cached for offline use');
}
