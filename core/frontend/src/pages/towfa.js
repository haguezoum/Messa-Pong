import appState from "../services/State.js";

let template = document.createElement("template");

/**
 * This is Two-Factor Authentication page
 */
template.innerHTML = /*html*/
`<div id="towfa-page" class="towfa-page">
    <div class="container">
        <form class="form shadow" novalidate>
            <div class="form-header">
                <span>
                    <img src="src/assets/images/42_logo.svg" alt="logo" />
                </span>
                <h2 class="title">Two-Factor Authentication</h2>
                <p class="slugan" id="slugan">Set up two-factor authentication</p>
                <p class="sub_slugan">
                    To be able to authorize your account you need to scan this QR code with your Google Authenticator App and enter the
                    verification code below.
                </p>
            </div>
            <div class="form-body">
                <div class="form-group">
                    <div class="qr-code">
                        <img id="qrCodeImage" src="src/assets/images/QR.png" alt="qr-code" />
                    </div>
                    <p class="info">Verification Code</p>
                    <div class="form-field">
                        <input type="text" class="code-verefication" placeholder="0" tabindex="1" id="OTP_1" maxlength="1" name="code-verefication" required autofocus>
                        <input type="text" class="code-verefication" placeholder="0" tabindex="2" id="OTP_2" maxlength="1" name="code-verefication" required>
                        <input type="text" class="code-verefication" placeholder="0" tabindex="3" id="OTP_3" maxlength="1" name="code-verefication" required>
                        <input type="text" class="code-verefication" placeholder="0" tabindex="4" id="OTP_4" maxlength="1" name="code-verefication" required>
                        <input type="text" class="code-verefication" placeholder="0" tabindex="5" id="OTP_5" maxlength="1" name="code-verefication" required>
                        <input type="text" class="code-verefication" placeholder="0" tabindex="6" id="OTP_6" maxlength="1" name="code-verefication" required>
                        <p class="error" id="code-error" hidden>Error</p>
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

  async connectedCallback() {
    console.log("TOWFA is Connected");
    const temporaryToken = localStorage.getItem('temporary_token');
    const accessToken = localStorage.getItem('access_token');

    const isEnabling2FA = !!accessToken && !temporaryToken; // Logged in, enabling 2FA

    if (!temporaryToken && !accessToken) {
      console.error("No tokens found. Redirecting to login.");
      appState.currentPage = "/login";
      return;
    }

    await this.fetchQrCode(isEnabling2FA, temporaryToken, accessToken);
    this.attachInputListener();
    this.submitForm(isEnabling2FA);
  }

  async fetchQrCode(isEnabling2FA, temporaryToken, accessToken) {
    const endpoint = isEnabling2FA ? "https://localhost/api/users/2fa/enable/" : "https://localhost/api/users/2fa/qr/";
    const token = isEnabling2FA ? accessToken : temporaryToken;

    try {
      this.shadow.getElementById("slugan").textContent = isEnabling2FA ? "Enable two-factor authentication" : "Verify two-factor authentication";
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch QR code");
      }

      const data = await response.json();
      const qrCodeImage = this.shadow.getElementById("qrCodeImage");
      qrCodeImage.src = data.qr_code;
      console.log("QR Code Source:", qrCodeImage.src);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      this.shadow.getElementById("code-error").textContent = error.message || "Failed to load QR code.";
      this.shadow.getElementById("code-error").hidden = false;
      setTimeout(() => {
        appState.currentPage = isEnabling2FA ? "/profile" : "/login";
      }, 2000);
    }
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

  submitForm(isEnabling2FA) {
    const form = this.shadow.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const temporaryToken = localStorage.getItem('temporary_token');
      const accessToken = localStorage.getItem('access_token');
      const token = isEnabling2FA ? accessToken : temporaryToken;

      if (!this.validityCheck()) {
        this.shadow.querySelector(".form-field").classList.add("shake");
        this.shadow.getElementById("code-error").textContent = "Please enter all 6 digits.";
        this.shadow.getElementById("code-error").hidden = false;
        setTimeout(() => {
          this.shadow.querySelector(".form-field").classList.remove("shake");
          this.shadow.getElementById("code-error").hidden = true;
        }, 100);
        return;
      }

      const inputs = this.shadow.querySelectorAll(".code-verefication");
      const code = Array.from(inputs).map(input => input.value).join("");

      const loadingProgress = document.createElement("loading-progress");
      this.shadow.appendChild(loadingProgress);

      try {
        const response = await fetch("https://localhost/api/users/2fa/verify/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`, // Added Authorization header
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(isEnabling2FA ? {} : { temporary_token: temporaryToken }),
            code
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to verify 2FA code");
        }

        const data = await response.json();
        if (!isEnabling2FA) {
          localStorage.removeItem('temporary_token');
        }
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        this.shadow.querySelector("loading-progress")?.remove();
        setTimeout(() => {
          appState.currentPage = "/home";
        }, 1000);
      } catch (error) {
        console.error("2FA verification error:", error);
        this.shadow.querySelector(".form-field").classList.add("shake");
        this.shadow.getElementById("code-error").textContent = error.message || "Invalid code. Please try again.";
        this.shadow.getElementById("code-error").hidden = false;
        this.shadow.querySelector("loading-progress")?.remove();
        setTimeout(() => {
          this.shadow.querySelector(".form-field").classList.remove("shake");
          this.shadow.getElementById("code-error").hidden = true;
        }, 100);
      }
    });
  }

  attachInputListener() {
    const inputs = this.shadow.querySelectorAll(".code-verefication");
    inputs.forEach((OTPinput, index) => {
      inputs[0].focus();
      OTPinput.addEventListener("input", (e) => {
        if (OTPinput.value.length === 1) {
          const inputSquare =
            this.shadow.getElementById(inputs[index + 1]?.id) || null;
          inputSquare
            ? inputSquare.focus()
            : this.shadow.getElementById("OTP_6").focus();
        }
      });

      OTPinput.addEventListener("keydown", (e) => {
        if (e.keyCode === 8 && index !== 0) {
          if (!OTPinput.value) {
            this.shadow.getElementById(inputs[index - 1]?.id).focus();
          }
          OTPinput.value = "";
        }
      });

      window.addEventListener("paste", (e) => {
        let textContentPasted = e.clipboardData.getData("text");
        if (textContentPasted.length === 6) {
          textContentPasted.split("").forEach((val, index) => {
            inputs[index].value = val;
            this.shadow.getElementById("OTP_6").focus();
          });
        }
      });
    });
  }

  disconnectedCallback() {
    console.log("TOWFA is Disconnected");
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("towfa-page", TOWFA);
export default TOWFA;
