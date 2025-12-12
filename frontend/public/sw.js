/**
 * Service Worker for Mindcraft Cognitive Dashboard
 * Implements caching strategies and PWA features
 */

const CACHE_NAME = 'mindcraft-dashboard-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const API_CACHE = 'api-cache-v1';

// Cache URLs that should be cached
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // '/favicon.ico', // Temporarily commented out - add favicon.ico to frontend/public/ if needed
  // Add other static assets as needed
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/agents',
  '/api/environment',
  '/api/system/status'
];

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cacheFirst',
  API: 'networkFirst',
  DYNAMIC: 'staleWhileRevalidate'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Determine cache strategy
  let strategy = CACHE_STRATEGIES.DYNAMIC;
  
  if (url.origin === self.location.origin) {
    if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
      strategy = CACHE_STRATEGIES.STATIC;
    } else if (url.pathname.startsWith('/api/')) {
      strategy = CACHE_STRATEGIES.API;
    }
  }
  
  // Apply caching strategy
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      event.respondWith(cacheFirst(request));
      break;
    case CACHE_STRATEGIES.API:
      event.respondWith(networkFirst(request));
      break;
    case CACHE_STRATEGIES.DYNAMIC:
    default:
      event.respondWith(staleWhileRevalidate(request));
      break;
  }
});

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    throw error;
  }
}

// Network First Strategy - for API calls
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Network First failed, returning cache:', error);
    
    // Return cached version if network fails
    if (cached) {
      return cached;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy - for dynamic content
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  // Always try to fetch fresh data
  const fetchPromise = fetch(request)
    .then(async (response) => {
      // Cache successful responses
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.warn('[SW] Stale While Revalidate fetch failed:', error);
      return null;
    });
  
  // Return cached version immediately if available
  if (cached) {
    // Update cache in background
    fetchPromise;
    return cached;
  }
  
  // If no cache, wait for network
  try {
    return await fetchPromise;
  } catch (error) {
    console.error('[SW] Stale While Revalidate failed completely:', error);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  
  // Sync offline actions
  const offlineActions = await getOfflineActions();
  
  for (const action of offlineActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      
      // Remove synced action from offline storage
      await removeOfflineAction(action.id);
    } catch (error) {
      console.error('[SW] Failed to sync action:', error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  const options = {
    body: event.data?.text() || 'New agent update available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'agent-update',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Mindcraft Dashboard', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_UPDATE':
      updateCache(event.data.url, event.data.data);
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
  }
});

// Utility functions
async function getOfflineActions() {
  // This would typically use IndexedDB
  return [];
}

async function removeOfflineAction(id) {
  // This would typically use IndexedDB
  console.log('[SW] Removing offline action:', id);
}

async function updateCache(url, data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, response);
  } catch (error) {
    console.error('[SW] Failed to update cache:', error);
  }
}

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data.type === 'PERFORMANCE_METRICS') {
    // Store performance metrics for analysis
    storePerformanceMetrics(event.data.metrics);
  }
});

async function storePerformanceMetrics(metrics) {
  try {
    const cache = await caches.open(API_CACHE);
    const existing = await cache.match('/performance-metrics');
    const existingData = existing ? await existing.json() : [];
    
    existingData.push({
      ...metrics,
      timestamp: Date.now()
    });
    
    // Keep only last 100 entries
    const trimmedData = existingData.slice(-100);
    
    const response = new Response(JSON.stringify(trimmedData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/performance-metrics', response);
  } catch (error) {
    console.error('[SW] Failed to store performance metrics:', error);
  }
}