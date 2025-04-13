const template = document.createElement("template");
template.innerHTML = /*html*/ `
<div id="public-profile-page" class="profile-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="container-content">
      <div class="profile-header">
        <h1>PUBLIC PROFILE</h1>
      </div>
      <div class="profile-content">
        <div class="profile-content-infos">
          <div class="profile-content-infos-header">
            <div class="profile-content-infos-header-username">
              <h2>
                <span>Hi, </span>
                <span class="ownerName" id="displayUsername"></span>
                <span class="wavingHand">👋🏽</span>
              </h2>
            </div>
            <div class="profile-content-infos-message">
              <p>Welcome to the public profile, connect with other peers</p>
            </div>
          </div>

          <section class="profile-content-infos-details">
            <div class="profilePictureChanger">
              <div class="picturChanger">
                <img src="/src/assets/images/default.jpg" alt="Profile Picture" class="profilePicture" id="profileImage">
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
                <div class="friend-actions" id="friendActions">
                  <button id="addFriendBtn" class="add-friend-btn">
                    <ion-icon name="person-add-outline"></ion-icon>
                    Add Friend
                  </button>
                  <button id="sendMessageBtn" class="send-message-btn">
                    <ion-icon name="chatbox-outline"></ion-icon>
                    Send Message
                  </button>
                </div>
              </div>
            </div>

            <div class="profileDashboard">
              <div class="title-box">
                <div class="dashboard-tabs">
                  <button class="dashboard-tab-button active" data-dashboard-tab="game">Dashboard</button>
                  <button class="dashboard-tab-button" data-dashboard-tab="friends">Friends List</button>
                </div>
              </div>
              <div class="dashboard-content">
                <div id="game-dashboard" class="dashboard-tab-content active">
                  <div class="dashboard-container">
                    <div class="dashboard-placeholder">
                      <div class="game-container">
                        <div class="tabs">
                          <button class="tab-button active" data-tab="stats">Game Stats</button>
                          <button class="tab-button" data-tab="history">Game History</button>
                        </div>
                
                        <div class="content-container">
                          <div id="stats-content" class="stats-contentTab tab-content active">
                            <div class="stats-container">
                              <game-statscard></game-statscard>
                            </div>
                            <div class="dashboard-charts">
                              <match-statschart></match-statschart>
                            </div> 
                            <div class="match-stats-container">
                              <h2 class="match-stats-title">Match Stats</h2>
                              <minutes-chart></minutes-chart>
                            </div>
                          </div>

                          <div id="history-content" class="tab-content history-contentTab">
                            <h2>Game History</h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="friends-dashboard" class="dashboard-tab-content">
                  <div class="friends-list-container">
                    <div class="friends-search">
                      <input type="text" placeholder="Search friends..." id="friendSearch">
                    </div>
                    <div class="friends-list" id="friendsList">
                      <!-- Friends will be populated here -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
  <div class="notification" id="notification">
    <div class="notification-content">
      <ion-icon name="checkmark-circle-outline" class="notification-icon success"></ion-icon>
      <ion-icon name="alert-circle-outline" class="notification-icon error"></ion-icon>
      <span class="notification-message"></span>
    </div>
  </div>
</div>

<style>
.dashboard-tabs {
  display: flex;
  gap: 20px;
}

.dashboard-tab-button {
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--font-color-secondry);
  cursor: pointer;
  font-family: var(--primary-font);
  font-size: 16px;
  position: relative;
}

.dashboard-tab-button.active {
  color: var(--font-color-primary);
}

.dashboard-tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--alive-blue);
}

.dashboard-tab-content {
  display: none;
}

.dashboard-tab-content.active {
  display: block;
}

.friends-list-container {
  padding: 20px;
}

.friends-search {
  margin-bottom: 20px;
}

.friends-search input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--alive-blue);
  border-radius: 8px;
  background: var(--secondary-blue-off);
  color: var(--font-color-primary);
}

.friends-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.friend-card {
  background: var(--secondary-blue-off);
  border: 1px solid var(--alive-blue);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
}

.friend-name {
  color: var(--font-color-primary);
  font-weight: bold;
  margin-bottom: 5px;
}

.friend-btn-with-hover {
  transition: all 0.3s ease;
}

.friend-btn-with-hover:hover {
  transform: scale(1.05);
}

.friend-status {
  color: var(--font-color-secondry);
  font-size: 14px;
}

.friend-status.online {
  color: var(--primary-success);
}

.hidden {
  display: none;
}
</style>
`;

class PublicProfile extends HTMLElement {
  #api = {
    async fetchUserProfile(userId) {
      // For numeric IDs or 'me'
      const url = userId ? `https://localhost/api/users/by-id/${userId}/` : "https://localhost/api/users/me/";
      console.log("Fetching URL:", url);
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
          if (response.status === 404) {
            console.log("User not found");
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response data:", data);
        
        // CRITICAL: Set the profileUserId immediately for API calls
        if (data && data.id) {
          this.profileUserId = data.id;
          console.log("✅ Set profileUserId from profile lookup:", this.profileUserId);
        } else {
          console.error("❌ No user ID found in profile API response");
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    },
    
    async fetchUserIdFromUsername(username) {
      console.log(`Searching for user ID by username: https://localhost/api/users/search/?search=${username}`);
      try {
        const response = await fetch(`https://localhost/api/users/search/?search=${username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (!response.ok) {
          console.log(`User search failed with status: ${response.status}`);
          
          // Try the direct lookup by username as fallback
          return this.tryDirectUsernameLookup(username);
        }
        
        const users = await response.json();
        if (users.length > 0) {
          // First try exact match
          const exactMatch = users.find(u => u.username === username);
          if (exactMatch) return exactMatch.id;
          
          // Fall back to the first result
          return users[0].id;
        }
        
        // If search returns empty but we have a username, try direct lookup
        return this.tryDirectUsernameLookup(username);
      } catch (error) {
        console.error("Error fetching user ID from username:", error);
        // Try the direct lookup by username as fallback
        return this.tryDirectUsernameLookup(username);
      }
    },
    
    // Add a fallback method for direct username lookup
    async tryDirectUsernameLookup(username) {
      try {
        console.log(`Trying direct username lookup: ${username}`);
        const response = await fetch(`https://localhost/api/users/by-username/${username}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (!response.ok) return null;
        
        const userData = await response.json();
        return userData.id;
      } catch (error) {
        console.error("Error in direct username lookup:", error);
        return null;
      }
    },
    
    async fetchUserByUsername(username) {
      try {
        // Use the new dedicated username-specific API endpoint
        const url = `https://localhost/api/users/by-username/${username}/`;
        console.log("Fetching user by username URL:", url);
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        console.log("Username lookup response status:", response.status);
        if (!response.ok) {
          if (response.status === 404) {
            console.log("User not found by username");
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Username lookup data:", data);
        
        // Get user ID using additional lookup if not directly included
        if (data && data.id) {
          this.profileUserId = data.id;
          console.log("✅ Set profileUserId directly from response:", this.profileUserId);
        } else if (data && data.username) {
          // The PublicUserSerializer doesn't include ID - make an additional request
          // to get the ID using the username we now have
          await this.fetchUserIdFromUsername(data.username);
        } else {
          console.error("❌ No user data found in API response");
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching user by username:", error);
        return null;
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await fetch("https://localhost/api/users/me/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
      }
    },

    async sendFriendRequest(targetUserId) {
      console.log("Sending friend request to user ID:", targetUserId);
      try {
        const response = await fetch("https://localhost/api/friend-requests/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to_user_id: targetUserId
          }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Friend request response:", data);
        return data;
      } catch (error) {
        console.error("Error sending friend request:", error);
        throw error;
      }
    },
    
    async removeFriend(friendId) {
      console.log("Removing friend with ID:", friendId);
      try {
        const response = await fetch(`https://localhost/api/friends/remove/${friendId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Friend removal response:", data);
        return data;
      } catch (error) {
        console.error("Error removing friend:", error);
        throw error;
      }
    },
    
    async cancelFriendRequest(userId) {
      console.log("Canceling friend request to user ID:", userId);
      try {
        const response = await fetch(`https://localhost/api/friend-requests/cancel/${userId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Cancel request response:", data);
        return data;
      } catch (error) {
        console.error("Error canceling friend request:", error);
        throw error;
      }
    },
    
    async blockUser(userId) {
      console.log("Blocking user ID:", userId);
      try {
        const response = await fetch("https://localhost/api/blocks/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blocked_user_id: userId
          }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Block user response:", data);
        return data;
      } catch (error) {
        console.error("Error blocking user:", error);
        throw error;
      }
    },
    
    async unblockUser(userId) {
      console.log("Unblocking user ID:", userId);
      try {
        const response = await fetch(`https://localhost/api/blocks/unblock/${userId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Unblock user response:", data);
        return data;
      } catch (error) {
        console.error("Error unblocking user:", error);
        throw error;
      }
    },

    async checkFriendshipStatus(targetUserId) {
      if (!targetUserId) {
        console.log("No targetUserId provided, skipping friendship check");
        return { status: "none" };
      }
      try {
        // Use the exact API path from your backend URLs
        const response = await fetch(`https://localhost/api/friends/status/${targetUserId}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
        });
        if (!response.ok) {
          console.log(`Friendship status returned ${response.status}, using default status`);
          return { status: "none" };
        }
        return response.json();
      } catch (error) {
        console.error("Error checking friendship status:", error);
        return { status: "none" };
      }
    },

    async acceptFriendRequest(requestId) {
      try {
        const response = await fetch(`https://localhost/api/friend-requests/${requestId}/accept/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error("Error accepting friend request:", error);
        throw error;
      }
    },

    async refreshToken() {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) throw new Error("No refresh token available");
      const response = await fetch("https://localhost/api/auth/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) throw new Error("Token refresh failed");
      const data = await response.json();
      localStorage.setItem("access_token", data.access);
      return data.access;
    },

    async getFriendsList(userId = null) {
      try {
        // If userId is provided, get that user's friends, otherwise get current user's friends
        let url = "https://localhost/api/friends/";
        if (userId) {
          url = `https://localhost/api/friends/by-user/${userId}/`;
        }
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const friendships = await response.json();
        return friendships.map(f => f.friend);
      } catch (error) {
        console.error("Error fetching friends list:", error);
        return [];
      }
    },

    async getGameHistory() {
      try {
        const response = await fetch("https://localhost/api/dashboard/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error("Error fetching game history:", error);
        return { game_history: [] };
      }
    },
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.userId = this.getAttribute("username") || null; // Username or ID from attribute or null for current user
    this.isNumericId = this.userId && !isNaN(parseInt(this.userId)); // Check if it's a numeric ID
    this.currentUserId = null;
    this.friendshipStatus = "none"; // none, pending, accepted, received
    this.friendRequestId = null;
    this.isCurrentUser = false;
    this.loadUserProfile = this.loadUserProfile.bind(this);
    this.checkFriendshipStatus = this.checkFriendshipStatus.bind(this);
    this.handleFriendRequest = this.handleFriendRequest.bind(this);
    this.showNotification = this.showNotification.bind(this);
    this.switchDashboardTab = this.switchDashboardTab.bind(this);
    this.loadFriendsList = this.loadFriendsList.bind(this);
    console.log("Profile initialized with userId:", this.userId, "isNumeric:", this.isNumericId);
  }

  async connectedCallback() {
    if (!this.isConnected) return;
    
    try {
      // Set up the shadow DOM with the template
      this.shadow.appendChild(template.content.cloneNode(true));
      const linkElem = document.createElement("link");
      linkElem.setAttribute("rel", "stylesheet");
      linkElem.setAttribute("href", "/src/assets/style/profile-page.css");
      this.shadow.appendChild(linkElem);
      
      // Check if user is logged in
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.log("No authentication token found, redirecting to login");
        if (window.app && app.state) {
          app.state.currentPage = "/login";
        } else {
          window.location.href = "/login";
        }
        return;
      }
      
      // Check for user ID in URL parameters if not already set from attribute
      if (!this.userId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUsername = urlParams.get("username");
        const urlId = urlParams.get("id");
        
        if (urlUsername) {
          this.userId = urlUsername;
          this.isNumericId = false;
          console.log("Using username from URL:", this.userId);
        } else if (urlId) {
          this.userId = urlId;
          this.isNumericId = true;
          console.log("Using ID from URL:", this.userId);
        }
      }
      
      // Load user profile data
      await this.loadUserProfile();
      
      // Check friendship status if not viewing own profile
      if (!this.isCurrentUser && this.profileUserId) {
        await this.checkFriendshipStatus();
      }
      
      // Set up event listeners for buttons and tabs
      this.setupEventListeners();
      
      // Initialize with stats tab selected
      this.switchTab("stats");
    } catch (error) {
      console.error("Error in connectedCallback:", error);
      this.showNotification("An error occurred while loading the profile", false);
    }
  }
  
  async fetchDashboardData() {
    try {
      let url = "https://localhost/api/dashboard/";
      if (this.profileUserId && !this.isCurrentUser) {
        url = `https://localhost/api/dashboard/${this.profileUserId}/`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("Dashboard data not found");
          return { 
            total_games: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            win_rate: 0,
            game_history: [] 
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dashboard data received:", data);
      return { ...data, game_history: data.game_history || [] };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return { 
        total_games: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        win_rate: 0,
        game_history: [] 
      };
    }
  }

  getUrlUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("username") || urlParams.get("id");
  }

  async loadUserProfile() {
    console.log("Fetching profile for userId:", this.userId);
    try {
      let userData;
      
      if (!this.userId) {
        // No userId specified, fetch current user profile
        userData = await this.#api.fetchUserProfile(null); // Uses /api/users/me/
        console.log("Fetched current user profile:", userData);
        
        // Ensure profileUserId is set for current user
        if (userData && userData.id) {
          this.profileUserId = userData.id;
          console.log("✅ Set profileUserId for current user:", this.profileUserId);
        }
      } else if (this.isNumericId) {
        // It's a numeric ID, use the ID endpoint
        console.log("Fetching by numeric ID:", this.userId);
        userData = await this.#api.fetchUserProfile(this.userId);
        
        // Directly set profileUserId from numeric ID
        this.profileUserId = parseInt(this.userId);
        console.log("✅ Set profileUserId from numeric ID:", this.profileUserId);
      } else {
        // It's a username, use the username endpoint
        console.log("Fetching by username:", this.userId);
        userData = await this.#api.fetchUserByUsername(this.userId);
        
        // If profileUserId still not set, try to resolve it
        if (!this.profileUserId && userData && userData.username) {
          await this.#api.fetchUserIdFromUsername(userData.username);
        }
      }
      
      if (!userData) {
        console.error("User not found:", this.userId);
        this.showNotification(`User ${this.userId || "profile"} not found`, false);
        if (window.app && app.state) {
          app.state.currentPage = "/home";
        } else {
          window.location.href = "/home";
        }
        return;
      }
      
      // Final fallback - if we still don't have a profileUserId but have a username
      if (!this.profileUserId && userData && userData.username) {
        await this.#api.fetchUserIdFromUsername(userData.username);
      }
      
      console.log("Successfully fetched user data:", userData);
      
      // Store the profile user's ID for dashboard fetching later
      this.profileUserId = userData.id;
      
      // Check if we're looking at current user or another user
      const currentUser = await this.#api.fetchCurrentUser();
      if (currentUser) {
        this.currentUserId = currentUser.id;
        this.isCurrentUser = !this.userId || userData.id === this.currentUserId;
        console.log("Current user check - currentUserId:", this.currentUserId, 
                   "profileUserId:", userData.id,
                   "isCurrentUser:", this.isCurrentUser);
      }
      
      this.populateUserData(userData);
      
      // Update UI elements based on whether we're viewing own profile or another user's
      if (this.isCurrentUser) {
        const friendActions = this.shadow.getElementById("friendActions");
        if (friendActions) {
          friendActions.classList.add("hidden");
        } else {
          console.warn("Friend actions element not found");
        }
      } else {
        console.log("Viewing another user's profile - showing friend actions");
      }
      
      return userData; // Return the userData so we can use it in the caller
    } catch (error) {
      console.error("Load user profile error:", error);
      this.showNotification("Error loading profile data", false);
      if (window.app && app.state) {
        app.state.currentPage = "/home";
      } else {
        window.location.href = "/home";
      }
      return null;
    }
  }

  async checkFriendshipStatus() {
    if (this.isCurrentUser) return;
    try {
      // Use the profileUserId that was already set in loadUserProfile
      if (!this.profileUserId) {
        console.error("No profileUserId available for friendship check");
        return;
      }
      
      console.log("Checking friendship status with profileUserId:", this.profileUserId);
      const data = await this.#api.checkFriendshipStatus(this.profileUserId);
      console.log("Friendship status response:", data);
      this.friendshipStatus = data.status;
      if (data.request_id) {
        this.friendRequestId = data.request_id;
      }
      this.updateFriendButton();
    } catch (error) {
      console.error("Error checking friendship status:", error);
      this.friendshipStatus = "none";
      this.updateFriendButton();
    }
  }

  populateUserData(userData) {
    this.shadow.getElementById("displayUsername").textContent = userData.username || "Unknown";
    this.shadow.getElementById("displayFullName").textContent =
      `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Unknown";
    this.shadow.getElementById("displayPhone").textContent = userData.phone_number || "Not set";
    const profileImage = this.shadow.getElementById("profileImage");
    if (userData.profile_picture) {
      profileImage.src = userData.profile_picture;
    }
    this.shadow.getElementById("totalGames").textContent = userData.total_games || 0;
    this.shadow.getElementById("totalWins").textContent = userData.wins || 0;
    this.shadow.getElementById("winRate").textContent = userData.win_rate ? `${userData.win_rate}%` : "0%";
  }

  updateFriendButton() {
    const addFriendBtn = this.shadow.getElementById("addFriendBtn");
    const friendActionsEl = this.shadow.getElementById("friendActions");
    
    console.log("Updating friend button with status:", this.friendshipStatus, "requestId:", this.friendRequestId);
    
    // First, clear any existing extra buttons
    const existingExtraButtons = this.shadow.querySelectorAll(".extra-friend-action");
    existingExtraButtons.forEach(btn => btn.remove());
    
    // Add block user button unless we're viewing our own profile
    if (!this.isCurrentUser) {
      // Create and add a Block button
      const blockBtn = document.createElement("button");
      blockBtn.id = "blockUserBtn";
      blockBtn.className = "profile-btn extra-friend-action";
      blockBtn.innerHTML = '<ion-icon name="ban-outline"></ion-icon> Block';
      blockBtn.style.backgroundColor = "white";
      blockBtn.style.color = "#333";
      blockBtn.style.border = "1px solid #ddd";
      blockBtn.style.marginLeft = "10px";
      blockBtn.onclick = () => this.handleBlockUser();
      
      if (friendActionsEl) {
        friendActionsEl.appendChild(blockBtn);
      }
    }
    
    switch (this.friendshipStatus) {
      case "blocked":
        // User is blocked - show unblock button
        addFriendBtn.innerHTML = '<ion-icon name="ban-outline"></ion-icon> Blocked';
        addFriendBtn.style.backgroundColor = "#888";
        addFriendBtn.classList.add("friend-btn-with-hover");
        addFriendBtn.dataset.hoverText = "Unblock";
        addFriendBtn.dataset.hoverColor = "var(--primary-success)";
        addFriendBtn.dataset.normalText = "Blocked";
        addFriendBtn.dataset.normalColor = "#888";
        addFriendBtn.onclick = () => this.handleUnblockUser();
        break;
        
      case "accepted":
        // When users are friends, show a Friends button that changes to Remove on hover
        addFriendBtn.innerHTML = '<ion-icon name="people-outline"></ion-icon> Friends';
        addFriendBtn.style.backgroundColor = "var(--primary-success)";
        addFriendBtn.disabled = false;
        addFriendBtn.classList.add("friend-btn-with-hover");
        addFriendBtn.dataset.hoverText = "Remove Friend";
        addFriendBtn.dataset.hoverColor = "var(--primary-error)";
        addFriendBtn.dataset.normalText = '<ion-icon name="people-outline"></ion-icon> Friends';
        addFriendBtn.dataset.normalColor = "var(--primary-success)";
        addFriendBtn.onclick = () => this.handleRemoveFriend();
        break;
        
      case "pending":
        // Friend request sent - show Cancel with hover
        addFriendBtn.innerHTML = '<ion-icon name="time-outline"></ion-icon> Request Sent';
        addFriendBtn.style.backgroundColor = "var(--primary-warning)";
        addFriendBtn.disabled = false;
        addFriendBtn.classList.add("friend-btn-with-hover");
        addFriendBtn.dataset.hoverText = "Cancel Request";
        addFriendBtn.dataset.hoverColor = "var(--primary-error)";
        addFriendBtn.dataset.normalText = '<ion-icon name="time-outline"></ion-icon> Request Sent';
        addFriendBtn.dataset.normalColor = "var(--primary-warning)";
        addFriendBtn.onclick = () => this.handleCancelRequest();
        break;
        
      case "received":
        addFriendBtn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon> Accept Request';
        addFriendBtn.disabled = false;
        addFriendBtn.style.backgroundColor = "var(--primary-success)";
        if (this.friendRequestId) {
          addFriendBtn.dataset.requestId = this.friendRequestId;
        }
        addFriendBtn.onclick = () => this.handleAcceptRequest(this.friendRequestId);
        break;
        
      default:
        addFriendBtn.innerHTML = '<ion-icon name="person-add-outline"></ion-icon> Add Friend';
        addFriendBtn.disabled = false;
        addFriendBtn.style.backgroundColor = "var(--secondary-blue)";
        addFriendBtn.classList.remove("friend-btn-with-hover");
        addFriendBtn.onclick = () => this.handleFriendRequest();
    }
    
    // Add hover effects to the button if it has hover data
    if (addFriendBtn.classList.contains("friend-btn-with-hover")) {
      addFriendBtn.addEventListener("mouseenter", this.handleFriendButtonHover.bind(this));
      addFriendBtn.addEventListener("mouseleave", this.handleFriendButtonHoverEnd.bind(this));
    } else {
      addFriendBtn.removeEventListener("mouseenter", this.handleFriendButtonHover.bind(this));
      addFriendBtn.removeEventListener("mouseleave", this.handleFriendButtonHoverEnd.bind(this));
    }
  }
  
  handleFriendButtonHover(event) {
    const button = event.target;
    // Save the original state if needed
    button.innerHTML = button.dataset.hoverText;
    button.style.backgroundColor = button.dataset.hoverColor;
  }
  
  handleFriendButtonHoverEnd(event) {
    const button = event.target;
    button.innerHTML = button.dataset.normalText;
    button.style.backgroundColor = button.dataset.normalColor;
  }
  
  async handleCancelRequest() {
    console.log("Canceling friend request to user ID:", this.profileUserId);
    try {
      if (!this.profileUserId) {
        console.error("No profileUserId available for canceling request");
        this.showNotification("Cannot identify user for canceling request", false);
        return;
      }

      // Show loading state
      const addFriendBtn = this.shadow.getElementById("addFriendBtn");
      if (addFriendBtn) {
        addFriendBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Canceling...';
        addFriendBtn.disabled = true;
      }
      
      // Call the API to cancel the request
      await this.#api.cancelFriendRequest(this.profileUserId);
      
      // Update status and UI
      this.friendshipStatus = "none";
      this.updateFriendButton();
      this.showNotification("Friend request canceled", true);
    } catch (error) {
      console.error("Error canceling friend request:", error);
      this.showNotification("Failed to cancel friend request", false);
      this.updateFriendButton(); // Reset button state
    }
  }
  
  async handleBlockUser() {
    console.log("Blocking user ID:", this.profileUserId);
    try {
      if (!this.profileUserId) {
        console.error("No profileUserId available for blocking user");
        this.showNotification("Cannot identify user to block", false);
        return;
      }

      // Confirm the block action
      if (!confirm("Are you sure you want to block this user? They will not be able to see your profile or interact with you.")) {
        return;
      }
      
      // Show loading state
      const blockBtn = this.shadow.getElementById("blockUserBtn");
      if (blockBtn) {
        blockBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Blocking...';
        blockBtn.disabled = true;
      }
      
      // Call the API to block the user
      await this.#api.blockUser(this.profileUserId);
      
      // Update status and UI
      this.friendshipStatus = "blocked";
      this.updateFriendButton();
      this.showNotification("User blocked successfully", true);
    } catch (error) {
      console.error("Error blocking user:", error);
      this.showNotification("Failed to block user", false);
      this.updateFriendButton(); // Reset button state
    }
  }
  
  async handleUnblockUser() {
    console.log("Unblocking user ID:", this.profileUserId);
    try {
      if (!this.profileUserId) {
        console.error("No profileUserId available for unblocking user");
        this.showNotification("Cannot identify user to unblock", false);
        return;
      }

      // Show loading state
      const addFriendBtn = this.shadow.getElementById("addFriendBtn");
      if (addFriendBtn) {
        addFriendBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Unblocking...';
        addFriendBtn.disabled = true;
      }
      
      // Call the API to unblock the user
      await this.#api.unblockUser(this.profileUserId);
      
      // Update status and UI
      this.friendshipStatus = "none";
      this.updateFriendButton();
      this.showNotification("User unblocked successfully", true);
    } catch (error) {
      console.error("Error unblocking user:", error);
      this.showNotification("Failed to unblock user", false);
      this.updateFriendButton(); // Reset button state
    }
  }

  setupEventListeners() {
    const addFriendBtn = this.shadow.getElementById("addFriendBtn");
    const sendMessageBtn = this.shadow.getElementById("sendMessageBtn");

    if (addFriendBtn && !this.isCurrentUser) {
      addFriendBtn.addEventListener("click", () => {
        if (this.friendshipStatus === "received") {
          this.handleAcceptRequest(addFriendBtn.dataset.requestId);
        } else {
          this.handleFriendRequest();
        }
      });
    }

    if (sendMessageBtn && !this.isCurrentUser) {
      sendMessageBtn.addEventListener("click", () => {
        if (window.app && app.state) {
          app.state.currentPage = `/chat?recipient_id=${this.userId}`;
        } else {
          window.location.href = `/chat?recipient_id=${this.userId}`;
        }
      });
    }

    const tabButtons = this.shadow.querySelectorAll(".tab-button");
    tabButtons.forEach(button => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab");
        this.switchTab(tabId);
      });
    });

    const dashboardTabButtons = this.shadow.querySelectorAll(".dashboard-tab-button");
    dashboardTabButtons.forEach(button => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-dashboard-tab");
        this.switchDashboardTab(tabId);
      });
    });

    const friendSearch = this.shadow.getElementById("friendSearch");
    if (friendSearch) {
      friendSearch.addEventListener("input", this.handleFriendSearch.bind(this));
    }
  }

  switchTab(tabId) {
    const tabButtons = this.shadow.querySelectorAll(".tab-button");
    const tabContents = this.shadow.querySelectorAll(".tab-content");
    tabButtons.forEach(button => button.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    const selectedButton = this.shadow.querySelector(`[data-tab="${tabId}"]`);
    const selectedContent = this.shadow.getElementById(`${tabId}-content`);
    if (selectedButton && selectedContent) {
      selectedButton.classList.add("active");
      selectedContent.classList.add("active");
      
      // Load game history data when switching to history tab
      if (tabId === "history") {
        this.loadGameHistory();
      }
    }
  }
  
  async loadGameHistory() {
    try {
      const dashboardData = await this.fetchDashboardData();
      if (dashboardData && dashboardData.game_history) {
        this.renderGameHistory(dashboardData.game_history);
      }
    } catch (error) {
      console.error("Error loading game history:", error);
      this.showNotification("Failed to load game history", false);
    }
  }

  switchDashboardTab(tabId) {
    const tabButtons = this.shadow.querySelectorAll(".dashboard-tab-button");
    const tabContents = this.shadow.querySelectorAll(".dashboard-tab-content");
    tabButtons.forEach(button => button.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    const selectedButton = this.shadow.querySelector(`[data-dashboard-tab="${tabId}"]`);
    const selectedContent = this.shadow.getElementById(`${tabId}-dashboard`);
    if (selectedButton && selectedContent) {
      selectedButton.classList.add("active");
      selectedContent.classList.add("active");
      if (tabId === "friends") {
        this.loadFriendsList();
      }
    }
  }

  removeEventListeners() {
    const addFriendBtn = this.shadow.getElementById("addFriendBtn");
    const sendMessageBtn = this.shadow.getElementById("sendMessageBtn");
    if (addFriendBtn) addFriendBtn.removeEventListener("click", this.handleFriendRequest);
    if (sendMessageBtn) sendMessageBtn.removeEventListener("click", () => navigateTo(`/chat?recipient_id=${this.userId}`));
  }

  async handleFriendRequest() {
    if (this.friendshipStatus === "accepted" || this.friendshipStatus === "pending") return;
    
    // Don't friend yourself
    if (this.isCurrentUser) {
      this.showNotification("You cannot send a friend request to yourself", false);
      return;
    }

    // If there's a received request, accept it
    if (this.friendshipStatus === "received" && this.friendRequestId) {
      await this.handleAcceptRequest(this.friendRequestId);
      return;
    }
    
    // Show loading state
    const addFriendBtn = this.shadow.getElementById("addFriendBtn");
    if (addFriendBtn) {
      const originalText = addFriendBtn.innerHTML;
      addFriendBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Sending...';
      addFriendBtn.disabled = true;
    }

    // Otherwise, send a new friend request
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        this.showNotification("You must be logged in to send friend requests", false);
        return;
      }

      // Use the stored profileUserId instead of making another API call
      if (!this.profileUserId) {
        console.error("No profileUserId available for friend request");
        this.showNotification("Cannot identify user for friend request", false);
        return;
      }
      
      console.log("Sending friend request to user ID:", this.profileUserId);
      await this.#api.sendFriendRequest(this.profileUserId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.friendshipStatus = "pending";
      this.updateFriendButton();
      this.showNotification("Friend request sent successfully", true);
    } catch (error) {
      console.error("Friend request error:", error);
      
      // Handle auth errors
      if (error.message.includes("401")) {
        try {
          await this.refreshToken();
          
          // Try again after token refresh
          if (this.profileUserId) {
            const result = await this.#api.sendFriendRequest(this.profileUserId);
            this.friendshipStatus = "pending";
            this.updateFriendButton();
            this.showNotification("Friend request sent successfully", true);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          this.showNotification("Please log in to send friend requests", false);
          if (window.app && app.state) {
            app.state.currentPage = "/login";
          } else {
            window.location.href = "/login";
          }
        }
      } else {
        this.showNotification("Failed to send friend request", false);
      }
    }
  }

  async handleAcceptRequest(requestId) {
    try {
      const result = await this.#api.acceptFriendRequest(requestId);
      this.friendshipStatus = "accepted";
      this.updateFriendButton();
      this.showNotification("Friend request accepted", true);
    } catch (error) {
      this.showNotification("Failed to accept friend request", false);
    }
  }
  
  async handleRemoveFriend() {
    console.log("Removing friend, user ID:", this.profileUserId);
    try {
      if (!this.profileUserId) {
        console.error("No profileUserId available for friend removal");
        this.showNotification("Cannot identify user for friend removal", false);
        return;
      }

      // Show loading state
      const removeBtn = this.shadow.getElementById("removeFriendBtn");
      if (removeBtn) {
        removeBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Removing...';
        removeBtn.disabled = true;
      }
      
      try {
        // Call the API to remove the friend
        await this.#api.removeFriend(this.profileUserId);
        
        // Update status and UI
        this.friendshipStatus = "none";
        this.updateFriendButton();
        this.showNotification("Friend removed successfully", true);
        
        // Refresh the friends list if visible
        if (this.activeTab === "friends") {
          this.loadFriendsList();
        }
      } catch (error) {
        console.error("Error removing friend:", error);
        this.showNotification("Failed to remove friend", false);
        this.updateFriendButton(); // Reset button state
      }
    } catch (error) {
      console.error("Handle remove friend error:", error);
      this.showNotification("An error occurred", false);
      this.updateFriendButton(); // Reset button state
    }
  }

  showNotification(message, isSuccess) {
    const notification = this.shadow.getElementById("notification");
    const notificationMessage = this.shadow.querySelector(".notification-message");
    const successIcon = this.shadow.querySelector(".notification-icon.success");
    const errorIcon = this.shadow.querySelector(".notification-icon.error");

    notificationMessage.textContent = message;
    notification.className = `notification show ${isSuccess ? "success" : "error"}`;
    successIcon.hidden = !isSuccess;
    errorIcon.hidden = isSuccess;
    setTimeout(() => (notification.className = "notification"), 3000);
  }

  async loadFriendsList() {
    try {
      // If we're viewing someone else's profile, get their friends
      // Otherwise get the current user's friends
      const friendsList = this.isCurrentUser ? 
        await this.#api.getFriendsList() : 
        await this.#api.getFriendsList(this.profileUserId);
      
      const friendsContainer = this.shadow.getElementById("friendsList");
      if (friendsContainer) {
        friendsContainer.innerHTML = "";
        if (friendsList.length === 0) {
          friendsContainer.innerHTML = '<p class="no-friends">No friends found</p>';
          return;
        }
        friendsList.forEach(friend => {
          const friendCard = document.createElement("div");
          friendCard.className = "friend-card";
          friendCard.dataset.userId = friend.id;
          friendCard.addEventListener("click", () => {
            window.location.href = `/users/${friend.username}`;
          });
          friendCard.innerHTML = `
            <img src="${friend.profile_picture || '/media/profile_pics/default.png'}" 
                 alt="${friend.username}" 
                 class="friend-avatar">
            <div class="friend-info">
              <div class="friend-name">${friend.username}</div>
              <div class="friend-status">Offline</div> <!-- No online status in backend -->
            </div>
          `;
          friendsContainer.appendChild(friendCard);
        });
      }
    } catch (error) {
      console.error("Error loading friends list:", error);
      this.showNotification("Failed to load friends list", false);
    }
  }

  handleFriendSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const friendCards = this.shadow.querySelectorAll(".friend-card");
    friendCards.forEach(card => {
      const friendName = card.querySelector(".friend-name").textContent.toLowerCase();
      card.style.display = friendName.includes(searchTerm) ? "flex" : "none";
    });
  }

  renderGameHistory(gameHistory) {
    const historyContainer = this.shadow.querySelector(".history-contentTab");
    historyContainer.innerHTML = "<h2>Game History</h2>";
    if (gameHistory.length === 0) {
      historyContainer.innerHTML += "<p>No game history available</p>";
      return;
    }
    gameHistory.forEach(game => {
      const gameCard = document.createElement("div");
      gameCard.className = "game-history-card";
      const players = game.players.map(p => p.username).join(" vs ");
      const winner = game.winner ? game.winner.username : "Draw";
      gameCard.innerHTML = `
        <p>${players}</p>
        <p>Winner: ${winner}</p>
        <p>Start: ${new Date(game.start_time).toLocaleString()}</p>
      `;
      historyContainer.appendChild(gameCard);
    });
  }
}

customElements.define("profile-page", PublicProfile);
export default PublicProfile;