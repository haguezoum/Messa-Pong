import { notificationStyles } from '../components/notification-styles.js';
import { ToastNotification } from '../components/toast-notification.js';
import api from '../services/API.js';
import Auth from '../services/Auth.js';

let template = document.createElement("template");

template.innerHTML = /*html*/ `
<div id="login-page" class="loginPage">
    <div class="container">
      <form class="form shadow">
        <div class="form-header">
          <span>
            <img src="src/assets/images/42_logo.svg" alt="logo" />
          </span>
          <h2 class="title">Welcome back</h2>
          <p class="slugan">Enter your email/username and password to access your account</p>
        </div>
        <div class="form-body">
          <div class="form-group">
              <div class="form-field">
                <label for="login">Email or Username</label>
                <input type="text" class="login" id="login" autofocus name="login" 
                       placeholder="Email or username" required>
              </div>
              <div class="form-field">
                <label for="password">Password</label>
                <input type="password" class="password" id="password" name="password" 
                       placeholder="Password" required>
              </div>
              <p class="password_forget">Forgot password?</p>
              <div class="form-field">
                <button class="btn_submit" type="submit">Login</button>
              </div>
          </div>
        </div>
      </form>
      <div id="notification" class="notification"></div>
      <div class="form-footer">
        <p>Or sign in with</p>
        <div class="remote-login">
            <button class="btn_42Network" role="button">
               <img class="img_btn" src="src/assets/images/42_logo.svg" alt="42 Network"/>
            </button>
            <button class="btn_google" role="button">
              <img  class="img_btn" src="src/assets/images/white-google-logo.png" alt="google"/>
            </button>
        </div>
        <div class="signup">
          <p>
            <router-link to="/signup" kind="route">
               <span slot="title"> Don't have an account? Sign up</span>
               <span slot="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                </svg>
               </span>
            </router-link>
          </p>
        </div>
      </div>
    </div>
    <cloud-moving></cloud-moving>
  </div>
`;

class LOGIN extends HTMLElement {
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
    linkElem.setAttribute("href", "src/assets/style/login-page.css");
    this.shadow.appendChild(linkElem);

    // Add toast notification
    this.toastNotification = document.createElement('toast-notification');
    this.shadow.appendChild(this.toastNotification);
  }

  async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const login = form.querySelector('#login').value;
    const password = form.querySelector('#password').value;

    try {
      // Disable form submission while processing
      const submitButton = form.querySelector('.btn_submit');
      if (submitButton) {
        submitButton.disabled = true;
      }

      const response = await api.post('/api/login/', {
        login,
        password
      });

      // Handle successful login
      if (response && response.tokens) {
        // Store tokens and user data
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        // Show success message
        this.toastNotification.show({
          title: 'Welcome Back!',
          message: 'Login successful! Redirecting...',
          type: 'success',
          duration: 2000
        });

        // Clear form
        form.reset();

        // Redirect after success message using app state
        setTimeout(() => {
          if (window.app && window.app.state) {
            window.app.state.currentPage = "/home";
          } else {
            console.warn("Global app state not found, falling back to default navigation");
            window.location.href = '/home';
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.toastNotification.show({
        title: 'Login Failed',
        message: error.detail || error.error || 'Invalid credentials. Please try again.',
        type: 'error',
        duration: 4000
      });
    } finally {
      // Re-enable the submit button
      const submitButton = form.querySelector('.btn_submit');
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  connectedCallback() {
    console.log("LOGIN is Connected");
    const form = this.shadow.querySelector('form');
    form.addEventListener('submit', (e) => this.handleLogin(e));

    // Handle 42 Network login
    const btn42Network = this.shadow.querySelector('.btn_42Network');
    btn42Network.addEventListener('click', async () => {
      try {
        const response = await Auth.loginWith42();
        if(response){
          this.toastNotification.show({
            title: 'Login Successful',
            message: 'Redirecting to home...',
            type: 'success',
            duration: 2000
          });
          setTimeout(() => {
            app.state.currentPage = '/home';
          }, 1000);
        }
      } catch (error) {
        console.error('42 login error:', error);
        this.toastNotification.show({
          title: 'Login Error',
          message: 'Failed to initiate 42 login. Please try again.',
          type: 'error',
          duration: 4000
        });
      }
    });

    // Handle Google login
    const btnGoogle = this.shadow.querySelector('.btn_google');
    btnGoogle.addEventListener('click', () => {
      window.location.href = '/api/oauth/google/login/';
    });
  }

  disconnectedCallback() {
    console.log("LOGIN is Disconnected");
    const form = this.shadow.querySelector('form');
    form.removeEventListener('submit', this.handleLogin);
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }
}
customElements.define("login-page", LOGIN);

export default LOGIN;
