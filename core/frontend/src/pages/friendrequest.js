const template = document.createElement("template")

template.innerHTML = /*html*/ `
<div id="friend-request" class="friend-request">
  <div class="container">
    <header-bar></header-bar>
    <div class="request-container">
    <div class="request-header">
      <h2>Friend Request</h2>
    </div>
    
    <div class="request-content">
      <div class="request-list" id="requestList">
        <!-- Friend requests will be added here dynamically -->
      </div>
      
      <!-- Empty state when no requests -->
      <div class="empty-state" id="emptyState">
        <ion-icon name="people-outline" class="empty-icon"></ion-icon>
        <p>No friend requests at the moment</p>
      </div>
    </div>
    </div>  
    <!-- Template for a single friend request -->
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
        <span class="notification-message">Friend request accepted!</span>
      </div>
    </div>
  </div>
  <cloud-moving></cloud-moving>
</div>`;

class FRIENDREQUEST extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/friendrequest-page.css');
    this.shadow.appendChild(linkElem);
    // Store friend requests data
    this.requests = []; 
  }

  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true))
    this.initializeRequests()
    this.setupEventListeners()
  }
  
  disconnectedCallback() {
    this.removeEventListeners();
  }

  static get observedAttributes() {
    return ["requests-data"]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "requests-data" && oldValue !== newValue) {
      try {
        const requestsData = JSON.parse(newValue)
        this.requests = requestsData
        this.renderRequests()
      } catch (error) {
        console.error("Error parsing requests data:", error)
      }
    }
  }

  // ------------------------------ Methods ------------------------------

  initializeRequests() {
    // Fetch friend requests from API or use default
    this.fetchRequests()
  }

  async fetchRequests() {
    try {
      // In a real app, you would fetch from your API
      // For demo purposes, we'll use mock data
      // use /request endpoint to fetch friend requests
      const requestsData = [
        {
          id: 1,
          name: "Hassan Aguezoum",
          username:"hassan",
          avatar: "https://i.pravatar.cc/150?img=12",
          time: "2 hours ago",
        },
        {
          id: 2,
          name: "Sarah Johnson",
          username:"sarah",
          avatar: "https://i.pravatar.cc/150?img=5",
          time: "1 day ago",
        },
        {
          id: 3,
          name: "Dahmad botfonast ",
          username:"dahmad",
          avatar: "https://i.pravatar.cc/150?img=8",
          time: "3 days ago",
        },
      ]

      this.requests = requestsData
      this.renderRequests()
    } catch (error) {
      this.showNotification("Failed to load friend requests", false)
      console.error("Error fetching friend requests:", error)
    }
  }

  renderRequests() {
    const requestList = this.shadow.getElementById("requestList")
    const emptyState = this.shadow.getElementById("emptyState")
    const requestTemplate = this.shadow.getElementById("requestTemplate")

    // Clear existing requests
    requestList.innerHTML = ""

    // Show empty state if no requests
    if (this.requests.length === 0) {
      emptyState.style.display = "flex"
      return
    }

    // Hide empty state
    emptyState.style.display = "none"

    // Render each request
    this.requests.forEach((request) => {
      const requestElement = requestTemplate.content.cloneNode(true)

      // Set request data
      requestElement.querySelector(".avatar-img").src = request.avatar
      requestElement.querySelector(".avatar-img").alt = `${request.name}'s avatar`
      requestElement.querySelector(".user-name").textContent = request.name
      requestElement.querySelector(".user-name").setAttribute("id", request.id)
      requestElement.querySelector(".user-name").onclick = function() {
        // app.state.currentPage = `/publicProfile/${request.id}`;
        app.state.currentPage = `/${request.username}`;
      }
      requestElement.querySelector(".request-time").textContent = request.time

      // Add data attribute for request ID
      const requestItem = requestElement.querySelector(".request-item")
      requestItem.dataset.requestId = request.id

      // Add event listeners
      const acceptBtn = requestElement.querySelector(".accept-btn")
      const rejectBtn = requestElement.querySelector(".reject-btn")

      acceptBtn.addEventListener("click", () => this.acceptRequest(request.id))
      rejectBtn.addEventListener("click", () => this.rejectRequest(request.id))

      // Add to list
      requestList.appendChild(requestElement)
    })
  }

  setupEventListeners() {
    // No global event listeners needed for now
  }

  removeEventListeners() {
    // No global event listeners to remove
  }

  acceptRequest(requestId) {
    // Find the request
    const request = this.requests.find((r) => r.id === requestId)
    if (!request) return

    // In a real app, you would send this to your API
    // this.sendAcceptRequest(requestId);

    // Show notification
    this.showNotification(`You are now friends with ${request.name}`, true)

    // Remove from list
    this.removeRequest(requestId)
  }

  rejectRequest(requestId) {
    // Find the request
    const request = this.requests.find((r) => r.id === requestId)
    if (!request) return

    // In a real app, you would send this to your API
    // this.sendRejectRequest(requestId);

    // Show notification
    this.showNotification(`Friend request from ${request.name} rejected`, false)

    // Remove from list
    this.removeRequest(requestId)
  }

  removeRequest(requestId) {
    // Remove from data
    this.requests = this.requests.filter((r) => r.id !== requestId)

    // Remove from DOM with animation
    const requestItem = this.shadow.querySelector(`.request-item[data-request-id="${requestId}"]`)
    if (requestItem) {
      requestItem.classList.add("removing")

      // Remove after animation
      setTimeout(() => {
        requestItem.remove()

        // Check if list is empty
        if (this.requests.length === 0) {
          this.shadow.getElementById("emptyState").style.display = "flex"
        }
      }, 300)
    }
  }

  showNotification(message, isSuccess) {
    const notification = this.shadow.getElementById("notification")
    const notificationMessage = this.shadow.querySelector(".notification-message")
    const successIcon = this.shadow.querySelector(".notification-icon.success")

    notificationMessage.textContent = message

    if (isSuccess) {
      successIcon.setAttribute("name", "checkmark-circle-outline")
      notification.className = "notification show success"
    } else {
      successIcon.setAttribute("name", "close-circle-outline")
      notification.className = "notification show error"
    }

    setTimeout(() => {
      notification.className = "notification"
    }, 3000)
  }

  // Method to add a new friend request (can be called from outside)
  addRequest(request) {
    this.requests.push(request)
    this.renderRequests()
  }
}
customElements.define('friendrequest-page', FRIENDREQUEST);

export default FRIENDREQUEST;