/**
 * AuthCheck Service
 * 
 * A global service for checking authentication status across the application.
 * This centralizes authentication logic and provides consistent behavior.
 */
class AuthCheck {
    constructor() {
        // Flag to track if a redirect is currently in progress
        this._isRedirecting = false;
        
        // Debug mode defaults to false
        this._debugMode = false;
        
        // Store last known values for recovery
        this._lastKnownTokens = {
            accessToken: null,
            refreshToken: null,
            userData: null
        };
        
        // Log initialization
        console.log('AuthCheck service initialized');
        
        // Set up periodic check of localStorage to prevent token loss
        setInterval(() => this.verifyTokensExist(), 1000);
    }
    
    /**
     * Enables or disables debug mode
     * @param {boolean} enable - Whether to enable debug mode
     */
    setDebugMode(enable) {
        this._debugMode = !!enable;
        console.log(`AuthCheck debug mode ${this._debugMode ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Verify that our tokens still exist in localStorage
     * This prevents token loss during navigation
     */
    verifyTokensExist() {
        // Check localStorage
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('userData');
        
        // Check sessionStorage as backup
        const sessionAccessToken = sessionStorage.getItem('accessToken');
        const sessionRefreshToken = sessionStorage.getItem('refreshToken');
        const sessionUserData = sessionStorage.getItem('userData');
        
        // If tokens are in sessionStorage but not localStorage, restore them
        if (!accessToken && sessionAccessToken) {
            console.log('Restoring accessToken from sessionStorage to localStorage');
            localStorage.setItem('accessToken', sessionAccessToken);
            this._lastKnownTokens.accessToken = sessionAccessToken;
        }
        
        if (!refreshToken && sessionRefreshToken) {
            console.log('Restoring refreshToken from sessionStorage to localStorage');
            localStorage.setItem('refreshToken', sessionRefreshToken);
            this._lastKnownTokens.refreshToken = sessionRefreshToken;
        }
        
        if (!userData && sessionUserData) {
            console.log('Restoring userData from sessionStorage to localStorage');
            localStorage.setItem('userData', sessionUserData);
            this._lastKnownTokens.userData = sessionUserData;
        }
        
        // If we have the tokens in memory but they're missing from both storages, restore them
        if (this._lastKnownTokens.accessToken && !accessToken && !sessionAccessToken) {
            console.warn('CRITICAL: accessToken disappeared from all storage, restoring it');
            localStorage.setItem('accessToken', this._lastKnownTokens.accessToken);
            sessionStorage.setItem('accessToken', this._lastKnownTokens.accessToken);
        } else if (accessToken && accessToken !== this._lastKnownTokens.accessToken) {
            // Update our cached version if localStorage changed
            this._lastKnownTokens.accessToken = accessToken;
            // Also ensure it's in sessionStorage
            sessionStorage.setItem('accessToken', accessToken);
        }
        
        if (this._lastKnownTokens.refreshToken && !refreshToken && !sessionRefreshToken) {
            console.warn('CRITICAL: refreshToken disappeared from all storage, restoring it');
            localStorage.setItem('refreshToken', this._lastKnownTokens.refreshToken);
            sessionStorage.setItem('refreshToken', this._lastKnownTokens.refreshToken);
        } else if (refreshToken && refreshToken !== this._lastKnownTokens.refreshToken) {
            this._lastKnownTokens.refreshToken = refreshToken;
            sessionStorage.setItem('refreshToken', refreshToken);
        }
        
        if (this._lastKnownTokens.userData && !userData && !sessionUserData) {
            console.warn('CRITICAL: userData disappeared from all storage, restoring it');
            localStorage.setItem('userData', this._lastKnownTokens.userData);
            sessionStorage.setItem('userData', this._lastKnownTokens.userData);
        } else if (userData && userData !== this._lastKnownTokens.userData) {
            this._lastKnownTokens.userData = userData;
            sessionStorage.setItem('userData', userData);
        }
    }
    
    /**
     * Log message if debug mode is enabled
     * @param {string} message - Message to log
     */
    _debug(message) {
        if (this._debugMode) {
            console.log(`[AuthCheck] ${message}`);
        }
    }
    
    /**
     * Verify if the user is authenticated
     * @param {Object} component - The component requesting verification
     * @param {Object} options - Configuration options
     * @param {Function} options.onSuccess - Callback for successful authentication
     * @param {Function} options.onFailure - Callback for failed authentication
     * @param {boolean} options.redirectOnFailure - Whether to redirect to login on failure
     * @param {number} options.redirectDelay - Delay in ms before redirecting
     * @returns {Promise<boolean>} Authentication status
     */
    async verify(component, options = {}) {
        // Extract options with defaults
        const {
            onSuccess = null,
            onFailure = null,
            redirectOnFailure = true,
            redirectDelay = 1500
        } = options;
        
        // Skip check if already redirecting to prevent cascading redirects
        if (this._isRedirecting) {
            this._debug('Skipping auth check - redirect already in progress');
            return false;
        }
        
        // Verify API service is available
        if (!app || !app.API || !app.API.auth) {
            console.error('Auth service not available. Check if API is initialized.');
            return false;
        }
        
        try {
            this._debug('Performing authentication check');
            
            // Get authentication status and OAuth redirect status
            const isRecentOAuthRedirect = app.API.auth.isRecentOAuthRedirect();
            
            // If we're just after an OAuth redirect, skip the check to prevent loops
            if (isRecentOAuthRedirect) {
                this._debug('Detected recent OAuth redirect, skipping full auth check');
                
                // Call success callback
                if (onSuccess && typeof onSuccess === 'function') {
                    const userData = app.API.auth.getUserData();
                    onSuccess(userData);
                }
                
                return true;
            }
            
            // First try checking localStorage and sessionStorage
            let isAuthenticated = app.API.auth.isAuthenticated();
            this._debug(`Local storage auth check: ${isAuthenticated}`);
            
            // If local storage check fails, try server verification with cookies
            if (!isAuthenticated) {
                this._debug('Local storage auth failed, trying server verification');
                isAuthenticated = await app.API.auth.isAuthenticatedWithServerCheck();
                this._debug(`Server auth check: ${isAuthenticated}`);
            }
            
            // Store the current token values if authenticated
            if (isAuthenticated) {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');
                const userData = localStorage.getItem('userData');
                
                if (accessToken) this._lastKnownTokens.accessToken = accessToken;
                if (refreshToken) this._lastKnownTokens.refreshToken = refreshToken;
                if (userData) this._lastKnownTokens.userData = userData;
                
                this._debug('Stored current token values for recovery if needed');
                
                // Also make sure they're in sessionStorage for page reload protection
                if (accessToken) sessionStorage.setItem('accessToken', accessToken);
                if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
                if (userData) sessionStorage.setItem('userData', userData);
            }
            
            // Clean up any leftover OAuth authentication data from previous login attempts
            // OAuth (Open Authorization) data includes temporary codes and tokens used during
            // the authentication process with third-party services like 42 School
            if (localStorage.getItem('oauth_code')) {
                this._debug('Cleaning up stale OAuth authentication data');
                app.API.auth.cleanupOAuthData();
            }
            
            // Handle authentication failure
            if (!isAuthenticated) {
                this._debug('Authentication failed');
                
                // Call failure callback if provided
                if (onFailure && typeof onFailure === 'function') {
                    onFailure();
                }
                
                // Redirect to login if configured to do so
                if (redirectOnFailure) {
                    this._debug(`Will redirect to login in ${redirectDelay}ms`);
                    
                    // Show notification if component has toast
                    if (component && component.toastNotification) {
                        component.toastNotification.show({
                            title: 'Authentication Required',
                            message: 'Please log in to continue',
                            type: 'warning',
                            duration: redirectDelay
                        });
                    }
                    
                    // Don't redirect if we're already on login page
                    if (window.location.pathname === '/login') {
                        this._debug('Already on login page, not redirecting');
                        return false;
                    }
                    
                    // Set redirecting flag to prevent multiple redirects
                    this._isRedirecting = true;
                    
                    // Redirect after delay using app.state for SPA navigation
                    setTimeout(() => {
                        // Use app.state to navigate instead of window.location
                        // This prevents page reload and ensures SPA behavior
                        app.state.currentPage = '/login';
                        
                        // Reset the redirecting flag after navigation completes
                        setTimeout(() => {
                            this._isRedirecting = false;
                        }, 500);
                    }, redirectDelay);
                }
                
                return false;
            }
            
            // User is authenticated, call success callback if provided
            this._debug('Authentication successful');
            
            // Get user data
            const userData = app.API.auth.getUserData();
            
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(userData);
            }
            
            return true;
        } catch (error) {
            console.error('Error in AuthCheck.verify:', error);
            
            // Call failure callback if provided
            if (onFailure && typeof onFailure === 'function') {
                onFailure(error);
            }
            
            return false;
        }
    }
}

export default AuthCheck; 