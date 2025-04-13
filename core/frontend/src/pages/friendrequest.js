const template = document.createElement("template");

template.innerHTML = /*html*/ `
<div id="friend-request" class="friend-request">
  <div class="container">
    <header-bar></header-bar>
    <div class="request-container">
      <div class="request-header">
        <h2>Friend Requests</h2>
      </div>
      <div class="request-content">
        <div class="request-list" id="requestList"></div>
        <div class="empty-state" id="emptyState">
          <ion-icon name="people-outline" class="empty-icon"></ion-icon>
          <p>No friend requests at the moment</p>
        </div>
      </div>
    </div>
    <template id="requestTemplate">
      <div class="request-item">
        <div class="user-info">
          <div class="user-avatar">
            <img src="/placeholder.svg" alt="User Avatar" class="avatar-img">
          </div>
          <div class="user-details">
            <h3 class="user-name"></h3>
            <p class="request-time"></p>
          </div>
        </div>
        <div class="request-actions">
          <button class="action-btn accept-btn">
            <ion-icon name="checkmark-outline"></ion-icon>
            Accept
          </button>
          <button class="action-btn reject-btn">
            <ion-icon name="close-outline"></ion-icon>
            Reject
          </button>
        </div>
      </div>
    </template>
    <div class="notification" id="notification">
      <div class="notification-content">
        <ion-icon name="checkmark-circle-outline" class="notification-icon success"></ion-icon>
        <span class="notification-message"></span>
      </div>
    </div>
  </div>
  <cloud-moving></cloud-moving>
</div>`;

class FRIENDREQUEST extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/friendrequest-page.css");
    this.shadow.appendChild(linkElem);
    this.requests = [];
    this.apiBaseUrl = "https://localhost/api";
    this.token = localStorage.getItem("access_token");
  }

  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    this.initializeRequests();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  static get observedAttributes() {
    return ["requests-data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "requests-data" && oldValue !== newValue) {
      try {
        this.requests = JSON.parse(newValue);
        this.renderRequests();
      } catch (error) {
        console.error("Error parsing requests data:", error);
      }
    }
  }

  // ------------------------------ Methods ------------------------------

  initializeRequests() {
    this.fetchRequests();
  }

  async fetchRequests() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friend-requests/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.requests = data.filter(
        (request) => request.status === "pending" && request.to_user.id !== request.from_user.id
      ).map((request) => ({
        id: request.id,
        name: request.from_user.username,
        username: request.from_user.username,
        avatar: request.from_user.profile_picture,
        time: this.formatTime(request.created_at),
      }));

      this.renderRequests();
    } catch (error) {
      this.showNotification("Failed to load friend requests", false);
      console.error("Error fetching friend requests:", error);
    }
  }

  renderRequests() {
    const requestList = this.shadow.getElementById("requestList");
    const emptyState = this.shadow.getElementById("emptyState");
    const requestTemplate = this.shadow.getElementById("requestTemplate");

    requestList.innerHTML = "";

    if (this.requests.length === 0) {
      emptyState.style.display = "flex";
      return;
    }

    emptyState.style.display = "none";

    this.requests.forEach((request) => {
      const requestElement = requestTemplate.content.cloneNode(true);

      requestElement.querySelector(".avatar-img").src = request.avatar;
      requestElement.querySelector(".avatar-img").alt = `${request.name}'s avatar`;
      requestElement.querySelector(".user-name").textContent = request.name;
      requestElement.querySelector(".user-name").onclick = () => {
        app.state.currentPage = `/users/${request.username}`; // Navigate to public profile
      };
      requestElement.querySelector(".request-time").textContent = request.time;

      const requestItem = requestElement.querySelector(".request-item");
      requestItem.dataset.requestId = request.id;

      const acceptBtn = requestElement.querySelector(".accept-btn");
      const rejectBtn = requestElement.querySelector(".reject-btn");

      acceptBtn.addEventListener("click", () => this.acceptRequest(request.id, request.name));
      rejectBtn.addEventListener("click", () => this.rejectRequest(request.id, request.name));

      requestList.appendChild(requestElement);
    });
  }

  async acceptRequest(requestId, name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friend-requests/${requestId}/accept/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.showNotification(`You are now friends with ${name}`, true);
      this.removeRequest(requestId);
    } catch (error) {
      this.showNotification("Failed to accept friend request", false);
      console.error("Error accepting friend request:", error);
    }
  }

  async rejectRequest(requestId, name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friend-requests/${requestId}/reject/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.showNotification(`Friend request from ${name} rejected`, false);
      this.removeRequest(requestId);
    } catch (error) {
      this.showNotification("Failed to reject friend request", false);
      console.error("Error rejecting friend request:", error);
    }
  }

  removeRequest(requestId) {
    this.requests = this.requests.filter((r) => r.id !== requestId);
    const requestItem = this.shadow.querySelector(`.request-item[data-request-id="${requestId}"]`);
    if (requestItem) {
      requestItem.classList.add("removing");
      setTimeout(() => {
        requestItem.remove();
        if (this.requests.length === 0) {
          this.shadow.getElementById("emptyState").style.display = "flex";
        }
      }, 300);
    }
  }

  showNotification(message, isSuccess) {
    const notification = this.shadow.getElementById("notification");
    const notificationMessage = this.shadow.querySelector(".notification-message");
    const successIcon = this.shadow.querySelector(".notification-icon.success");

    notificationMessage.textContent = message;
    successIcon.setAttribute("name", isSuccess ? "checkmark-circle-outline" : "close-circle-outline");
    notification.className = `notification show ${isSuccess ? "success" : "error"}`;

    setTimeout(() => {
      notification.className = "notification";
    }, 3000);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  setupEventListeners() {
    // Add any global event listeners if needed
  }

  removeEventListeners() {
    // Clean up global event listeners if added
  }
}

customElements.define("friendrequest-page", FRIENDREQUEST);

export default FRIENDREQUEST;
