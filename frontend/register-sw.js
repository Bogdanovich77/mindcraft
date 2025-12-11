/**
 * Service Worker Registration Script
 * Handles PWA service worker registration and updates
 */

(function() {
    'use strict';

    const SW_VERSION = '1.0.0';
    const SW_URL = '/sw.js';
    const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

    let registration = null;
    let isUpdating = false;

    // Register service worker
    async function registerServiceWorker() {
        try {
            // Check if service workers are supported
            if (!('serviceWorker' in navigator)) {
                console.warn('[SW] Service workers are not supported in this browser');
                return false;
            }

            // Check if we're in a secure context
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                console.warn('[SW] Service workers require HTTPS in production');
                return false;
            }

            // Register the service worker
            registration = await navigator.serviceWorker.register(SW_URL, {
                scope: '/',
                updateViaCache: 'none'
            });

            console.log('[SW] Service worker registered successfully:', registration.scope);

            // Handle updates
            registration.addEventListener('updatefound', handleUpdateFound);
            
            // Handle controller change
            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
            
            // Start update checking
            startUpdateChecking();

            return true;
        } catch (error) {
            console.error('[SW] Service worker registration failed:', error);
            return false;
        }
    }

    // Handle service worker update found
    function handleUpdateFound(event) {
        const newWorker = event.target.installing;
        
        if (!newWorker) {
            return;
        }

        console.log('[SW] New service worker found:', newWorker.state);

        // Track installation progress
        newWorker.addEventListener('statechange', function() {
            console.log('[SW] Service worker state:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New worker is installed, show update notification
                showUpdateNotification();
            }
        });
    }

    // Handle controller change (when new service worker takes control)
    function handleControllerChange() {
        console.log('[SW] Service worker controller changed');
        
        // Reload the page to activate new service worker
        if (isUpdating) {
            window.location.reload();
        }
    }

    // Show update notification to user
    function showUpdateNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'sw-update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1976d2;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            max-width: 300px;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>A new version is available</span>
                <button id="sw-update-btn" style="
                    background: white;
                    color: #1976d2;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    margin-left: auto;
                ">Update</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Handle update button click
        document.getElementById('sw-update-btn').addEventListener('click', function() {
            isUpdating = true;
            notification.remove();
            
            // Tell service worker to skip waiting
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (document.getElementById('sw-update-notification')) {
                notification.remove();
            }
        }, 10000);
    }

    // Start periodic update checking
    function startUpdateChecking() {
        setInterval(async () => {
            try {
                await checkForUpdates();
            } catch (error) {
                console.warn('[SW] Update check failed:', error);
            }
        }, UPDATE_CHECK_INTERVAL);
    }

    // Check for service worker updates
    async function checkForUpdates() {
        if (!registration) {
            return;
        }

        try {
            // Force update check
            await registration.update();
            
            // Check if there's a waiting worker
            if (registration.waiting && !isUpdating) {
                console.log('[SW] Update available but not installed');
                showUpdateNotification();
            }
        } catch (error) {
            console.warn('[SW] Update check failed:', error);
        }
    }

    // Unregister service worker
    async function unregisterServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.unregister();
                console.log('[SW] Service worker unregistered successfully');
                return true;
            } catch (error) {
                console.error('[SW] Service worker unregistration failed:', error);
                return false;
            }
        }
        return false;
    }

    // Get current service worker version
    async function getServiceWorkerVersion() {
        if (!registration) {
            return null;
        }

        try {
            const worker = registration.active || registration.installing || registration.waiting;
            if (worker && worker.postMessage) {
                // Send version request to worker
                worker.postMessage({ type: 'GET_VERSION' });
                
                // Listen for version response
                return new Promise((resolve) => {
                    const timeout = setTimeout(() => resolve(null), 2000);
                    
                    const handleMessage = (event) => {
                        if (event.data.type === 'VERSION') {
                            clearTimeout(timeout);
                            navigator.serviceWorker.removeEventListener('message', handleMessage);
                            resolve(event.data.version);
                        }
                    };
                    
                    navigator.serviceWorker.addEventListener('message', handleMessage);
                });
            }
        } catch (error) {
            console.warn('[SW] Failed to get service worker version:', error);
            return null;
        }
        
        return null;
    }

    // Initialize service worker registration
    function init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', registerServiceWorker);
        } else {
            registerServiceWorker();
        }

        // Expose utility functions globally
        window.serviceWorkerUtils = {
            register: registerServiceWorker,
            unregister: unregisterServiceWorker,
            getVersion: getServiceWorkerVersion,
            checkForUpdates: checkForUpdates
        };
    }

    // Start initialization
    init();

})();