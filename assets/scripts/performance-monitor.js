// Performance Monitoring and Analytics
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadStart: performance.now(),
            firebaseConnected: false,
            dataLoadTime: 0,
            renderTime: 0,
            totalLoadTime: 0
        };
        
        this.init();
    }

    init() {
        this.trackPageLoad();
        this.trackFirebaseConnection();
        this.trackUserInteractions();
        this.setupErrorTracking();
    }

    trackPageLoad() {
        // Track when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.domReady = performance.now() - this.metrics.loadStart;
                this.logMetric('DOM Ready', this.metrics.domReady);
            });
        }

        // Track when page is fully loaded
        window.addEventListener('load', () => {
            this.metrics.totalLoadTime = performance.now() - this.metrics.loadStart;
            this.logMetric('Total Load Time', this.metrics.totalLoadTime);
            this.sendAnalytics();
        });

        // Track First Contentful Paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                        this.logMetric('First Contentful Paint', entry.startTime);
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    trackFirebaseConnection() {
        // Monitor Firebase connection status
        const checkFirebase = () => {
            if (window.admin && window.admin.firestore) {
                this.metrics.firebaseConnected = true;
                this.metrics.firebaseConnectionTime = performance.now() - this.metrics.loadStart;
                this.logMetric('Firebase Connected', this.metrics.firebaseConnectionTime);
                this.showConnectionStatus(true);
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    }

    trackUserInteractions() {
        // Track time to first interaction
        const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
        
        const trackFirstInteraction = (event) => {
            if (!this.metrics.firstInteraction) {
                this.metrics.firstInteraction = performance.now() - this.metrics.loadStart;
                this.logMetric('First User Interaction', this.metrics.firstInteraction);
                
                // Remove listeners after first interaction
                interactionEvents.forEach(eventType => {
                    document.removeEventListener(eventType, trackFirstInteraction, true);
                });
            }
        };

        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, trackFirstInteraction, true);
        });
    }

    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                stack: event.reason?.stack
            });
        });

        // Track resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError('Resource Load Error', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);
    }

    showConnectionStatus(connected) {
        // Create or update connection status indicator
        let statusElement = document.querySelector('.firebase-status');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.className = 'firebase-status';
            document.body.appendChild(statusElement);
        }

        statusElement.className = `firebase-status ${connected ? 'connected' : 'disconnected'} show`;
        statusElement.innerHTML = `
            <span>${connected ? 'Firebase Connected' : 'Offline Mode'}</span>
        `;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 3000);
    }

    logMetric(name, value) {
        if (this.isDebugMode()) {
            console.log(`📊 Performance: ${name} - ${Math.round(value)}ms`);
        }
    }

    logError(type, details) {
        console.error(`❌ ${type}:`, details);
        
        // Send error to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${type}: ${details.message || details.reason}`,
                fatal: false
            });
        }
    }

    sendAnalytics() {
        // Send performance metrics to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            // Core Web Vitals
            if (this.metrics.fcp) {
                gtag('event', 'timing_complete', {
                    name: 'first_contentful_paint',
                    value: Math.round(this.metrics.fcp)
                });
            }

            // Custom metrics
            gtag('event', 'timing_complete', {
                name: 'total_load_time',
                value: Math.round(this.metrics.totalLoadTime)
            });

            if (this.metrics.firebaseConnectionTime) {
                gtag('event', 'timing_complete', {
                    name: 'firebase_connection_time',
                    value: Math.round(this.metrics.firebaseConnectionTime)
                });
            }

            // Connection status
            gtag('event', 'firebase_status', {
                connected: this.metrics.firebaseConnected
            });
        }

        // Log summary
        if (this.isDebugMode()) {
            console.log('📊 Performance Summary:', {
                'Total Load Time': `${Math.round(this.metrics.totalLoadTime)}ms`,
                'DOM Ready': `${Math.round(this.metrics.domReady || 0)}ms`,
                'First Contentful Paint': `${Math.round(this.metrics.fcp || 0)}ms`,
                'Firebase Connected': this.metrics.firebaseConnected,
                'Firebase Connection Time': `${Math.round(this.metrics.firebaseConnectionTime || 0)}ms`,
                'First Interaction': `${Math.round(this.metrics.firstInteraction || 0)}ms`
            });
        }
    }

    isDebugMode() {
        return localStorage.getItem('debug') === 'true' || 
               window.location.hostname === 'localhost' ||
               window.location.search.includes('debug=true');
    }

    // Public method to get current metrics
    getMetrics() {
        return { ...this.metrics };
    }

    // Public method to track custom events
    trackEvent(name, data = {}) {
        const timestamp = performance.now() - this.metrics.loadStart;
        this.logMetric(`Custom Event: ${name}`, timestamp);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', name, {
                ...data,
                timestamp: Math.round(timestamp)
            });
        }
    }
}

// Core Web Vitals tracking
function trackWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    const lcp = entry.startTime;
                    console.log('📊 LCP:', Math.round(lcp), 'ms');
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'timing_complete', {
                            name: 'largest_contentful_paint',
                            value: Math.round(lcp)
                        });
                    }
                }
            }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Report CLS when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('📊 CLS:', clsValue.toFixed(4));
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'cumulative_layout_shift',
                        value: Math.round(clsValue * 1000)
                    });
                }
            }
        });
    }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();
trackWebVitals();

// Make available globally for debugging
window.performanceMonitor = performanceMonitor;

// Add admin quick access if not in admin panel
if (!window.location.pathname.includes('/admin')) {
    document.addEventListener('DOMContentLoaded', () => {
        const quickAccess = document.createElement('div');
        quickAccess.className = 'admin-quick-access';
        quickAccess.innerHTML = `
            <a href="/admin" title="Admin Panel" aria-label="Access Admin Panel">
                <i class="fas fa-cog"></i>
            </a>
        `;
        document.body.appendChild(quickAccess);
        
        // Show after page load
        setTimeout(() => {
            quickAccess.classList.add('show');
        }, 2000);
    });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}