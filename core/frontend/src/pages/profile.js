let template = document.createElement("template");

template.innerHTML =
  /*html*/
  `<div id="profile-page" class="profile-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="profile-content">
      <div class="profile-content-infos">
        <div class="profile-content-infos-header">
          <div class="profile-content-infos-header-username">
            <h1>
              <span>Hi, </span>
              <span class="ownerName" data-username="haguezoum" onclick="app.state.currentPage='/home'">Hassan Aguezoum</span>
              <span class="wavingHand">👋🏽</span>
            </h1>
          </div>
          <div class="profile-content-infos-message">
            <p>Manage your details, view your tier status and change your password</p>
          </div>
        </div>

        <section class="profile-content-infos-details">
            <div class="profilePictureChanger">
               <div class="picturChanger">
                    <img src="src/assets/images/charachters/bust-mask-13.svg" alt="" class="profilePicture">
                    <div class="changePicture">
                        <label for="file" class="changePictureIcon">
                          <input type="file" class="file-input" id="file" />
                          <ion-icon name="camera-outline" size="large" aria-hidden="true" aria-label="Change Personal Picture"></ion-icon>
                        </label>
                    </div>
               </div>
               <div class="userBasicInfo">
                <div class="userFullNmae">
                  Hassan Aguezoum
                </div>
                 <div class="userPhoneNumber">
                  +212771426752
                 </div>
               </div>
            </div>

          <div class="profileGeneralInfo">
              <div class="title-box">
                  <p>General Information</p>
              </div>
              <div class="field-container">
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
                  <div class="form-field">
                      <label for="firstname">Last Name</label>
                      <input type="text" class="firstname" id="firstname" autofocus name="firstname" placeholder="Firstname" autocomplete="given-name" pattern="[a-zA-Z]{3,20}"
                              title="Enter your first name" required tabindex="1">
                      <p class="error" id="firstname-error" hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                      </svg>
                      Please choose a lastname !</p>
                  </div>
                  <div class="form-field">
                      <label for="firstname">Username</label>
                      <input type="text" class="firstname" id="firstname" autofocus name="firstname" placeholder="Firstname" autocomplete="given-name" pattern="[a-zA-Z]{3,20}"
                              title="Enter your first name" required tabindex="1">
                      <p class="error" id="firstname-error" hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                      </svg>
                      Please choose a Username !</p>
                  </div>
              </div>
             

              <div class="update-row">
                  <button> Update </button>
              </div>
          </div>

            <div class="profileSecurity">
              <div class="security-title-box">
                <div>
                  <p>Security</p>
                </div>
                <div class="switch">
                  <label for="checkbox">2FA</label>
                  <div class="checkbox-con">
                    <input id="checkbox" type="checkbox">
                  </div>
                </div>
              </div>
              <div class="field-container">
                <div class="form-field">
                  <label for="Email">Email</label>
                  <input type="text" class="email" id="email" autofocus name="email"
                          title="Enter your mail" required tabindex="1">
                  <p class="error" id="mail-error" hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                  </svg>
                  Please choose a mail !</p>
                </div>
                <div class="form-field">
                  <label for="pass">Password</label>
                  <input type="pass" class="pass" id="pass" autofocus name="pass"
                          title="Enter your password" required tabindex="1">
                  <p class="error" id="pass-error" hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                  </svg>
                  Please choose a password !</p>
                </div>
                <div class="form-field">
                  <label for="phone">Phonenumber</label>
                  <input type="phone" class="phone" id="phone" autofocus name="phone"
                          title="Enter your phonenumber" required tabindex="1">
                  <p class="error" id="phone-error" hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                  </svg>
                  Please choose a number !</p>
                </div>

              </div>

              <div class="update-row">
                <button> Update </button>
                <!-- <button> Edit </button> -->
              </div>
            </div>
            
        </section>
      </div>
    </div>
  </div>
<!-- <cloud-moving cloudCount="20"></cloud-moving> -->
</div>`;

class PROFILE extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/profile-page.css");
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  disconnectedCallback() {}

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}

  // ------------------------------ Methods ------------------------------
}
customElements.define("profile-page", PROFILE);

export default PROFILE;
