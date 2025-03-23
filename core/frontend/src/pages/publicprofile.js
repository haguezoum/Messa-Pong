// Create template for the web component
const template = document.createElement('template');

template.innerHTML = /*html*/`
<div class="profile-container">
<div class="container">   
    <header-bar></header-bar>
    <div class="profile-card">
      <div class="profile-header">
        <h1 class="fs-1 text-warning" >USER PROFILE 👶🏻</h1>
      </div>

      <div class="profile-content">
        <div class="profile-picture-section">
          <div class="profile-picture-wrapper">
            <img src="" alt="Profile Picture" id="profilePicture" class="profile-picture">
          </div>

          <div class="profile-info">
            <h2 id="fullName"></h2>
            <div class="username-container">
              <span id="username"></span>
              <button id="copyUsername" class="icon-button" title="Copy username">
                <ion-icon name="copy-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button id="addFriend" class="action-button primary-button">
            <ion-icon name="person-add-outline"></ion-icon>
            Add Friend
          </button>

          <div class="dropdown">
            <button id="optionsButton" class="action-button secondary-button">
              <ion-icon name="ellipsis-horizontal"></ion-icon>
              Options
            </button>
            <div id="dropdownMenu" class="dropdown-content">
              <button id="blockUser" class="dropdown-item">
                <ion-icon name="ban-outline"></ion-icon>
                Block User
              </button>
              <button id="shareProfile" class="dropdown-item">
                <ion-icon name="share-social-outline"></ion-icon>
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <cloud-moving></cloud-moving>
</div>

<div id="notification" class="notification">
  <div class="notification-content">
    <ion-icon name="checkmark-circle-outline" class="notification-icon success"></ion-icon>
    <span id="notificationMessage" class="notification-message">Copied to clipboard!</span>
  </div>
</div>
`;

class PUBLICPROFILE extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/publicprofile-page.css');
    this.shadowRoot.appendChild(linkElem);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Bind methods to this
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.copyUsername = this.copyUsername.bind(this);
    this.toggleFriend = this.toggleFriend.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.shareProfile = this.shareProfile.bind(this);
  }

  connectedCallback() {
    // Initialize user data
    this.fullName =  this.shadowRoot.getElementById('fullName');
    this.username = this.shadowRoot.getElementById('username');
    this.profilePicture = this.shadowRoot.getElementById('profilePicture');
    this.initializeProfile();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  static get observedAttributes() {
    return ['user-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    // Update user data
    // this.initializeProfile();
  }


  // Set up all event listeners
  setupEventListeners() {
    // Toggle dropdown menu
    const optionsBtn = this.shadowRoot.getElementById('optionsButton');
    optionsBtn.addEventListener('click', this.toggleDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside);
    
    // Copy username to clipboard
    const copyUsernameBtn = this.shadowRoot.getElementById('copyUsername');
    copyUsernameBtn.addEventListener('click', this.copyUsername);
    
    // Add friend functionality
    const addFriendBtn = this.shadowRoot.getElementById('addFriend');
    addFriendBtn.addEventListener('click', this.toggleFriend);
    
    // Block user functionality
    const blockUserBtn = this.shadowRoot.getElementById('blockUser');
    blockUserBtn.addEventListener('click', this.blockUser);
    
    // Share profile functionality
    const shareProfileBtn = this.shadowRoot.getElementById('shareProfile');
    shareProfileBtn.addEventListener('click', this.shareProfile);
  }

  // Remove all event listeners
  removeEventListeners() {
    const optionsBtn = this.shadowRoot.getElementById('optionsButton');
    optionsBtn?.removeEventListener('click', this.toggleDropdown);
    
    document.removeEventListener('click', this.handleClickOutside);
    
    const copyUsernameBtn = this.shadowRoot.getElementById('copyUsername');
    copyUsernameBtn?.removeEventListener('click', this.copyUsername);
    
    const addFriendBtn = this.shadowRoot.getElementById('addFriend');
    addFriendBtn?.removeEventListener('click', this.toggleFriend);
    
    const blockUserBtn = this.shadowRoot.getElementById('blockUser');
    blockUserBtn?.removeEventListener('click', this.blockUser);
    
    const shareProfileBtn = this.shadowRoot.getElementById('shareProfile');
    shareProfileBtn?.removeEventListener('click', this.shareProfile);
  }

  // Toggle dropdown menu
  toggleDropdown() {
    console.log('toggleDropdown');
    const dropdownMenu = this.shadowRoot.getElementById('dropdownMenu');
    (dropdownMenu.style.display === 'block') ? dropdownMenu.style.display = 'none': dropdownMenu.style.display = 'block';
  }
  // Handle clicks outside the dropdown
  handleClickOutside(event) {
    // const dropdownMenu = this.shadowRoot.getElementById('dropdownMenu');
    // const optionsBtn = this.shadowRoot.getElementById('optionsButton');
    
    // if (!optionsBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
    //   dropdownMenu.style.display = 'none';
    // }
  }

  // Copy username to the clipboard
  copyUsername() {
    const username = this.shadowRoot.getElementById('username').textContent;
    navigator.clipboard.writeText(username)
      .then(() => {
        this.showNotification('Username copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        this.showNotification('Failed to copy username', false);
      });
  }

  // Toggle friend status
  toggleFriend() {
    const addFriendBtn = this.shadowRoot.getElementById('addFriend');
    const isAdded = addFriendBtn.classList.contains('added');
    
    if (isAdded) {
      addFriendBtn.innerHTML = '<ion-icon name="person-add-outline"></ion-icon> Add Friend';
      addFriendBtn.classList.remove('added');
      this.showNotification('Friend removed');
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('friendRemoved', {
        bubbles: true,
        composed: true
      }));
    } else {
      addFriendBtn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon> Friends';
      addFriendBtn.classList.add('added');
      this.showNotification('Friend added successfully!');
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('friendAdded', {
        bubbles: true,
        composed: true
      }));
    }
  }

  // Block user functionality
  blockUser() {
    this.showNotification('User blocked');
    this.shadowRoot.getElementById('dropdownMenu').classList.remove('show');
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('userBlocked', {
      bubbles: true,
      composed: true,
      detail: {
        username: this.getAttribute('username') || 'haguezoum'
      }
    }));
  }

  // Share profile functionality
  shareProfile() {
    const username = this.shadowRoot.getElementById('username').textContent.substring(1);
    const fullName = this.shadowRoot.getElementById('fullName').textContent;
    const shareUrl = `${window.location.origin}/user/${username}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out this profile',
        text: `Check out ${fullName}'s profile!`,
        url: shareUrl,
      })
      .then(() => {
        this.showNotification('Profile shared successfully!');
      })
      .catch(error => {
        console.error('Error sharing:', error);
        this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
    
    this.shadowRoot.getElementById('dropdownMenu').classList.remove('show');
  }

  // Helper function to copy text to clipboard
  copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        this.showNotification('Profile URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        this.showNotification('Failed to copy profile URL', false);
      });
  }

  // Show notification
  showNotification(message, isSuccess = true) {
    const notification = this.shadowRoot.getElementById('notification');
    const notificationMessage = this.shadowRoot.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    
    const successIcon = this.shadowRoot.querySelector('.notification-icon.success');
    if (isSuccess) {
      successIcon.style.display = 'block';
    } else {
      successIcon.style.display = 'none';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // fetch user data
  async initializeProfile() {
    // app.API('GET', `/users/${this.getAttribute('user-id')}`)
    const  data =  await fetch(`https://jsonplaceholder.typicode.com/users/${this.getAttribute('user-id')}`);
    const user = await data.json();
    this.fullName.textContent = user.name;
    this.username.textContent = user.username;
    this.profilePicture.src = `https://i.pravatar.cc/150?img=${user.id}`;
    history.replaceState({user: user}, null, `user/${user.username}`);

  }
}

// Define the custom element
customElements.define('user-profile-page', PUBLICPROFILE);

export default PUBLICPROFILE;
