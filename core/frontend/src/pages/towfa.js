let template = document.createElement("template");

/**
 * This is Two-Factor Authentication page
 */
template.innerHTML =
  /*html*/
  `<div id="towfa-page" class="towfa-page">
      <div  class="container">
      <form class="form shadow" novalidate >
        <div class="form-header">
          <span>
            <img src="src/assets/images/42_logo.svg" alt="logo" />
          </span>
          <h2 class="title">Two-Factor Authentication</h2>
          <p class="slugan">Set up two-factor authentication</p>
          <p class="sub_slugan">
            To be able to authorize your account you need to scan this QR code with your google authentication App and enter the
              verification code below.
          </p>
        </div>
        <div class="form-body">
          <div class="form-group">
            <div class="qr-code">
              <img src="src/assets/images/QR.png" alt="qr-code" />
            </div>
            <p class="info"> Verefication Code</p>
              <div class="form-field">
                <input type="text" class="code-verefication" placeholder="0" tabindex="1" id="OTP_1" maxlength="1" name="code-verefication"  required autofocus>
                <input type="text" class="code-verefication" placeholder="0" tabindex="2" id="OTP_2" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" placeholder="0" tabindex="3" id="OTP_3" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" placeholder="0" tabindex="4" id="OTP_4" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" placeholder="0" tabindex="5" id="OTP_5" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" placeholder="0" tabindex="6" id="OTP_6" maxlength="1" name="code-verefication"  required >
                <p class="error" id="email-error" hidden>Error</p>
              </div>
              <div class="form-field">
              <button class="btn_submit" tabindex="7" type="submit">Done</button>
              </div>
          </div>
        </div>
      </form>
        <div class="backToLogin">
          <p>
            <router-link to="/login" kind="route">
               <span slot="title"> ＜ Back to login </span>
            </router-link>
          </p>
        </div>
      </div>
      <cloud-moving></cloud-moving>
    </div>
  </div>
  </div>`;

class TOWFA extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/towfa-page.css");
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("TOWFA is Connected");
    this.attachInputListner();
    this.submitForm();
  }

  validityCheck() {
    const inputs = this.shadow.querySelectorAll(".code-verefication");
    let isValid = true;
    inputs.forEach((OTPinput) => {
      if (!OTPinput.value) {
        isValid = false;
      }
    });
    return isValid;
  }

  submitForm() {
    const form = this.shadow.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validityCheck()) {
        // add the loading progress here , then rederict to the next page
        setTimeout(() => {
          const loadingProgress = document.createElement("loading-progress");
          this.shadow.appendChild(loadingProgress);
        }, 700);
        setTimeout(() => {
          app.state.currentPage = "/home";
        }, 1000);
        // console.log("Form is submitted");
      } else {
        // console.log("Form is not submitted");
        this.shadow.querySelector(".form-field").classList.add("shake");
        setTimeout(() => {
          this.shadow.querySelector(".form-field").classList.remove("shake");
        }, 100);
      }
    });
  }

  attachInputListner() {
    const inputs = this.shadow.querySelectorAll(".code-verefication");
    inputs.forEach((OTPinput, index) => {
      inputs[0].focus();
      OTPinput.addEventListener("input", (e) => {
        if (OTPinput.value.length == 1) {
          const inputSquer =
            this.shadow.getElementById(inputs[index + 1]?.id) || null;
          inputSquer
            ? inputSquer.focus()
            : this.shadow.getElementById("OTP_6").focus();
        }
      });

      OTPinput.addEventListener("keydown", (e) => {
        if (e.keyCode == 8 && index != 0) {
          if (!OTPinput.value) {
            this.shadow.getElementById(inputs[index - 1]?.id).focus();
          }
          OTPinput.value = "";
        }
      });

      // This is for reading directly from the clipboard
      window.addEventListener("paste", (e) => {
        let textContentPasted = e.clipboardData.getData("text");
        if (textContentPasted.length == 6) {
          textContentPasted.split("").forEach((val, index) => {
            inputs[index].value = val;
            this.shadow.getElementById("OTP_6").focus();
          });
        }
      });
    });
  }

  disconnectedCallback() {
    console.log("TOWFA is Disonnected");
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
customElements.define("towfa-page", TOWFA);
export default TOWFA;
