let template = document.createElement("template");

template.innerHTML = /*html*/ `
<div id="login-page" class="loginPage" > <!-- take the whole window size -->
    <div  class="container">
      <form class="form shadow">
        <div class="form-header">
          <span>
            <img src="src/assets/images/42_logo.svg" alt="logo" />
          </span>
          <h2 class="title">Welcome back</h2>
          <p class="slugan">Enter you email and password to access your account</p>
        </div>
        <div class="form-body">
          <div class="form-group">
              <div class="form-field">
                <label for="email">Email</label>
                <input type="email" class="email" id="email" autofocus name="email" placeholder="Username or email" autocomplete="email" pattern=".+@[a-z]+.[a-z]"
                        title="Please provide only a Best Startup Ever corporate email address" required>
                <p class="error" id="email-error" hidden>Error</p>
              </div>
              <div class="form-field">
                <label for="password">Password</label>
                <input type="password" class="password" id="password" name="password" placeholder="Password" autocomplete="current-password" required minlength="10">
                <p class="error" id="password-error" hidden>Error</p>
              </div>
              <p class="password_forget">Forgot password?</p>
              <div class="form-field">
                <button class="btn_submit"  type="submit">Login</button>
              </div>
          </div>
        </div>
      </form>
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
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/login-page.css");
    this.shadow.appendChild(linkElem);
  }

  async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const emailError = this.shadow.querySelector('#email-error');
    const passwordError = this.shadow.querySelector('#password-error');

    try {
      console.log('Login attempt for:', email);
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login: email,
          password: password
        })
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        if (data.error) {
          emailError.textContent = data.error;
          emailError.hidden = false;
          passwordError.hidden = true;
        }
        return;
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // Redirect to dashboard or home page
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      emailError.textContent = 'An error occurred during login. Please try again.';
      emailError.hidden = false;
      passwordError.hidden = true;
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
