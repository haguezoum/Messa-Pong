/**
 * OAuth Callback Page
 * Handles redirects from OAuth providers (42 Network, Google, etc.)
 */

import authUtils from '../utils/auth.js';
import Auth from '../services/Auth.js';

let template = document.createElement("template");
template.innerHTML = /*html*/ `
<style>
  .oauth-callback-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 1rem;
    background-color: var(--dead-blue);
  }
  
  .card {
    background-color: white;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
  }
  
  .title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--primary-black);
  }
  
  .message {
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--alive-blue);
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error {
    color: var(--primary-danger);
    margin: 1rem 0;
  }
</style>

<div class="oauth-callback-container">
  <div class="card">
    <h1 class="title">Authenticating...</h1>
    <div class="spinner"></div>
    <p class="message">Please wait while we complete your authentication with 42 Network.</p>
    <p id="error-message" class="error" hidden></p>
  </div>
</div>
`;

class OAuthCallback extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    try {
      // Get code and state from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code) {
        this.showError("No authorization code received from 42 Network. Please try again.");
        return;
      }
      
      // Process OAuth tokens from the URL
      const success = await Auth.handleOAuth42Callback(code, state);
      
      if (!success) {
        this.showError("Failed to authenticate with 42 Network. Please try again.");
        return;
      }
      
      // Verify authentication and get user info
      const isAuthenticated = await Auth.isAuthenticated();
      
      if (!isAuthenticated) {
        this.showError("Authentication failed. Please try again.");
        return;
      }
      
      // Update UI to show success
      this.shadow.querySelector('.title').textContent = "Login Successful!";
      this.shadow.querySelector('.message').textContent = "You have successfully logged in. Redirecting to your profile...";
      
      // Redirect to profile page after a brief delay
      setTimeout(() => {
        window.location.href = '/#/profile';
      }, 1500);
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      this.showError("An error occurred during authentication. Please try again.");
    }
  }
  
  showError(message) {
    const errorElement = this.shadow.querySelector('#error-message');
    errorElement.textContent = message;
    errorElement.hidden = false;
    this.shadow.querySelector('.spinner').style.display = 'none';
    this.shadow.querySelector('.title').textContent = "Authentication Failed";
    
    // Add retry button
    const button = document.createElement('button');
    button.textContent = "Return to Login";
    button.style.padding = "10px 20px";
    button.style.marginTop = "20px";
    button.style.cursor = "pointer";
    button.style.backgroundColor = "var(--alive-blue)";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    
    button.addEventListener('click', () => {
      app.state.currentPage = '/login';
    });
    
    this.shadow.querySelector('.card').appendChild(button);
  }
}

customElements.define("oauth-callback-page", OAuthCallback);
export default OAuthCallback; 