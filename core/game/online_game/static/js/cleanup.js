/**
 * Messa Pong - Automatic Cleanup Service
 * 
 * This script calls the cleanup API endpoint periodically to ensure:
 * - Inactive games are properly marked as inactive
 * - Orphaned queue entries are removed
 * - Player counts and active game statistics stay accurate
 */

(function() {
    // Set the interval for cleanup (every 30 seconds = 30000 ms)
    const CLEANUP_INTERVAL = 30000;
    
    // The cleanup endpoint URL
    const CLEANUP_URL = '/online/api/cleanup/';
    
    // Track last cleanup time
    let lastCleanupTime = 0;
    
    // Function to call the cleanup API
    function performCleanup() {
        const now = Date.now();
        console.log('Running automatic game cleanup...');
        
        // Make sure we don't spam the server if there are multiple tabs open
        if (now - lastCleanupTime < 30000) {
            console.log('Skipping cleanup - another cleanup was run recently');
            return;
        }
        
        lastCleanupTime = now;
        
        fetch(CLEANUP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Cleanup completed successfully');
                // Store the timestamp in localStorage so other tabs can see it
                try {
                    localStorage.setItem('lastPongCleanup', String(now));
                } catch (e) {
                    // Ignore localStorage errors
                }
            } else {
                console.error('Cleanup failed with status:', response.status);
            }
        })
        .catch(error => {
            console.error('Error during cleanup:', error);
        });
    }
    
    // Initialize the cleanup interval
    function initCleanup() {
        // Check if another tab has already run cleanup recently
        try {
            const storedTime = localStorage.getItem('lastPongCleanup');
            if (storedTime) {
                lastCleanupTime = parseInt(storedTime, 10);
                const timeSinceLast = Date.now() - lastCleanupTime;
                if (timeSinceLast < 30000) {
                    console.log(`Skipping initial cleanup - another tab ran cleanup ${Math.round(timeSinceLast / 1000)}s ago`);
                    // Still run cleanup, but after a delay
                    setTimeout(performCleanup, 30000 - timeSinceLast);
                } else {
                    // Run an immediate cleanup when page loads
                    performCleanup();
                }
            } else {
                // Run an immediate cleanup when page loads
                performCleanup();
            }
        } catch (e) {
            // If localStorage is not available, just run cleanup
            performCleanup();
        }
        
        // Set up periodic cleanup
        setInterval(performCleanup, CLEANUP_INTERVAL);
        
        console.log('Automatic game cleanup service initialized');
    }
    
    // Start the cleanup service when the page is fully loaded
    if (document.readyState === 'complete') {
        initCleanup();
    } else {
        window.addEventListener('load', initCleanup);
    }
})(); 