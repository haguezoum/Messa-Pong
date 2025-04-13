/**
 * PageReloadHandler - Service to manage authentication state during page reloads
 * 
 * This service addresses issues with losing authentication state during
 * page reloads by:
 * 1. Storing critical tokens in sessionStorage and cookies before unload
 * 2. Attaching event listeners to detect page unload/reload
 * 3. Providing utility methods to manage storage synchronization
 */

/**
 * Force sync between localStorage and sessionStorage to ensure tokens survive page reloads
 */
function forceSyncStorages() {
    console.log('PageReloadHandler: Syncing storages for token persistence');
    
    // Copy tokens from localStorage to sessionStorage
    const lsAccessToken = localStorage.getItem('accessToken');
    const lsRefreshToken = localStorage.getItem('refreshToken');
    const lsUserData = localStorage.getItem('userData');
    const lsOAuthCode = localStorage.getItem('oauth_code');
    const lsOAuthTimestamp = localStorage.getItem('oauth_callback_timestamp');
    
    // Copy tokens from sessionStorage to localStorage
    const ssAccessToken = sessionStorage.getItem('accessToken');
    const ssRefreshToken = sessionStorage.getItem('refreshToken');
    const ssUserData = sessionStorage.getItem('userData');
    const ssOAuthCode = sessionStorage.getItem('oauth_code');
    const ssOAuthTimestamp = sessionStorage.getItem('oauth_callback_timestamp');
    
    // Choose the best source for each token, with localStorage having priority
    if (lsAccessToken) {
        sessionStorage.setItem('accessToken', lsAccessToken);
    } else if (ssAccessToken) {
        localStorage.setItem('accessToken', ssAccessToken);
    }
    
    if (lsRefreshToken) {
        sessionStorage.setItem('refreshToken', lsRefreshToken);
    } else if (ssRefreshToken) {
        localStorage.setItem('refreshToken', ssRefreshToken);
    }
    
    if (lsUserData) {
        sessionStorage.setItem('userData', lsUserData);
    } else if (ssUserData) {
        localStorage.setItem('userData', ssUserData);
    }
    
    // Handle OAuth data specifically
    if (lsOAuthCode) {
        sessionStorage.setItem('oauth_code', lsOAuthCode);
    } else if (ssOAuthCode) {
        localStorage.setItem('oauth_code', ssOAuthCode);
    }
    
    if (lsOAuthTimestamp) {
        sessionStorage.setItem('oauth_callback_timestamp', lsOAuthTimestamp);
    } else if (ssOAuthTimestamp) {
        localStorage.setItem('oauth_callback_timestamp', ssOAuthTimestamp);
    }
}

/**
 * Register event listener for beforeunload to synchronize storages before page refresh
 */
function registerPageUnloadHandler() {
    window.addEventListener('beforeunload', (event) => {
        console.log('PageReloadHandler: Page about to unload, syncing storages');
        forceSyncStorages();
    });
}

/**
 * Start the persistence handler on page load
 */
function init() {
    console.log('PageReloadHandler: Initializing');
    forceSyncStorages(); // Sync immediately on load
    registerPageUnloadHandler();
    
    // Set up periodic sync to ensure tokens persist
    setInterval(forceSyncStorages, 2000);
}

// Initialize when this module is loaded
init();

// Export functions for external use
export default {
    forceSyncStorages,
    registerPageUnloadHandler,
    init
};
