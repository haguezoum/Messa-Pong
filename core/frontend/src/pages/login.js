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

// Add notification styles to the existing CSS
const styles = /*css*/ `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(150%);
    transition: transform 0.3s ease-in-out;
  }

  .notification.show {
    transform: translateX(0);
  }

  .notification.error {
    background-color: #ff4444;
    box-shadow: 0 4px 15px rgba(255, 68, 68, 0.2);
  }

  .notification.success {
    background-color: #00C851;
    box-shadow: 0 4px 15px rgba(0, 200, 81, 0.2);
  }

  @keyframes slideIn {
    from { transform: translateX(150%); }
    to { transform: translateX(0); }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

class LOGIN extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
    
    // Add styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    this.shadow.appendChild(styleSheet);
    
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/login-page.css");
    this.shadow.appendChild(linkElem);
  }

  showNotification(message, type = 'error') {
    const notification = this.shadow.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    // Trigger animation
    notification.style.animation = 'slideIn 0.3s forwards';

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        notification.classList.remove('show');
        notification.className = 'notification';
      }, 300);
    }, 3000);
  }

  async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const login = form.querySelector('#login').value;
    const password = form.querySelector('#password').value;

    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'An error occurred during login.';
        if (data.error) {
          errorMessage = data.error;
        } else if (data.errors) {
          errorMessage = Object.values(data.errors)[0];
        }
        this.showNotification(errorMessage, 'error');
        return;
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', data.tokens.access);
      localStorage.setItem('refreshToken', data.tokens.refresh);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // Show success message before redirect
      this.showNotification('Login successful! Redirecting...', 'success');

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      this.showNotification('Network error. Please try again.', 'error');
    }
  }

  connectedCallback() {
    console.log("LOGIN is Connected");
    const form = this.shadow.querySelector('form');
    form.addEventListener('submit', (e) => this.handleLogin(e));

    // Handle 42 Network login
    const btn42Network = this.shadow.querySelector('.btn_42Network');
    btn42Network.addEventListener('click', () => {
      window.location.href = '/api/oauth/42/login/';
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
