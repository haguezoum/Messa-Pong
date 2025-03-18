let template = document.createElement("template");
template.innerHTML =
  /*html*/
  `
<div id="signup-page" class="signupPage">
  <div class="container">
    <form class="form shadow" novalidate>
      <div class="form-header">
        <span>
          <img src="src/assets/images/42_logo.svg" alt="logo" />
        </span>
        <h2 class="title">Hey there! 👋</h2>
        <p class="slugan">Sign up now and get full access to our game!</p>
      </div>
      <div class="form-body">
        <div class="form-group">
          <!-- First Name -->
          <div class="form-field">
            <label for="firstname">First Name</label>
            <input
              type="text"
              class="firstname"
              id="firstname"
              autofocus
              name="firstname"
              placeholder="Firstname"
              autocomplete="given-name"
              pattern="[a-zA-Z]{3,20}"
              title="Enter your first name (3-20 letters)"
              required
              tabindex="1"
              aria-describedby="firstname-error"
            />
            <p class="error" id="firstname-error" hidden>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
              </svg>
              Please enter a valid first name (3-20 letters).
            </p>
          </div>
          <!-- Last Name -->
          <div class="form-field">
            <label for="lastname">Last Name</label>
            <input
              type="text"
              class="lastname"
              id="lastname"
              name="lastname"
              placeholder="Lastname"
              autocomplete="family-name"
              pattern="[a-zA-Z]{3,20}"
              title="Enter your last name (3-20 letters)"
              required
              tabindex="2"
              aria-describedby="lastname-error"
            />
            <p class="error" id="lastname-error" hidden>Please enter a valid last name (3-20 letters).</p>
          </div>
          <!-- Username -->
          <div class="form-field">
            <label for="username">Username</label>
            <input
              type="text"
              class="username"
              id="username"
              name="username"
              placeholder="Username"
              autocomplete="username"
              pattern="[a-zA-Z0-9]{2,20}"
              title="Choose a username (2-20 alphanumeric characters)"
              required
              tabindex="3"
              aria-describedby="username-error"
            />
            <p class="error" id="username-error" hidden>Please choose a valid username (2-20 alphanumeric characters).</p>
          </div>
          <!-- Email -->
          <div class="form-field">
            <label for="email">Email</label>
            <input
              type="email"
              class="email"
              id="email"
              name="email"
              placeholder="Email"
              autocomplete="email"
              pattern=".+@.+\.[a-z]{2,4}"
              title="Enter a valid email address"
              required
              tabindex="4"
              aria-describedby="email-error"
            />
            <p class="error" id="email-error" hidden>Please enter a valid email address.</p>
          </div>
          <!-- Password -->
          <div class="form-field">
            <label for="password">Password</label>
            <input
              type="password"
              class="password"
              id="password"
              name="password"
              placeholder="Password"
              autocomplete="new-password"
              required
              minlength="10"
              tabindex="5"
              aria-describedby="password-error"
            />
            <p class="error" id="password-error" hidden>Password must be at least 10 characters long.</p>
          </div>
          <!-- Confirm Password -->
          <div class="form-field">
            <label for="confirm_password">Confirm Password</label>
            <input
              type="password"
              class="password"
              id="confirm_password"
              name="confirm_password"
              placeholder="Confirm Password"
              autocomplete="new-password"
              required
              minlength="10"
              tabindex="6"
              aria-describedby="confirm_password-error"
            />
            <p class="error" id="confirm_password-error" hidden>Passwords do not match.</p>
          </div>
          <!-- Submit Button -->
          <div class="form-field">
            <button class="btn_submit" type="submit" tabindex="7">
              <span class="btn-text">Sign Up</span>
              <span class="spinner" hidden></span>
            </button>
          </div>
          <!-- API Response Message -->
          <div class="form-field">
            <p class="api-message" id="api-message" hidden></p>
          </div>
        </div>
      </div>
    </form>
    <div class="form-footer">
      <p>Or sign in with</p>
      <div class="remote-login">
        <button class="btn_42Network" role="button" tabindex="8">
          <img class="img_btn" src="src/assets/images/42_logo.svg" alt="42 Network" />
        </button>
        <button class="btn_google" role="button" tabindex="9">
          <img class="img_btn" src="src/assets/images/white-google-logo.png" alt="Google" />
        </button>
      </div>
      <div class="signup">
        <p>
          <router-link to="/login" kind="route" tabindex="10">
            <span slot="title">Already have an account? Login</span>
            <span slot="icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25-2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
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

class SIGNUP extends HTMLElement {
  #newUser = {
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  };

  #api = {
    BASE_URL: "https://localhost/api",
    async registerUser(userData) {
      try {
        // Log the data being sent for debugging
        console.log('Sending registration data:', {
          username: userData.username,
          email: userData.email,
          first_name: userData.firstname,  // Make sure these match
          last_name: userData.lastname,    // the backend field names
          password: userData.password,
          confirm_password: userData.confirm_password
        });

        const response = await fetch('/api/auth/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            first_name: userData.firstname,  // Match these with your backend
            last_name: userData.lastname,    // field names
            password: userData.password,
            confirm_password: userData.confirm_password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Registration error:', errorData);  // Log error details
          throw new Error(errorData.detail || 'Registration failed');
        }

        return await response.json();
      } catch (error) {
        console.error('Error during registration:', error);
        throw error;
      }
    },
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

    this.setFormBinding(this.shadow.querySelector("form"));
  }

  connectedCallback() {
    console.log("SIGNUP is Connected");
  }

  disconnectedCallback() {
    console.log("SIGNUP is Disconnected");
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Handle attribute changes if needed
  }

  get newUser() {
    return this.#newUser;
  }

  /**
   * Shows a message to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success' or 'error')
   */
  showMessage(message, type = "error") {
    const messageElement = this.shadow.querySelector("#api-message");
    messageElement.textContent = message;
    messageElement.className = `api-message ${type}`;
    messageElement.hidden = false;

    // Hide message after 5 seconds
    setTimeout(() => {
      messageElement.hidden = true;
    }, 5000);
  }

  /**
   * Binds form validation and submission logic to the provided form element.
   * @param {HTMLFormElement} form - The form element to bind.
   */
  setFormBinding(form) {
    this.errors = {
      firstname: this.shadow.querySelector("#firstname-error"),
      lastname: this.shadow.querySelector("#lastname-error"),
      username: this.shadow.querySelector("#username-error"),
      email: this.shadow.querySelector("#email-error"),
      password: this.shadow.querySelector("#password-error"),
      confirm_password: this.shadow.querySelector("#confirm_password-error"),
    };

    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
          this.shadow.querySelector(".signupPage").classList.add("shake");
          setTimeout(() => {
            this.shadow.querySelector(".signupPage").classList.remove("shake");
          }, 155);
          return;
        }
        
        const userData = {
          username: this.#newUser.username,
          firstname: this.#newUser.firstname,
          lastname: this.#newUser.lastname,
          email: this.#newUser.email,
          password: this.#newUser.password,
          confirm_password: this.#newUser.confirm_password,
        };

        const submitButton = form.querySelector(".btn_submit");
        const originalText = submitButton.querySelector(".btn-text").textContent;
        submitButton.querySelector(".btn-text").textContent = "Signing up...";
        submitButton.querySelector(".spinner").hidden = false;
        submitButton.disabled = true;

        try {
          await this.#api.registerUser(userData);

          for (let key in this.#newUser) {
            this.#newUser[key] = "";
          }

          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } catch (error) {
          this.showMessage(error.message || "Registration failed. Please try again.");
          submitButton.querySelector(".btn-text").textContent = originalText;
          submitButton.querySelector(".spinner").hidden = true;
          submitButton.disabled = false;
        }
      });

      Array.from(form.elements).forEach((element) => {
        if (element.name) {
          element.addEventListener("input", () => {
            const error = this.errors[element.name];

            if (element.name === "confirm_password") {
              if (element.value !== form.elements["password"].value) {
                error.hidden = false;
                element.setCustomValidity("Passwords do not match.");
                return;
              }
            } else if (!element.validity.valid && element.value !== "") {
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
  }
}

customElements.define("signup-page", SIGNUP);
export default SIGNUP;
