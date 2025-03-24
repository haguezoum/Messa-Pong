let template = document.createElement("template");

template.innerHTML = /*html*/`
<div id="profile-page" class="profile-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="container-content">
      <div class="profile-header">
        <h1>USER PROFILE 👶🏻</h1>
      </div>
      <div class="profile-content">
      <div class="profile-content-infos">
        <div class="profile-content-infos-header">
          <div class="profile-content-infos-header-username">
            <h2>
              <span>Hi, </span>
              <span class="ownerName" id="displayUsername">Hassan Aguezoum</span>
              <span class="wavingHand">👋🏽</span>
            </h2>
          </div>
          <div class="profile-content-infos-message">
            <p>Manage your details, view your game statistics and change your security settings</p>
          </div>
        </div>

        <section class="profile-content-infos-details">
          <div class="profilePictureChanger">
            <div class="picturChanger">
              <img src="/placeholder.svg" alt="Profile Picture" class="profilePicture" id="profileImage">
              <div class="changePicture">
                <label for="file" class="changePictureIcon">
                  <input type="file" class="file-input" id="file" accept="image/*" />
                  <ion-icon name="camera-outline" size="large" aria-hidden="true" aria-label="Change Personal Picture"></ion-icon>
                </label>
              </div>
            </div>
            <div class="userBasicInfo">
              <div class="userFullName" id="displayFullName">
                Hassan Aguezoum
              </div>
              <div class="userPhoneNumber" id="displayPhone">
                +212771426752
              </div>
              <div class="userStats">
                <div class="stat-item">
                  <span class="stat-label">Games</span>
                  <span class="stat-value" id="totalGames">42</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Wins</span>
                  <span class="stat-value" id="totalWins">28</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Win Rate</span>
                  <span class="stat-value" id="winRate">67%</span>
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
                  <input type="password" class="input-field" id="password" name="password" placeholder="Enter your password" autocomplete="new-password" required tabindex="5">
                  <button type="button" class="toggle-password" id="togglePassword">
                    <ion-icon name="eye-outline" class="show-password"></ion-icon>
                    <ion-icon name="eye-off-outline" class="hide-password"></ion-icon>
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
      <span class="notification-message">Profile updated successfully!</span>
    </div>
  </div>
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
    this.initializeProfile();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    console.log('PROFILE is Disconnected');
    this.removeEventListeners();
  }

  static get observedAttributes() {
    return ["user-data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "user-data" && oldValue !== newValue) {
      try {
        const userData = JSON.parse(newValue);
        this.populateUserData(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }

  // ------------------------------ Methods ------------------------------
  
  initializeProfile() {
    // Set default profile image if none exists
    const profileImage = this.shadow.getElementById("profileImage");
    profileImage.src = profileImage.src || "https://i.pravatar.cc/150?img=12";
    
    // Fetch user data from API or use default
    this.fetchUserData();
  }
  
  async fetchUserData() {
    try {
      // In a real app, you would fetch from your API
      // For demo purposes, we'll use mock data
      const userData = {
        firstName: "Hassan",
        lastName: "Aguezoum",
        username: "haguezoum",
        email: "hassan.aguezoum@example.com",
        phone: "+212771426752",
        twoFactorEnabled: false,
        profilePicture: "https://i.pravatar.cc/150?img=12",
        gameStats: {
          totalGames: 42,
          wins: 28,
          losses: 10,
          draws: 4
        }
      };
      
      this.populateUserData(userData);
    } catch (error) {
      this.showNotification("Failed to load user data", false);
      console.error("Error fetching user data:", error);
    }
  }
  
  populateUserData(userData) {
    // Populate display elements
    this.shadow.getElementById("displayUsername").textContent = userData.username;
    this.shadow.getElementById("displayFullName").textContent = `${userData.firstName} ${userData.lastName}`;
    this.shadow.getElementById("displayPhone").textContent = userData.phone;
    this.shadow.getElementById("profileImage").src = userData.profilePicture;
    
    // Populate form fields
    this.shadow.getElementById("firstname").value = userData.firstName;
    this.shadow.getElementById("lastname").value = userData.lastName;
    this.shadow.getElementById("username").value = userData.username;
    this.shadow.getElementById("email").value = userData.email;
    this.shadow.getElementById("phone").value = userData.phone;
    this.shadow.getElementById("twoFactorToggle").checked = userData.twoFactorEnabled;
    
    // Populate game stats
    if (userData.gameStats) {
      this.shadow.getElementById("totalGames").textContent = userData.gameStats.totalGames;
      this.shadow.getElementById("totalWins").textContent = userData.gameStats.wins;
      const winRate = Math.round((userData.gameStats.wins / userData.gameStats.totalGames) * 100);
      this.shadow.getElementById("winRate").textContent = `${winRate}%`;
    }
  }
  
  setupEventListeners() {
    // File upload for profile picture
    const fileInput = this.shadow.getElementById("file");
    fileInput.addEventListener("change", this.handleProfilePictureChange.bind(this));
    
    // Password toggle visibility
    const togglePassword = this.shadow.getElementById("togglePassword");
    togglePassword.addEventListener("click", this.togglePasswordVisibility.bind(this));
    
    // Password strength meter
    const passwordInput = this.shadow.getElementById("password");
    passwordInput.addEventListener("input", this.checkPasswordStrength.bind(this));
    
    // Form validation and submission
    const updateGeneralBtn = this.shadow.getElementById("updateGeneralBtn");
    updateGeneralBtn.addEventListener("click", this.updateGeneralInfo.bind(this));
    
    const updateSecurityBtn = this.shadow.getElementById("updateSecurityBtn");
    updateSecurityBtn.addEventListener("click", this.updateSecurityInfo.bind(this));
    
    // 2FA toggle
    const twoFactorToggle = this.shadow.getElementById("twoFactorToggle");
    twoFactorToggle.addEventListener("change", this.toggleTwoFactor.bind(this));
    
    // Input validation
    const inputs = this.shadow.querySelectorAll(".input-field");
    inputs.forEach(input => {
      input.addEventListener("blur", this.validateInput.bind(this));
    });
  }
  
  removeEventListeners() {
    // Remove all event listeners when component is disconnected
    const fileInput = this.shadow.getElementById("file");
    fileInput?.removeEventListener("change", this.handleProfilePictureChange.bind(this));
    
    const togglePassword = this.shadow.getElementById("togglePassword");
    togglePassword?.removeEventListener("click", this.togglePasswordVisibility.bind(this));
    
    const passwordInput = this.shadow.getElementById("password");
    passwordInput?.removeEventListener("input", this.checkPasswordStrength.bind(this));
    
    const updateGeneralBtn = this.shadow.getElementById("updateGeneralBtn");
    updateGeneralBtn?.removeEventListener("click", this.updateGeneralInfo.bind(this));
    
    const updateSecurityBtn = this.shadow.getElementById("updateSecurityBtn");
    updateSecurityBtn?.removeEventListener("click", this.updateSecurityInfo.bind(this));
    
    const twoFactorToggle = this.shadow.getElementById("twoFactorToggle");
    twoFactorToggle?.removeEventListener("change", this.toggleTwoFactor.bind(this));
    
    const inputs = this.shadow.querySelectorAll(".input-field");
    inputs.forEach(input => {
      input?.removeEventListener("blur", this.validateInput.bind(this));
    });
  }
  
  handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        this.showNotification("Please select an image file", false);
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showNotification("Image size should be less than 5MB", false);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const profileImage = this.shadow.getElementById("profileImage");
        profileImage.src = e.target.result;
        this.showNotification("Profile picture updated", true);
        
        // In a real app, you would upload the image to your server here
        // this.uploadProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
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
    
    // Reset all bars
    strengthBars.forEach(bar => {
      bar.className = "strength-bar";
    });
    
    if (!password) {
      strengthText.textContent = "Password strength";
      return;
    }
    
    // Check password strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update strength bars
    for (let i = 0; i < strength; i++) {
      strengthBars[i].classList.add(
        strength === 1 ? "weak" : 
        strength === 2 ? "fair" : 
        strength === 3 ? "good" : 
        "strong"
      );
    }
    
    // Update strength text
    strengthText.textContent = 
      strength === 0 ? "Very weak" : 
      strength === 1 ? "Weak" : 
      strength === 2 ? "Fair" : 
      strength === 3 ? "Good" : 
      "Strong";
  }
  
  validateInput(event) {
    const input = event.target;
    const errorElement = this.shadow.getElementById(`${input.id}-error`);
    
    if (!input.checkValidity()) {
      errorElement.removeAttribute("hidden");
      errorElement.classList.remove("hidden");
      input.classList.add("invalid");
      return false;
    } else {
      errorElement.setAttribute("hidden", "");
      errorElement.classList.add("hidden");
      input.classList.remove("invalid");
      return true;
    }
  }
  
  validateForm(formType) {
    let isValid = true;
    let inputs;
    
    if (formType === "general") {
      inputs = [
        this.shadow.getElementById("firstname"),
        this.shadow.getElementById("lastname"),
        this.shadow.getElementById("username")
      ];
    } else if (formType === "security") {
      inputs = [
        this.shadow.getElementById("email"),
        this.shadow.getElementById("password"),
        this.shadow.getElementById("phone")
      ];
    }
    
    inputs.forEach(input => {
      if (!this.validateInput({ target: input })) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  updateGeneralInfo() {
    if (!this.validateForm("general")) {
      this.showNotification("Please fix the errors in the form", false);
      return;
    }
    
    const firstName = this.shadow.getElementById("firstname").value;
    const lastName = this.shadow.getElementById("lastname").value;
    const username = this.shadow.getElementById("username").value;
    
    // Update display elements
    this.shadow.getElementById("displayUsername").textContent = username;
    this.shadow.getElementById("displayFullName").textContent = `${firstName} ${lastName}`;
    
    // In a real app, you would send this data to your API
    // this.updateUserData({ firstName, lastName, username });
    
    this.showNotification("General information updated successfully", true);
  }
  
  updateSecurityInfo() {
    if (!this.validateForm("security")) {
      this.showNotification("Please fix the errors in the form", false);
      return;
    }
    
    const email = this.shadow.getElementById("email").value;
    const password = this.shadow.getElementById("password").value;
    const phone = this.shadow.getElementById("phone").value;
    
    // Update display elements
    this.shadow.getElementById("displayPhone").textContent = phone;
    
    // In a real app, you would send this data to your API
    // this.updateUserSecurity({ email, password, phone });
    
    this.showNotification("Security information updated successfully", true);
  }
  
  toggleTwoFactor(event) {
    const isEnabled = event.target.checked;
    
    // In a real app, you would send this to your API
    // this.updateTwoFactorStatus(isEnabled);
    
    this.showNotification(`Two-factor authentication ${isEnabled ? 'enabled' : 'disabled'}`, true);
  }
  
  showNotification(message, isSuccess) {
    const notification = this.shadow.getElementById("notification");
    const notificationMessage = this.shadow.querySelector(".notification-message");
    const successIcon = this.shadow.querySelector(".notification-icon.success");
    const errorIcon = this.shadow.querySelector(".notification-icon.error");
    
    notificationMessage.textContent = message;
    
    if (isSuccess) {
      successIcon.removeAttribute("hidden");
      errorIcon.setAttribute("hidden", "");
      notification.className = "notification show success";
    } else {
      errorIcon.removeAttribute("hidden");
      successIcon.setAttribute("hidden", "");
      notification.className = "notification show error";
    }
    
    setTimeout(() => {
      notification.className = "notification";
    }, 3000);
  }
}

customElements.define("profile-page", PROFILE);

export default PROFILE;