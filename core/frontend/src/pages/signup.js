import { notificationStyles } from '../components/notification-styles.js';

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
    <div class="notification-container"></div>
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
    
    // Add notification styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = notificationStyles;
    this.shadow.appendChild(styleSheet);
  }

  showNotification(message, type = 'error', duration = 3000) {
    // Clear any existing notifications first
    const container = this.shadow.querySelector('.notification-container');
    container.innerHTML = '';

    const notification = document.createElement('div');
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="icon">${icon}</span>
        <span class="message">${message}</span>
        <span class="close-btn">✕</span>
    `;

    container.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Add shake effect for errors
    if (type === 'error') {
        notification.classList.add('shake');
    }

    // Handle close button
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    });

    // Auto remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, duration);
  }

  async handleSignup(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
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
            if (data.errors) {
                Object.entries(data.errors).forEach(([field, error], index) => {
                    setTimeout(() => {
                        this.showNotification(
                            typeof error === 'string' ? error : error[0],
                            'error',
                            4000
                        );
                    }, index * 400);
                });
            } else if (data.error) {
                this.showNotification(data.error, 'error', 4000);
            }
            return;
        }

        // Registration successful
        this.showNotification('Registration successful! Redirecting to login...', 'success', 2000);

        // Clear form
        event.target.reset();

        // Store user data if needed
        if (data.tokens) {
            localStorage.setItem('accessToken', data.tokens.access);
            localStorage.setItem('refreshToken', data.tokens.refresh);
            localStorage.setItem('userData', JSON.stringify(data.user));
        }

        // Redirect to login after a delay
        setTimeout(() => {
            window.location.href = '/login';  // Direct URL navigation instead of event
        }, 2500);

    } catch (error) {
        console.error('Registration error:', error);
        this.showNotification('Registration failed. Please try again.', 'error', 4000);
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
        if (form.elements[key]) {
          form.elements[key].value = value;
        }
        return true;
      },
    });

    Array.from(form.elements).forEach((element) => {
      if (element.name) {
        element.addEventListener("input", () => {
          // Store the value in the newUser object first
          this.#newUser[element.name] = element.value;
          
          const error = this.errors[element.name];
          
          // Handle password confirmation
          if (element.name === "confirm_password" || element.name === "password") {
            const password = form.elements["password"].value;
            const confirmPassword = form.elements["confirm_password"].value;
            
            if (confirmPassword && password !== confirmPassword) {
              this.errors.confirm_password.hidden = false;
              this.errors.confirm_password.textContent = "Passwords do not match!";
              element.setCustomValidity("Passwords do not match!");
            } else {
              this.errors.confirm_password.hidden = true;
              form.elements["confirm_password"].setCustomValidity("");
            }
          } 
          // Handle other field validations
          else if (element.validity.valid || element.value === "") {
            error.hidden = true;
            element.setCustomValidity("");
          } else {
            error.hidden = false;
          }

          // Update submit button state
          form.querySelector(".btn_submit").classList.toggle("active", form.checkValidity());
        });
      }
    });
  }

  connectedCallback() {
    console.log("SIGNUP is Connected");
    const form = this.shadow.querySelector('form');
    // Remove any existing event listeners
    form.removeEventListener('submit', this.handleSignup.bind(this));
    // Add new event listener
    form.addEventListener('submit', this.handleSignup.bind(this));

    // Handle OAuth buttons
    const btn42Network = this.shadow.querySelector('.btn_42Network');
    const btnGoogle = this.shadow.querySelector('.btn_google');

    btn42Network?.addEventListener('click', () => {
        window.location.href = '/api/oauth/42/login/';
    });

    btnGoogle?.addEventListener('click', () => {
        window.location.href = '/api/oauth/google/login/';
    });
  }

  disconnectedCallback() {
    console.log("SIGNUP is Disconnected");
    const form = this.shadow.querySelector('form');
    form.removeEventListener('submit', this.handleSignup.bind(this));
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

//#test only
