let template = document.createElement("template");

/**
 * This is Two-Factor Authentication page
 */
template.innerHTML =
  /*html*/
  `<div id="towfa-page" class="towfa-page"> 
      <div  class="container">
      <form class="form shadow">
        <div class="form-header">
          <span>
            <img src="src/assets/images/42_logo.svg" alt="logo" />
          </span>
          <h2 class="title">This is Two-Factor Authentication page</h2>
          <p class="slugan">Set up two-factor authentication</p>
          <p class="2faInfo">
            To be able to authorize your account you need to scan this QR code with your google authentication App and enter the
              verification code below.
          </p>
        </div>
        <div class="form-body">
          <div class="form-group">
              <div class="form-field">
                <label for="email">Verefication Code</label>
                <input type="text" class="code-verefication" id="OTP_1" maxlength="1" name="code-verefication"  required autofocus>
                <input type="text" class="code-verefication" id="OTP_2" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" id="OTP_3" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" id="OTP_4" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" id="OTP_5" maxlength="1" name="code-verefication"  required >
                <input type="text" class="code-verefication" id="OTP_6" maxlength="1" name="code-verefication"  required >
                <p class="error" id="email-error" hidden>Error</p>
              </div>
              <div class="form-field">
                <button class="btn_submit"  type="submit">Done</button>
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
    </div>
    <!--<cloud-moving></cloud-moving>-->
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
  }

  attachInputListner() {
    const inputs = this.shadow.querySelectorAll(".code-verefication");
    inputs.forEach((OTPinput, index) => {
      inputs[0].focus();
      OTPinput.addEventListener("input", (e) => {
        /*This is for reading directly from the clipboard*/
        // navigator.clipboard.readText().then((clipText) => {
        //   navigator.clipboard.writeText(null)
        //   if (clipText.length <= 6) {
        //       clipText.split("").forEach((val, index) => {
        //         inputs[index].focus();
        //         inputs[index].value = val;
        //       });
        //     return
        //     }
        // } );
        if (OTPinput.value.length == 1) {
          const inputSquer = this.shadow.getElementById(inputs[index + 1]?.id) || null;
          inputSquer ? inputSquer.focus() : this.shadow.querySelector(".btn_submit").click();
        }
        else {
          const inputSquer = this.shadow.getElementById(inputs[index - 1]?.id) || null;
          if (inputSquer) {
            inputSquer.focus();
            inputSquer.select()
          }
        }
      });
    })
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
