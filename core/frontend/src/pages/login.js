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
                <input type="email" class="email" id="email" autofocus name="email" placeholder="Username or email" autocomplete="email"
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
  #api = {
    BASE_URL: "https://localhost/api",
    async loginUser(userData) {
      try {
        const response = await fetch(`${this.BASE_URL}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: userData.email,
            password: userData.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Login error:', errorData);
          throw new Error(errorData.msg || 'Login failed');
        }

        return await response.json();
      } catch (error) {
        console.error('Error during login:', error);
        throw error;
      }
    }
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/login-page.css");
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    this.setFormBinding(this.shadow.querySelector("form"));

    // Ensure the element exists before adding the event listener
    const btn42Network = this.shadow.querySelector('.btn_42Network');
    if (btn42Network) {
      btn42Network.addEventListener('click', () => {
        // Redirect to the 42 OAuth authorization URL
        window.location.href = 'https://localhost/api/auth/42/';
      });
    } else {
      console.error('42 Network button not found');
    }
  }

  setFormBinding(form) {
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
          email: form.querySelector("#email").value,
          password: form.querySelector("#password").value,
        };

        try {
          const responseData = await this.#api.loginUser(userData);
          console.log('Login successful:', responseData);
          window.location.href = "/home";
        } catch (error) {
          console.error('Login failed:', error);
          alert('Login failed: ' + error.message);
        }
      });
    }
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("login-page", LOGIN);

export default LOGIN;
