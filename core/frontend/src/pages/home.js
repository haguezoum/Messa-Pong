import { notificationStyles } from '../components/notification-styles.js';
import { ToastNotification } from '../components/toast-notification.js';

let template = document.createElement("template");

template.innerHTML = /*html*/ `
<div id="home-page" class="homePage">
    <div class="container">
        <h1>Welcome to ft_transcendence</h1>
        <div id="user-info"></div>
    </div>
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
        
        // Add toast notification
        this.toastNotification = document.createElement('toast-notification');
        this.shadow.appendChild(this.toastNotification);
    }

    connectedCallback() {
        console.log("HOME is Connected");
        
        // Handle OAuth callback data
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        if (data) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(data));
                if (!decodedData.tokens || !decodedData.user) {
                    throw new Error('Invalid callback data');
                }
                
                // Store tokens and user data
                localStorage.setItem('accessToken', decodedData.tokens.access);
                localStorage.setItem('refreshToken', decodedData.tokens.refresh);
                localStorage.setItem('userData', JSON.stringify(decodedData.user));
                
                // Display user info
                const userInfo = this.shadow.querySelector('#user-info');
                userInfo.innerHTML = `
                    <h2>Welcome, ${decodedData.user.first_name} ${decodedData.user.last_name}!</h2>
                    <p>Email: ${decodedData.user.email}</p>
                    <p>Username: ${decodedData.user.username}</p>
                `;
                
                this.toastNotification.show({
                    title: 'Welcome!',
                    message: 'Successfully logged in with 42',
                    type: 'success',
                    duration: 3000
                });

                // Clean up the URL
                window.history.replaceState({}, document.title, '/home');
            } catch (error) {
                console.error('Error processing callback data:', error);
                this.toastNotification.show({
                    title: 'Error',
                    message: 'Failed to process login response',
                    type: 'error',
                    duration: 4000
                });
            }
        } else {
            // Check if user is already logged in
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                const userInfo = this.shadow.querySelector('#user-info');
                userInfo.innerHTML = `
                    <h2>Welcome back, ${user.first_name} ${user.last_name}!</h2>
                    <p>Email: ${user.email}</p>
                    <p>Username: ${user.username}</p>
                `;
            } else {
                // Redirect to login if not authenticated
                window.location.href = '/login';
            }
        }
    }

    disconnectedCallback() {
        console.log("HOME is Disconnected");
    }
}

customElements.define("home-page", HOME);

export default HOME;