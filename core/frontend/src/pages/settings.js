import appState from "../services/State.js";

let template = document.createElement("template");
template.innerHTML = /*html*/`
<div id="profile-page" class="profile-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="container-content">
      <div class="profile-header">
        <h1>USER SETTINGS</h1>
      </div>
      <div class="profile-content">
        <div class="profile-content-infos">
          <div class="profile-content-infos-header">
            <div class="profile-content-infos-header-username">
              <h2>
                <span>Hi, </span>
                <span class="ownerName" id="displayUsername">Loading...</span>
                <span class="wavingHand">👋🏽</span>
              </h2>
            </div>
            <div class="profile-content-infos-message">
              <p>Manage your details, view your game statistics, and change your security settings</p>
            </div>
          </div>

          <section class="profile-content-infos-details">
            <div class="profilePictureChanger">
              <div class="picturChanger">
                <img src="/src/assets/images/default.jpg" alt="Profile Picture" class="profilePicture" id="profileImage">
                <div class="changePicture">
                  <label for="file" class="changePictureIcon">
                    <input type="file" class="file-input" id="file" accept="image/*" />
                    <ion-icon name="camera-outline" size="large" aria-hidden="true" aria-label="Change Personal Picture"></ion-icon>
                  </label>
                </div>
              </div>
              <div class="userBasicInfo">
                <div class="userFullName" id="displayFullName">Loading...</div>
                <div class="userPhoneNumber" id="displayPhone">Loading...</div>
                <div class="userStats">
                  <div class="stat-item">
                    <span class="stat-label">Games</span>
                    <span class="stat-value" id="totalGames">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Wins</span>
                    <span class="stat-value" id="totalWins">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Win Rate</span>
                    <span class="stat-value" id="winRate">0%</span>
                  </div>
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
                  <input type="text" class="input-field" id="firstname" name="firstname" placeholder="Enter your first name" autocomplete="given-name" pattern="[a-zA-Z]{3,20}" title="Enter your first name (3-20 letters)" required tabindex="1">
                  <p class="error hidden" id="firstname-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                    </svg>
                    Please enter a valid first name (3-20 letters)
                  </p>
                </div>
                <div class="form-field">
                  <label for="lastname">Last Name</label>
                  <input type="text" class="input-field" id="lastname" name="lastname" placeholder="Enter your last name" autocomplete="family-name" pattern="[a-zA-Z]{3,20}" title="Enter your last name (3-20 letters)" required tabindex="2">
                  <p class="error hidden" id="lastname-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                    </svg>
                    Please enter a valid last name (3-20 letters)
                  </p>
                </div>
                <div class="form-field">
                  <label for="username">Username</label>
                  <input type="text" class="input-field" id="username" name="username" placeholder="Enter your username" autocomplete="username" pattern="[a-zA-Z0-9_]{3,20}" title="Enter your username (3-20 alphanumeric characters or underscores)" required tabindex="3">
                  <p class="error hidden" id="username-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                    </svg>
                    Please enter a valid username (3-20 alphanumeric characters or underscores)
                  </p>
                </div>
              </div>
              <div class="update-row">
                <button id="updateGeneralBtn" class="update-btn">Update Information</button>
              </div>
            </div>

            <div class="profileSecurity">
              <div class="security-title-box">
                <div>
                  <p>Security Settings</p>
                </div>
                <div class="switch">
                  <label for="twoFactorToggle">2FA</label>
                  <div class="toggle-container">
                    <input id="twoFactorToggle" type="checkbox" class="toggle-input">
                    <label for="twoFactorToggle" class="toggle-label"></label>
                  </div>
                </div>
              </div>
              <div class="field-container">
                <div class="form-field">
                  <label for="email">Email</label>
                  <input type="email" class="input-field" id="email" name="email" placeholder="Enter your email" autocomplete="email" required tabindex="4">
                  <p class="error hidden" id="email-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                    </svg>
                    Please enter a valid email address
                  </p>
                </div>
                <div class="form-field">
                  <label for="password">Password</label>
                  <div class="password-container">
                    <input type="password" class="input-field" id="password" name="password" placeholder="Enter your password" autocomplete="new-password" tabindex="5">
                    <button type="button" class="toggle-password" id="togglePassword">
                      <ion-icon name="eye-outline" class="hide-password"></ion-icon>
                      <ion-icon name="eye-off-outline" class="show-password"></ion-icon>
                    </button>
                  </div>
                  <div class="password-strength" id="passwordStrength">
                    <div class="strength-bar"></div>
                    <div class="strength-bar"></div>
                    <div class="strength-bar"></div>
                    <div class="strength-bar"></div>
                  </div>
                  <p class="strength-text" id="strengthText">Password strength</p>
                  <p class="error hidden" id="password-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                    </svg>
                    Password must be at least 8 characters with letters, numbers, and special characters
                  </p>
                </div>
                <div class="form-field">
                  <label for="phone">Phone Number</label>
                  <input type="tel" class="input-field" id="phone" name="phone" placeholder="Enter your phone number" autocomplete="tel" pattern="[+][0-9]{10,15}" title="Phone number format: +1234567890" required tabindex="6">
                  <p class="error hidden" id="phone-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                    </svg>
                    Please enter a valid phone number (format: +1234567890)
                  </p>
                </div>
              </div>
              <div class="update-row">
                <button id="updateSecurityBtn" class="update-btn">Update Security</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
  <cloud-moving></cloud-moving>
  <div class="notification" id="notification">
    <div class="notification-content">
      <ion-icon name="checkmark-circle-outline" class="notification-icon success"></ion-icon>
      <ion-icon name="alert-circle-outline" class="notification-icon error"></ion-icon>
      <span class="notification-message"></span>
    </div>
  </div>
</div>`;

class SETTINGS extends HTMLElement {
      #api = {
    async fetchUserData(accessToken) {
      const response = await fetch('https://localhost/api/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },

    async updateUserData(accessToken, data) {
      const response = await fetch('https://localhost/api/users/me/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    },

    async uploadProfilePicture(accessToken, file) {
      const formData = new FormData();
      formData.append('profile_picture', file);
      const response = await fetch('https://localhost/api/users/me/upload-picture/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },

    async enable2FA(accessToken) {
      const response = await fetch('https://localhost/api/users/2fa/enable/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },

    async verify2FA(accessToken, code) {
      const response = await fetch('https://localhost/api/users/2fa/verify/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },

    async refreshToken() {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token available');
      const response = await fetch('https://localhost/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) throw new Error('Token refresh failed');
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    },
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "/src/assets/style/settings-page.css");
    this.shadow.appendChild(linkElem);
  }

  async connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    await this.loadUserData();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  async loadUserData() {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const userData = await this.#api.fetchUserData(accessToken);
      this.populateUserData(userData);
    } catch (error) {
      console.error('Load user data error:', error);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        try {
          const newAccessToken = await this.#api.refreshToken();
          const userData = await this.#api.fetchUserData(newAccessToken);
          this.populateUserData(userData);
        } catch (refreshError) {
          this.showNotification('Session expired. Please log in again.', false);
          setTimeout(() => {
            appState.currentPage = '/login';
            window.dispatchEvent(new CustomEvent('stateChanged', { detail: { value: '/login' } }));
          }, 2000);
        }
      } else {
        this.showNotification('Failed to load profile data', false);
      }
    }
  }

  populateUserData(userData) {
    this.shadow.getElementById("displayUsername").textContent = userData.username || 'Unknown';
    this.shadow.getElementById("displayFullName").textContent = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown';
    this.shadow.getElementById("displayPhone").textContent = userData.phone_number || 'Not set';
    
    const profileImage = this.shadow.getElementById("profileImage");
    profileImage.src = userData.profile_picture_url;

    this.shadow.getElementById("firstname").value = userData.first_name || '';
    this.shadow.getElementById("lastname").value = userData.last_name || '';
    this.shadow.getElementById("username").value = userData.username || '';
    this.shadow.getElementById("email").value = userData.email || '';
    this.shadow.getElementById("phone").value = userData.phone_number || '';
    this.shadow.getElementById("twoFactorToggle").checked = userData.is_2fa_enabled || false;

    this.shadow.getElementById("totalGames").textContent = userData.total_games || 0;
    this.shadow.getElementById("totalWins").textContent = userData.wins || 0;
    this.shadow.getElementById("winRate").textContent = userData.win_rate ? `${userData.win_rate}%` : '0%';
  }

  setupEventListeners() {
    this.shadow.getElementById("file").addEventListener("change", this.handleProfilePictureChange.bind(this));
    this.shadow.getElementById("togglePassword").addEventListener("click", this.togglePasswordVisibility.bind(this));
    this.shadow.getElementById("password").addEventListener("input", this.checkPasswordStrength.bind(this));
    this.shadow.getElementById("updateGeneralBtn").addEventListener("click", this.updateGeneralInfo.bind(this));
    this.shadow.getElementById("updateSecurityBtn").addEventListener("click", this.updateSecurityInfo.bind(this));
    this.shadow.getElementById("twoFactorToggle").addEventListener("change", this.toggleTwoFactor.bind(this));

    this.shadow.querySelectorAll(".input-field").forEach(input => {
      input.addEventListener("blur", this.validateInput.bind(this));
    });
  }

  removeEventListeners() {
    const elements = [
      ["file", "change", this.handleProfilePictureChange],
      ["togglePassword", "click", this.togglePasswordVisibility],
      ["password", "input", this.checkPasswordStrength],
      ["updateGeneralBtn", "click", this.updateGeneralInfo],
      ["updateSecurityBtn", "click", this.updateSecurityInfo],
      ["twoFactorToggle", "change", this.toggleTwoFactor],
    ];
    elements.forEach(([id, event, handler]) => {
      const element = this.shadow.getElementById(id);
      if (element) element.removeEventListener(event, handler.bind(this));
    });
    this.shadow.querySelectorAll(".input-field").forEach(input => {
      input.removeEventListener("blur", this.validateInput.bind(this));
    });
  }

  async handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (!file || !file.type.match('image.*') || file.size > 5 * 1024 * 1024) {
      this.showNotification(file ? (file.type.match('image.*') ? "Image size should be less than 5MB" : "Please select an image file") : "No file selected", false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const profileImage = this.shadow.getElementById("profileImage");
      profileImage.src = e.target.result;  // Preview the image locally
      try {
        const accessToken = localStorage.getItem('access_token');
        const data = await this.#api.uploadProfilePicture(accessToken, file);
        profileImage.src = data.profile_picture_url;
        this.showNotification("Profile picture updated", true);
      } catch (error) {
        this.handleApiError(error, () => this.#api.uploadProfilePicture(this.#api.refreshToken(), file));
      }
    };
    reader.readAsDataURL(file);
  }

  togglePasswordVisibility() {
    const passwordInput = this.shadow.getElementById("password");
    const showIcon = this.shadow.querySelector(".show-password");
    const hideIcon = this.shadow.querySelector(".hide-password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      showIcon.setAttribute("hidden", "");
      hideIcon.removeAttribute("hidden");
    } else {
      passwordInput.type = "password";
      hideIcon.setAttribute("hidden", "");
      showIcon.removeAttribute("hidden");
    }
  }

  checkPasswordStrength(event) {
    const password = event.target.value;
    const strengthBars = this.shadow.querySelectorAll(".strength-bar");
    const strengthText = this.shadow.getElementById("strengthText");
    strengthBars.forEach(bar => bar.className = "strength-bar");
    if (!password) {
      strengthText.textContent = "Password strength";
      return;
    }
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    strengthBars.forEach((bar, i) => {
      if (i < strength) bar.classList.add(strength === 1 ? "weak" : strength === 2 ? "fair" : strength === 3 ? "good" : "strong");
    });
    strengthText.textContent = strength === 0 ? "Very weak" : strength === 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong";
  }

  validateInput(event) {
    const input = event.target;
    const errorElement = this.shadow.getElementById(`${input.id}-error`);
    if (!input.checkValidity() && input.value) {
      errorElement.classList.remove("hidden");
      input.classList.add("invalid");
      return false;
    } else {
      errorElement.classList.add("hidden");
      input.classList.remove("invalid");
      return true;
    }
  }

  validateForm(formType) {
    const inputs = formType === "general" 
      ? ["firstname", "lastname", "username"] 
      : ["email", "phone"];
    return inputs.every(id => this.validateInput({ target: this.shadow.getElementById(id) }));
  }

  async updateGeneralInfo() {
    if (!this.validateForm("general")) {
      this.showNotification("Please fix the errors in the form", false);
      return;
    }

    const data = {
      first_name: this.shadow.getElementById("firstname").value,
      last_name: this.shadow.getElementById("lastname").value,
      username: this.shadow.getElementById("username").value,
    };

    try {
      const accessToken = localStorage.getItem('access_token');
      const updatedData = await this.#api.updateUserData(accessToken, data);
      this.populateUserData(updatedData);
      this.showNotification("General information updated", true);
    } catch (error) {
      this.handleApiError(error, () => this.#api.updateUserData(this.#api.refreshToken(), data));
    }
  }

  async updateSecurityInfo() {
    if (!this.validateForm("security")) {
      this.showNotification("Please fix the errors in the form", false);
      return;
    }

    const data = {
      email: this.shadow.getElementById("email").value,
      phone_number: this.shadow.getElementById("phone").value,
    };
    const password = this.shadow.getElementById("password").value;
    if (password) data.password = password;

    try {
      const accessToken = localStorage.getItem('access_token');
      const updatedData = await this.#api.updateUserData(accessToken, data);
      this.populateUserData(updatedData);
      this.shadow.getElementById("password").value = '';
      this.checkPasswordStrength({ target: { value: '' } });
      this.showNotification("Security information updated", true);
    } catch (error) {
      this.handleApiError(error, () => this.#api.updateUserData(this.#api.refreshToken(), data));
    }
  }
 
    async toggleTwoFactor(event) {
      const toggleElement = event.target;
      const isEnabled = toggleElement.checked;
      try {
	const accessToken = localStorage.getItem('access_token');
	if (isEnabled) {
	  const qrData = await this.#api.enable2FA(accessToken);
	  appState.currentPage = '/tfa'; // Navigate to TFA page for verification
	} else {
	  const data = { is_2fa_enabled: false };
	  const updatedData = await this.#api.updateUserData(accessToken, data);
	  this.populateUserData(updatedData);
	  this.showNotification("Two-factor authentication disabled", true);
	}
      } catch (error) {
	this.handleApiError(error, async () => {
	  if (isEnabled) {
	    return this.#api.enable2FA(await this.#api.refreshToken());
	  } else {
	    return this.#api.updateUserData(await this.#api.refreshToken(), { is_2fa_enabled: false });
	  }
	}, () => {
	  if (toggleElement) toggleElement.checked = !isEnabled; // Revert toggle on failure
	});
      }
    }
  

  async handleApiError(error, retryFunction, onFailure) {
    console.error('API error:', error);
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      try {
        const newAccessToken = await this.#api.refreshToken();
        const result = await retryFunction(newAccessToken);
        if (result.qr_code) {
          appState.qrCode = result.qr_code;
          appState.currentPage = '/tfa';
          window.dispatchEvent(new CustomEvent('stateChanged', { detail: { value: '/tfa' } }));
        } else {
          this.populateUserData(result);
          this.showNotification("Operation successful after retry", true);
        }
      } catch (refreshError) {
        this.showNotification('Session expired. Please log in again.', false);
        setTimeout(() => {
          appState.currentPage = '/login';
          window.dispatchEvent(new CustomEvent('stateChanged', { detail: { value: '/login' } }));
        }, 2000);
      }
    } else {
      // Handle 500 errors more gracefully
      const errorMessage = error.message.includes('500') 
        ? "An unexpected error occurred while enabling 2FA. Please try again later." 
        : (error.message || "Operation failed");
      this.showNotification(errorMessage, false);
      if (onFailure) onFailure(); // Call the failure callback if provided
    }
  }

  showNotification(message, isSuccess) {
    const notification = this.shadow.getElementById("notification");
    const notificationMessage = this.shadow.querySelector(".notification-message");
    const successIcon = this.shadow.querySelector(".notification-icon.success");
    const errorIcon = this.shadow.querySelector(".notification-icon.error");

    notificationMessage.textContent = message;
    notification.className = `notification show ${isSuccess ? 'success' : 'error'}`;
    successIcon.hidden = !isSuccess;
    errorIcon.hidden = isSuccess;
    setTimeout(() => notification.className = "notification", 3000);
  }
}

customElements.define("settings-page", SETTINGS);
export default SETTINGS;

