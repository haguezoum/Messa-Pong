import appState from "../services/State.js";

let template = document.createElement("template");
template.innerHTML = /*html*/ `
<div id="login-page" class="loginPage">
    <div class="container">
      <form class="form shadow">
        <div class="form-header">
          <span><img src="/src/assets/images/42_logo.svg" alt="logo" /></span>
          <h2 class="title">Login Page</h2>
          <p class="slugan">Enter your email or username and password to access your account</p>
        </div>
        <div class="form-body">
          <div class="form-group">
              <div class="form-field">
                <label for="identifier">Email or Username</label>
                <input type="text" class="identifier" id="identifier" autofocus name="identifier" 
                       placeholder="Email or Username" autocomplete="email username" 
                       title="Enter your email or username" required 
                       aria-describedby="identifier-error">
                <p class="error" id="identifier-error" hidden>Please enter a valid email or username.</p>
              </div>
              <div class="form-field">
                <label for="password">Password</label>
                <input type="password" class="password" id="password" name="password" 
                       placeholder="Password" autocomplete="current-password" required minlength="10" 
                       aria-describedby="password-error">
                <p class="error" id="password-error" hidden>Password must be at least 10 characters long.</p>
              </div>
              <p class="password_forget"><a href="/forgot-password">Forgot password?</a></p>
              <div class="form-field">
                <button class="btn_submit" type="submit">
                  <span class="btn-text">Login</span>
                  <span class="spinner" hidden></span>
                </button>
              </div>
              <div class="form-field">
                <p class="api-message" id="api-message" hidden></p>
              </div>
          </div>
        </div>
      </form>
      <div class="form-footer">
        <p>Or sign in with</p>
        <div class="remote-login">
            <button class="btn_42Network" role="button">
               <img class="img_btn" src="/src/assets/images/42_logo.svg" alt="42 Network"/>
            </button>
            <button class="btn_google" role="button">
              <img class="img_btn" src="/src/assets/images/white-google-logo.png" alt="Google"/>
            </button>
        </div>
        <div class="signup">
          <p>
            <router-link to="/signup" kind="route">
               <span slot="title">Don't have an account? Sign up</span>
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

class LoginPage extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "preload");
    linkElem.setAttribute("as", "style");
    linkElem.setAttribute("onload", "this.onload=null;this.rel='stylesheet'");
    linkElem.setAttribute("href", "/src/assets/style/login-page.css");
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    this.setFormBinding(this.shadow.querySelector("form"));
    this.setupOAuthButtons();
  }

  disconnectedCallback() {
    console.log("LoginPage is Disconnected");
  }

  static storeTokens(refresh, access) {
    try {
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('access_token', access);
      console.log('Tokens stored successfully:', {
        refresh: localStorage.getItem('refresh_token')?.slice(0, 10) + '...',
        access: localStorage.getItem('access_token')?.slice(0, 10) + '...',
      });
    } catch (error) {
      console.error('Failed to store tokens in localStorage:', error);
    }
  }

  static async checkAuthentication() {
    try {
      const accessToken = localStorage.getItem('access_token');
      console.log('Checking authentication with token:', accessToken?.slice(0, 10) + '...');
      const response = await fetch('https://localhost/api/auth/is_authenticated/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken || ''}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Authentication check passed');
        return true;
      } else {
        console.log('Authentication check failed:', response.status, await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async handleOAuthLogin(provider) {
    const authUrl = provider === '42'
      ? 'https://localhost/api/auth/42/login/'
      : 'https://localhost/api/auth/google/login/';
    console.log(`Initiating ${provider} OAuth login`);
    window.location.href = authUrl;
  }

  setupOAuthButtons() {
    const btn42Network = this.shadow.querySelector('.btn_42Network');
    if (btn42Network) {
      btn42Network.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleOAuthLogin('42');
      });
    } else {
      console.error('42 Network button not found');
    }

    const btnGoogle = this.shadow.querySelector('.btn_google');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleOAuthLogin('google');
      });
    } else {
      console.error('Google button not found');
    }
  }

  showMessage(message, type = "error") {
    const messageElement = this.shadow.querySelector("#api-message");
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = `api-message ${type}`;
      messageElement.hidden = false;
      setTimeout(() => (messageElement.hidden = true), 5000);
    }
  }

  setFormBinding(form) {
    if (!form) return;

    const errors = {
      identifier: this.shadow.querySelector("#identifier-error"),
      password: this.shadow.querySelector("#password-error"),
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        this.shadow.querySelector(".loginPage").classList.add("shake");
        setTimeout(() => this.shadow.querySelector(".loginPage").classList.remove("shake"), 155);
        return;
      }

      const submitButton = form.querySelector(".btn_submit");
      const originalText = submitButton.querySelector(".btn-text").textContent;
      submitButton.querySelector(".btn-text").textContent = "Logging in...";
      submitButton.querySelector(".spinner").hidden = false;
      submitButton.disabled = true;

      try {
        const identifierValue = form.querySelector("#identifier").value.trim();
        const isEmail = identifierValue.includes('@');
        const userData = {
          [isEmail ? 'email' : 'username']: identifierValue,
          password: form.querySelector("#password").value,
        };

        const response = await fetch('https://localhost/api/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Login failed: ${errorText}`);
        }

        const data = await response.json();
        console.log('Form login response:', data);

	if (data.status === '2fa_required') {
	  localStorage.setItem('temporary_token', data.temporary_token);
	  console.log('Temporary token stored:', data.temporary_token);
	  this.showMessage("2FA required. Redirecting to verification...", "info");
	  appState.currentPage = '/tfa';
	  window.dispatchEvent(new CustomEvent('stateChanged', { detail: { value: '/tfa' } }));
        } else {
          LoginPage.storeTokens(data.refresh, data.access);
          this.showMessage("Login successful! Redirecting...", "success");
          form.reset();
          appState.currentPage = '/home';
          window.dispatchEvent(new CustomEvent('stateChanged', { detail: { value: '/home' } }));
        }
      } catch (error) {
        console.error('Form login error:', error);
        this.showMessage(error.message || "Login failed. Please check your credentials.", "error");
        submitButton.querySelector(".btn-text").textContent = originalText;
        submitButton.querySelector(".spinner").hidden = true;
        submitButton.disabled = false;
      }
    });

    Array.from(form.elements).forEach((element) => {
      if (element.name) {
        element.addEventListener("input", () => {
          const error = errors[element.name];
          if (!element.validity.valid && element.value !== "") {
            error.hidden = false;
          } else {
            error.hidden = true;
            element.setCustomValidity("");
          }
        });

        ["input", "change", "paste"].forEach((event) => {
          element.addEventListener(event, () => {
            form.checkValidity()
              ? form.querySelector(".btn_submit").classList.add("active")
              : form.querySelector(".btn_submit").classList.remove("active");
          });
        });
      }
    });
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("login-page", LoginPage);
export default LoginPage;
