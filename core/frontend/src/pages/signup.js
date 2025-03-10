let template = document.createElement("template");

template.innerHTML =
  /*html*/
  `<div id="signup-page" class="signupPage"> <!-- take the whole window size -->
    <div  class="container">
      <form class="form shadow" novalidate>
        <div class="form-header">
          <span>
            <img src="src/assets/images/42_logo.svg" alt="logo" />
          </span>
          <h2 class="title">Hey there 👋🏽</h2>
          <p class="slugan">sign up now and get full access to our game !</p>
        </div>
        <div class="form-body">
          <div class="form-group">
              <!-- first name -->
              <div class="form-field">
                <label for="firstname">First Name</label>
                <input type="text" class="firstname" id="firstname" autofocus name="firstname" placeholder="Firstname" autocomplete="given-name" pattern="[a-zA-Z]{3,20}"
                        title="Enter your first name" required tabindex="1">
                <p class="error" id="firstname-error" hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                  </svg>
                Please choose a firstname !</p>
              </div>
              <!-- last name -->
              <div class="form-field">
                <label for="lastname">Last Name</label>
                <input type="text" class="lastname" id="lastname" name="lastname" placeholder="lastname" autocomplete="family-name" pattern="[a-zA-Z]{3,20}"
                        title="Enter your last name" required tabindex="2">
                <p class="error" id="lastname-error" hidden>Please choose a lastname !</p>
              </div>
              <!-- username -->
              <div class="form-field">
                <label for="username">Username</label>
                <input type="text" class="username" id="username" name="username" placeholder="username" autocomplete="username" pattern="[a-zA-Z0-9]{2,20}"
                        title="Chose a username" required tabindex="2">
                <p class="error" id="username-error" hidden>Please choose a username !</p>
              </div>
              <!-- user email -->
              <div class="form-field">
                <label for="email">Email</label>
                <input type="email" class="email" id="email" name="email" placeholder="Username or email" autocomplete="email" pattern=".+@.[a-z]+\.[a-z]{2,4}"
                        title="Enter your email address" required tabindex="4">
                <p class="error" id="email-error" hidden>Please choose a valid email !</p>
              </div>
              <!-- password -->
              <div class="form-field">
                <label for="password">Password</label>
                <input type="password" class="password" id="password" name="password" placeholder="Password" autocomplete="current-password" required minlength="10" tabindex="5" pattern=".{7,200}">
                <p class="error" id="password-error" hidden>Please choose  strong Password !</p>
              </div>
              <!-- confirm password -->
              <div class="form-field">
                <label for="confirm_password">Confirme Password</label>
                <input type="password" class="password" id="confirm_password" name="confirm_password" placeholder="Password" autocomplete="current-password" required minlength="10" tabindex="6" pattern=".{7,200}">
                <p class="error" id="confirm_password-error" hidden>not the same Password !</p>
              </div>

              <div class="form-field">
                <button class="btn_submit"  type="submit" tabindex="7">Login</button>
              </div>
          </div>
        </div>
      </form>
      <div class="form-footer">
        <p>Or sign in with</p>
        <div class="remote-login">
            <button class="btn_42Network" role="button" tabindex="8">
               <img class="img_btn" src="src/assets/images/42_logo.svg" alt="42 Network"/>
            </button>
            <button class="btn_google" role="button" tabindex="9">
              <img  class="img_btn" src="src/assets/images/white-google-logo.png" alt="google"/>
            </button>
        </div>
        <div class="signup">
          <p>
            <router-link to="/login" kind="route" tabindex="10" >
               <span slot="title"> Already have an account ? Login</span>
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
  </div>`;


class SIGNUP extends HTMLElement {
  #newUser = {
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  };
  
  constructor() {
    super(); 
    
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "preload");
    linkElem.setAttribute("as", "style");
    linkElem.setAttribute("onload", "this.onload=null;this.rel='stylesheet'");
    linkElem.setAttribute("href", "src/assets/style/signup-page.css");
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(linkElem);
    this.shadow.appendChild(template.content.cloneNode(true));
    this.setFormBinging(this.shadow.querySelector("form"));
  }

  async handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    
    // Validate passwords match
    if (this.#newUser.password !== this.#newUser.confirm_password) {
      this.errors.confirm_password.hidden = false;
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: this.#newUser.firstname,
          last_name: this.#newUser.lastname,
          username: this.#newUser.username,
          email: this.#newUser.email,
          password: this.#newUser.password,
          password2: this.#newUser.confirm_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        Object.keys(data).forEach(key => {
          if (this.errors[key]) {
            this.errors[key].textContent = Array.isArray(data[key]) ? data[key][0] : data[key];
            this.errors[key].hidden = false;
          }
        });
        return;
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', data.tokens.access);
      localStorage.setItem('refreshToken', data.tokens.refresh);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Signup error:', error);
      // Show general error message
      Object.values(this.errors).forEach(error => {
        error.hidden = true;
      });
      this.errors.email.textContent = 'An error occurred during registration. Please try again.';
      this.errors.email.hidden = false;
    }
  }

  setFormBinging(form) {
    this.errors = {
      firstname: this.shadow.querySelector("#firstname-error"),
      lastname: this.shadow.querySelector("#lastname-error"),
      username: this.shadow.querySelector("#username-error"),
      email: this.shadow.querySelector("#email-error"),
      password: this.shadow.querySelector("#password-error"),
      confirm_password: this.shadow.querySelector("#confirm_password-error"),
    };
    
    if (form) {
      form.addEventListener("submit", (event) => this.handleSignup(event));
    }

    this.#newUser = new Proxy(this.#newUser, {
      set: (target, key, value) => {
        target[key] = value;
        form.elements[key].value = value;
        return true;
      },
    });

    Array.from(form.elements).forEach((element) => {
      if (element.name) {
        element.addEventListener("change", () => {
          const error = this.errors[element.name];
          if (element.name === "confirm_password") {
            if (element.value !== form.elements["password"].value) {
              error.hidden = false;
              element.setCustomValidity("Passwords do not match!");
              return;
            }
          } else if (element.validity.valid || element.value === "") {
            error.hidden = true;
            element.setCustomValidity("");
            return;
          } else {
            error.hidden = false;
            return;
          }
          error.hidden = true;
          element.setCustomValidity("");
          this.#newUser[element.name] = element.value;
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

  connectedCallback() {
    console.log("SIGNUP is Connected");
    
    // Handle 42 Network signup
    const btn42Network = this.shadow.querySelector('.btn_42Network');
    btn42Network.addEventListener('click', () => {
      window.location.href = 'http://localhost:8000/api/oauth/42/login/';
    });

    // Handle Google signup
    const btnGoogle = this.shadow.querySelector('.btn_google');
    btnGoogle.addEventListener('click', () => {
      window.location.href = 'http://localhost:8000/api/oauth/google/login/';
    });
  }

  disconnectedCallback() {
    console.log("SIGNUP is Disconnected");
    const form = this.shadow.querySelector('form');
    if (form) {
      form.removeEventListener("submit", this.handleSignup);
    }
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

  get newUser() {
    return this.#newUser;
  }
}
customElements.define("signup-page", SIGNUP);

export default SIGNUP;
