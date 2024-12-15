let template = document.createElement("template");

template.innerHTML =
  /*html*/
  `<div id="signup-page" class="signupPage"> <!-- take the whole window size -->
    <div  class="container">
      <form class="form shadow">
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
                <input type="text" class="firstname" id="firstname" autofocus name="firstname" placeholder="Firstname" autocomplete="firstname" pattern="[a-zA-Z]{3,20}"
                        title="Enter your first name" required tabindex="1">
                <p class="error" id="firstname-error" hidden>Error</p>
              </div>
              <!-- last name -->
              <div class="form-field">
                <label for="lastname">Last Name</label>
                <input type="text" class="lastname" id="lastname" autofocus name="lastname" placeholder="lastname" autocomplete="lastname" pattern="[a-zA-Z]{3,20}"
                        title="Enter your last name" required tabindex="2">
                <p class="error" id="lastname-error" hidden>Error</p>
              </div>
              <!-- username -->
              <div class="form-field">
                <label for="username">Username</label>
                <input type="text" class="username" id="username" autofocus name="username" placeholder="username" autocomplete="username" pattern="[a-zA-Z0-9]{2,20}"
                        title="Chose a username" required tabindex="2">
                <p class="error" id="username-error" hidden>Error</p>
              </div>
              <!-- user email -->
              <div class="form-field">
                <label for="email">Email</label>
                <input type="email" class="email" id="email" name="email" placeholder="Username or email" autocomplete="email" pattern=".+@[a-z]+\.[a-z]{2,4}"
                        title="Enter your email address" required tabindex="4">
                <p class="error" id="email-error" hidden>Error</p>
              </div>
              <!-- password -->
              <div class="form-field">
                <label for="password">Password</label>
                <input type="password" class="password" id="password" name="password" placeholder="Password" autocomplete="current-password" required minlength="10" tabindex="5" pattern="[a-zA-Z0-9]{7,200}">
                <p class="error" id="password-error" hidden>Error</p>
              </div>
              <!-- confirm password -->
              <div class="form-field">
                <label for="confirm-password">Confirme Password</label>
                <input type="password" class="password" id="confirm-password" name="confirm_password" placeholder="Password" autocomplete="confirm-password" required minlength="10" tabindex="6">
                <p class="error" id="confirm-password-error" hidden>Error</p>
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
            <router-link to="/login" kind="route" tabindex="10" is=>
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
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/signup-page.css");
    this.shadow.appendChild(linkElem);
    this.setFormBinging(this.shadow.querySelector("form"));
  }

  connectedCallback() {
    console.log("SIGNUP is Connected");
  }

  disconnectedCallback() {
    console.log("SIGNUP is Disonnected");
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

  setFormBinging(form) {
    console.log("setFormBinging");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("submit");
        console.log("Thank you " + this.#newUser.firstname);
        this.#newUser.firstname = "";
        this.#newUser.lastname = "";
        this.#newUser.username = "";
        this.#newUser.email = "";
        this.#newUser.password = "";
        this.#newUser.confirm_password = "";
      });
    }
    this.#newUser = new Proxy(this.#newUser, {
      set: (target, key, value) => {
        target[key] = value;
        form.elements[key].value = value;
        console.log(`Target : ${target} | Key : ${key} | Value : ${value}`);
        return true;
      },
    });

    // iterate over form fields and bind them to newUser
    Array.from(form.elements).forEach((element) => {
      if (element.name) {
        element.addEventListener("change", () => {
          this.#newUser[element.name] = element.value;
        });
      }
    });
  } // end of setFormBinging

  // check if the form is valid is its valid show some chines in the submit button
  //     box-shadow: 1px 1px 50px 10px rgb(135, 205, 234);
  // check : https://uiverse.io/MuhammadHasann/silent-lizard-44
}
customElements.define("signup-page", SIGNUP);

export default SIGNUP;
