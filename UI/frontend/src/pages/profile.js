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
                   <div class="userFullNmae">Hassan Aguezoum</div>
                   <div class="userPhoneNumber">+212771426752</div>
                   </div>
                </div>
                <div class="profileGeneralInfo">
                  c
                </div>
                <div class="profileSecurity">
                  A
                </div>
            </section>
          </div>
        </div>
      </div>
    <cloud-moving cloudCount="20"></cloud-moving>
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
