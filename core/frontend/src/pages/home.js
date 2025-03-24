import { notificationStyles } from '../components/notification-styles.js';
import { ToastNotification } from '../components/toast-notification.js';
import Auth from '../services/Auth.js';

let template = document.createElement("template");

template.innerHTML = /*html*/ `
<div id="home-page" class="homePage">
    <div class="container">
        <header-bar></header-bar>
        <main class="grid-layout">
            <div class="grid-item" id="play-now" data-target="game">
                <img class="selectCardImage" src="src/assets/images/pingpongPlayer.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Play now</h3>
                    <span class="play-btn action-btn">
                        <ion-icon name="play-circle-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="my-store" data-target="store">
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/store.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">My Store</h3>
                    <span class="store-btn action-btn">
                        <ion-icon name="storefront-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="dashboard" data-target="dashboard">
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/my_dashboard.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Dashboard</h3>
                    <span class="dashboard-btn action-btn">
                        <ion-icon name="apps-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="chat-space" data-target="chat">
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/chat.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Chat space</h3>
                    <span class="dashboard-btn action-btn">
                        <ion-icon name="chatbubbles-outline"></ion-icon>
                    </span>
                </div>
            </div>
        </main>
        <div id="login-status-display"></div>
    </div>
    <cloud-moving cloudCount="10"></cloud-moving>
</div>
`;

class HOME extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.appendChild(template.content.cloneNode(true));
        
        // Add notification styles
        const styleSheet = document.createElement("style");
        styleSheet.textContent = notificationStyles;
        this.shadow.appendChild(styleSheet);
        
        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "src/assets/style/home-page.css");
        this.shadow.appendChild(linkElem);

        // Add toast notification
        this.toastNotification = document.createElement('toast-notification');
        this.shadow.appendChild(this.toastNotification);
        
        // Add debug style
        const debugStyle = document.createElement("style");
        debugStyle.textContent = `
            #login-status-display {
                margin-top: 20px;
                padding: 15px;
                border-radius: 5px;
                background-color: rgba(0,0,0,0.1);
                font-family: monospace;
                font-size: 14px;
                max-height: 200px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-all;
            }
        `;
        this.shadow.appendChild(debugStyle);
    }

    connectedCallback() {
        console.log("HOME is Connected");
        console.log("Current URL:", window.location.href);
        
        // Status display for debugging
        const statusDisplay = this.shadow.getElementById('login-status-display');
        
        // Debug information
        const debugInfo = [
            `HOME Page Loaded: ${new Date().toISOString()}`,
            `URL: ${window.location.href}`,
            `Search: ${window.location.search}`
        ];
        
        // Handle OAuth callback data
        this.processOAuthCallback(statusDisplay, debugInfo);
        
        // Initialize page components
        this.initPageComponents();
    }
    
    processOAuthCallback(statusDisplay, debugInfo) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const data = urlParams.get('data');
            
            debugInfo.push(`URL has 'data' param: ${!!data}`);
            
            if (data) {
                debugInfo.push(`Data param length: ${data.length}`);
                try {
                    // Attempt to decode and parse the data
                    const decodedData = JSON.parse(decodeURIComponent(data));
                    debugInfo.push(`Successfully decoded data`);
                    
                    if (!decodedData.tokens || !decodedData.user) {
                        throw new Error('Invalid callback data structure');
                    }
                    
                    // Store tokens and user data in cookies
                    debugInfo.push(`Setting accessToken cookie...`);
                    Auth.setCookie('accessToken', decodedData.tokens.access);
                    
                    debugInfo.push(`Setting refreshToken cookie...`);
                    Auth.setCookie('refreshToken', decodedData.tokens.refresh);
                    
                    debugInfo.push(`Setting userData cookie...`);
                    Auth.setCookie('userData', JSON.stringify(decodedData.user));
                    
                    // Verify cookies were set correctly
                    setTimeout(() => {
                        const accessTokenCookie = Auth.getCookie('accessToken');
                        const refreshTokenCookie = Auth.getCookie('refreshToken');
                        const userDataCookie = Auth.getCookie('userData');
                        
                        debugInfo.push(`Verification - Access token cookie: ${!!accessTokenCookie}`);
                        debugInfo.push(`Verification - Refresh token cookie: ${!!refreshTokenCookie}`);
                        debugInfo.push(`Verification - User data cookie: ${!!userDataCookie}`);
                        
                        if (statusDisplay) {
                            statusDisplay.textContent = debugInfo.join('\n');
                        }
                    }, 500);
                    
                    debugInfo.push(`Stored tokens and user data for: ${decodedData.user.username}`);
                    
                    this.toastNotification.show({
                        title: 'Welcome!',
                        message: `Successfully logged in as ${decodedData.user.username}`,
                        type: 'success',
                        duration: 3000
                    });

                    // Clean up the URL
                    window.history.replaceState({}, document.title, '/home');
                    debugInfo.push(`URL cleaned up`);
                } catch (error) {
                    debugInfo.push(`Error decoding data: ${error.message}`);
                    console.error('Error processing callback data:', error);
                    this.toastNotification.show({
                        title: 'Error',
                        message: 'Failed to process login response: ' + error.message,
                        type: 'error',
                        duration: 4000
                    });
                }
            } else {
                debugInfo.push(`No callback data found, checking authentication status`);
                // Check if user is already logged in, but wait to ensure any redirects have completed
                setTimeout(() => {
                    this.checkAuthenticationStatus();
                    console.log("checkAuthenticationStatus");
                }, 500);
                return; // Return early to prevent the immediate authentication check
            }
        } catch (error) {
            debugInfo.push(`Critical error in processOAuthCallback: ${error.message}`);
            console.error('Critical error:', error);
        }
        
        // Update status display
        if (statusDisplay) {
            statusDisplay.textContent = debugInfo.join('\n');
        }
    }
    
    checkAuthenticationStatus(debugInfo = []) {
        const isAuthenticated = Auth.isAuthenticated();
        debugInfo.push(`Auth.isAuthenticated() result: ${isAuthenticated}`);
        
        // Get separate state items for debugging
        const userData = Auth.getCookie('userData');
        const accessToken = Auth.getCookie('accessToken');
        const oauthCode = Auth.getCookie('oauth_code');
        const oauthTimestamp = Auth.getCookie('oauth_callback_timestamp');
        
        debugInfo.push(`User data in cookies: ${!!userData}`);
        debugInfo.push(`Access token in cookies: ${!!accessToken}`);
        debugInfo.push(`OAuth code in cookies/session: ${!!oauthCode}`);
        
        // If we have an OAuth code but no authentication tokens yet, we need to handle the callback
        if (oauthCode && !isAuthenticated) {
            const timestamp = parseInt(oauthTimestamp, 10);
            const currentTime = Date.now();
            const timeDiff = currentTime - timestamp;
            
            debugInfo.push(`OAuth code present but not authenticated. Code age: ${timeDiff}ms`);
            
            // If the OAuth code is recent (less than 10 seconds old), try to exchange it for tokens
            if (timeDiff < 10000) {
                debugInfo.push(`Recent OAuth code detected, attempting to exchange it for tokens...`);
                
                // Call the backend to exchange the code for tokens if needed
                fetch('/api/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${Auth.getCookie('accessToken')}`
                    },
                    body: JSON.stringify({ code: oauthCode }),
                    credentials: 'include',
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to exchange code for tokens');
                    }
                }).then(data => {
                    debugInfo.push(`Successfully exchanged code for tokens`);
                    
                    // Tokens should be set as cookies by the server, but we can set user data here
                    if (data.user) {
                        Auth.setCookie('userData', JSON.stringify(data.user));
                    }
                    
                    // Refresh the page to update auth state
                    window.location.reload();
                }).catch(error => {
                    debugInfo.push(`Error exchanging code for tokens: ${error.message}`);
                    console.error('Error exchanging OAuth code:', error);
                    
                    // Clean up the stale OAuth code
                    Auth.deleteCookie('oauth_code');
                    Auth.deleteCookie('oauth_callback_timestamp');
                    sessionStorage.removeItem('oauth_code');
                    sessionStorage.removeItem('oauth_callback_timestamp');
                });
                
                // Show a waiting message
                this.toastNotification.show({
                    title: 'Processing Login',
                    message: 'Completing your authentication...',
                    type: 'info',
                    duration: 4000
                });
                
                return; // Wait for the token exchange to complete
            } else {
                // Clean up old OAuth data
                debugInfo.push(`OAuth code is stale, cleaning up`);
                Auth.deleteCookie('oauth_code');
                Auth.deleteCookie('oauth_callback_timestamp');
                sessionStorage.removeItem('oauth_code');
                sessionStorage.removeItem('oauth_callback_timestamp');
            }
        }
        
        if (!isAuthenticated) {
            debugInfo.push(`User not authenticated, redirecting to login`);
            // Redirect to login if not authenticated
            this.toastNotification.show({
                title: 'Authentication Required',
                message: 'Please log in to continue',
                type: 'warning',
                duration: 2000
            });
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            debugInfo.push(`User is authenticated`);
            // Parse user data
            try {
                if (userData) {
                    const user = JSON.parse(userData);
                    debugInfo.push(`User info: ${user.username}`);
                } else {
                    debugInfo.push(`No user data available despite being authenticated`);
                }
            } catch (error) {
                debugInfo.push(`Error parsing user data: ${error.message}`);
                console.error("Error parsing user data:", error);
            }
        }
    }
    
    initPageComponents() {
        // Add event listeners to grid items
        const gridItems = this.shadow.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                console.log(`Navigating to: ${target}`);
                app.state.currentPage = `/${target}`;
            });
        });
    }

    disconnectedCallback() {
        console.log("HOME is Disconnected");
        // Remove event listeners
        const gridItems = this.shadow.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });
    }
}

customElements.define("home-page", HOME);

export default HOME;