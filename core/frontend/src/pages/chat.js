let template = document.createElement("template");

template.innerHTML = /*html*/ `
<div id="chat-page" class="chat-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="chat-page__container__header">
      <div class="chat-header-title">
        <h1>👾 Chat</h1>
      </div>
    </div>
    <div class="chat-page__container__body">
      <section class="chat-page__container__body__chat_friend_list">
          <div class="chat_friend_list_header">
              <div class="home_btn">
                 <router-link to="/home" class="router-link">
                    <span slot="title"><ion-icon class="home_icon" name="home"></ion-icon></span>
                 </router-link>
              </div>
              <div class="profile-avatar-container">
                <span class="profile-name">Find or start a conversation</span>
              </div>
              <div class="search_firend_container">
                  <div class="wrapper">
                    <ion-icon name="search" class="search_icon"></ion-icon>
                    <input type="text" class="search_firend" placeholder="Search for a friend">
                  </div>
              </div>
          </div>
          <div class="chat_friend_list_body">
             <ul class="chat_friend_list_item"></ul> 
          </div>
      </section>

      <section class="chat-page__container__body__chat">
        <div class="chat-page__container__body__chat__header">
            <div class="chat-header-avatar">
              <img src="/media/profile_pics/default.png" alt="avatar" class="chatAvatarImage">
              <div class="chat-header-info">
                <div class="chat-header-name">Select a conversation</div>
                <div class="chat-header-status">Offline</div>
              </div>
            </div>
            <div class="extra_info_button">
              <ion-icon name="information-circle-outline" size="large"></ion-icon>
            </div>
        </div>
        <div class="chat-page__container__body__chat__messages">
            <div class="chat-container">
                <div class="chat-messages">
                </div>
                <div class="chat-input">
                    <div class="init-game-button">Play</div>    
                    <div class="emoji-button"></div>
                    <input type="text" class="messageInput" id="messageInput" placeholder="Type a message..." maxlength="200" autofocus >
                    <div class="react-buttons">
                      <button class="send-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                      <button class="like-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                          <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
            </div>
        </div>
      </section>
      <section class="chat-page__container__body__friend__personal__info">
        <div class="personal-info-placeholder">Select a user to view info</div>
      </section>
    </div>
  </div>
  <cloud-moving cloudCount="10"></cloud-moving> 
</div>
<style>
.chat-friend-list-body__friend {
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
}
.chat-friend-list-body__friend.selected {
  background-color: var(--secondary-blue-off);
}
.chat-friend-list-body__friend:hover {
  background-color: var(--alive-blue);
}
</style>`;

class CHAT extends HTMLElement {
  #messageInfo = {
    message: "",
    time: "",
    type: "",
    emoji: false,
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "/src/assets/style/chat-page.css");
    this.shadow.appendChild(linkElem);

    this.currentUser = null;
    this.selectedRecipientId = null;
    this.numericRecipientId = null;
    this.manualDisconnect = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.usingApiFallback = false;
    this.forceApiMode = false;
    this.consecutiveTimeouts = 0;
    
    // Initialize notification sound
    this.initNotificationSound();
  }

  // Initialize notification sound with fallbacks
  initNotificationSound() {
    try {
      this.notificationSound = new Audio("/media/sounds/notification.mp3");
      
      // Fallback options if primary sound file is not found
      this.notificationSound.onerror = () => {
        console.warn("Primary notification sound not found, trying fallback");
        this.notificationSound = new Audio("/static/sounds/notification.mp3");
        
        this.notificationSound.onerror = () => {
          console.warn("Fallback notification sound not found, chat will work without sound");
          // Create a silent audio object as fallback
          this.notificationSound = { play: () => Promise.resolve() };
        };
      };
    } catch (e) {
      console.warn("Could not load notification sound, chat will work without sound");
      // Create a silent audio object as fallback
      this.notificationSound = { play: () => Promise.resolve() };
    }
  }

  async connectedCallback() {
    console.log("CHAT is Connected");

    this.chatAvatarImage = this.shadow.querySelector(".chatAvatarImage");
    this.chatHeaderName = this.shadow.querySelector(".chat-header-name");
    this.chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
    this.chatMessages = this.shadow.querySelector(".chat-messages");
    this.chatFriendListParent = this.shadow.querySelector(".chat_friend_list_item");
    this.infoButton = this.shadow.querySelector(".extra_info_button");
    this.personalInfoSection = this.shadow.querySelector(".chat-page__container__body__friend__personal__info");

    const token = localStorage.getItem("access_token");
    if (!token) {
      window.history.replaceState(null, null, "/login");
      window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: "/login" } }));
      return;
    }

    // Show loading state for initial connection
    this.chatMessages.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <div class="loading-text">Connecting to chat server...</div>
      </div>
    `;

    try {
      this.currentUser = await this.fetchCurrentUser();
    } catch (error) {
      console.error("Error fetching current user:", error);
      this.showNotification("Failed to load user data", false);
      window.history.replaceState(null, null, "/login");
      window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: "/login" } }));
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    this.selectedRecipientId = urlParams.get("recipient_id");

    // Show loading for friend list
    this.chatFriendListParent.innerHTML = `
      <li class="loading-friend-list">
        <div class="spinner small"></div>
        <div>Loading conversations...</div>
      </li>
    `;

    await this.conversationList();
    if (this.selectedRecipientId) {
      await this.selectRecipientById(this.selectedRecipientId);
    } else if (this.chatFriendListParent.children.length > 0) {
      this.selectFriend(this.chatFriendListParent.children[0]);
    } else {
      // Try to restore last active chat from localStorage
      const lastActiveChat = localStorage.getItem('last_active_chat');
      if (lastActiveChat) {
        console.log(`Restoring last active chat: ${lastActiveChat}`);
        try {
          const chatData = JSON.parse(lastActiveChat);
          if (chatData.recipientId) {
            await this.selectRecipientById(chatData.recipientId);
          }
        } catch (e) {
          console.error("Error restoring last active chat:", e);
        }
      }
    }
    
    this.conversationList();
    this.observeActionButtons();
    this.setupSearch();
    this.getExtraInfo();
    this.setupMessageInput();
    
    // Set up page visibility change handler to reconnect when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.activeRecipientId && this.activeRecipientUsername) {
        console.log('Tab became visible, checking connection status');
        // Check if WebSocket is disconnected and reconnect if needed
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
          console.log('WebSocket not connected, attempting to reconnect');
          this.reconnectAttempts = 0; // Reset reconnect counter
          this.initWebSocket(this.activeRecipientId, this.activeRecipientUsername);
        }
      }
    });

    // Play game button setup
    const playButton = this.shadow.querySelector(".init-game-button");
    if (playButton) {
      playButton.addEventListener("click", async () => {
        if (this.selectedRecipientId) {
          try {
            const recipient = await this.fetchUserInfo(this.selectedRecipientId);
            app.state.currentPage = `/game?opponent=${recipient.username}`;
          } catch (error) {
            console.error("Error fetching recipient info:", error);
            this.showNotification("Failed to load user info", false);
          }
        } else {
          this.showNotification("No user selected", false);
        }
      });
    }
  }

  async disconnectedCallback() {
    console.log("CHAT is Disconnected");
    this.manualDisconnect = true;
    if (this.websocket) {
      this.websocket.close();
    }
  }

  async fetchCurrentUser() {
    try {
      const response = await fetch("https://localhost/api/users/me/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try refreshing
          const newToken = await this.refreshToken();
          if (!newToken) throw new Error("Could not refresh token");
          
          // Retry with new token
          const retryResponse = await fetch("https://localhost/api/users/me/", {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (!retryResponse.ok) throw new Error(`HTTP error! status: ${retryResponse.status}`);
          return await retryResponse.json();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  }

  async fetchUserInfo(userId) {
    try {
      // Determine if userId is a number (ID) or string (username)
      const isNumericId = !isNaN(parseInt(userId)) && userId.toString() === parseInt(userId).toString();
      
      // Choose the correct endpoint based on whether we have a numeric ID or username
      const endpoint = isNumericId 
        ? `https://localhost/api/users/by-id/${userId}/` 
        : `https://localhost/api/users/by-username/${userId}/`;
      
      console.log(`Fetching user info from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try refreshing
          const newToken = await this.refreshToken();
          if (!newToken) throw new Error("Could not refresh token");
          
          // Retry with new token
          const retryResponse = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (!retryResponse.ok) throw new Error(`Failed to fetch user: ${retryResponse.status}`);
          return await retryResponse.json();
        }
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  }

  async fetchMessages(recipientId) {
    try {
      // Ensure recipientId is properly formatted (should be a numeric ID)
      const endpoint = `https://localhost/api/messages/?recipient_id=${recipientId}`;
      console.log(`Fetching messages from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try refreshing
          const newToken = await this.refreshToken();
          if (!newToken) throw new Error("Could not refresh token");
          
          // Retry with new token
          const retryResponse = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (!retryResponse.ok) throw new Error(`Failed to fetch messages: ${retryResponse.status}`);
          return await retryResponse.json();
        }
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Return empty array to avoid breaking the UI
      return [];
    }
  }

  async sendMessageApi(recipientId, content, isEmoji = false) {
    try {
      // CRITICAL FIX: Check for recipientId validity and try to use stored value if needed
      if (!recipientId && this.numericRecipientId) {
        recipientId = this.numericRecipientId;
        console.log(`Using stored numeric ID: ${recipientId}`);
      } else if (!recipientId && this.selectedRecipientId) {
        // Try to get the numeric ID from selectedRecipientId if it's a number
        const numericId = parseInt(this.selectedRecipientId);
        if (!isNaN(numericId)) {
          recipientId = numericId;
          this.numericRecipientId = numericId; // Store for future use
          console.log(`Converted selected ID to numeric: ${recipientId}`);
        }
      }
      
      if (!recipientId) {
        console.warn("No valid recipient ID available for API message");
        throw new Error("Missing recipient ID");
      }

      const response = await fetch("https://localhost/api/messages/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          content: content,
          is_emoji: isEmoji
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`API message send failed with status ${response.status}:`, errorData);
        throw new Error(`Message send failed: ${response.status}`);
      }

      const messageResponse = await response.json();
      
      // Add to local history to ensure persistence
      if (!this.messageHistory) this.messageHistory = [];
      this.messageHistory.push(messageResponse);
      
      // Save to local storage for persistence
      const storageKey = `chat_history_${recipientId}`;
      const existingHistory = localStorage.getItem(storageKey);
      let updatedHistory = [];
      
      if (existingHistory) {
        try {
          updatedHistory = JSON.parse(existingHistory);
        } catch (e) {
          console.error("Error parsing existing history:", e);
          updatedHistory = [];
        }
      }
      
      updatedHistory.push(messageResponse);
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      
      return messageResponse;
    } catch (error) {
      console.error("Error sending message via API:", error);
      throw error;
    }
  }

  async refreshToken() {
    try {
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
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Log user out if token refresh fails
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.history.replaceState(null, null, "/login");
      window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: "/login" } }));
      this.showNotification("Your session has expired. Please log in again.", false);
      return null;
    }
  }

  async getFriendInfo(friendIdOrUsername) {
    try {
      this.isLoadingFriendInfo = true;
      console.log(`Getting friend info for: ${friendIdOrUsername}`);
      
      // Determine if we have a numeric ID or a username
      const isNumeric = !isNaN(parseInt(friendIdOrUsername));
      
      // Choose the appropriate endpoint based on the ID type
      const endpoint = isNumeric ? 'by-id' : 'by-username';
      const friendInfoUrl = `https://localhost/api/users/${endpoint}/${friendIdOrUsername}/`;
      console.log(`Fetching user info from: ${friendInfoUrl}`);

      const response = await fetch(friendInfoUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get friend info: ${response.status}`);
      }
      
      const friendInfo = await response.json();
      
      // CRITICAL FIX: Store the numeric ID right after we get the info
      if (friendInfo && friendInfo.id) {
        this.numericRecipientId = friendInfo.id;
        console.log(`Successfully stored numeric ID: ${this.numericRecipientId}`);
      } else {
        console.error("Friend info received but no valid ID found:", friendInfo);
      }
      
      this.isLoadingFriendInfo = false;
      return friendInfo;
    } catch (error) {
      this.isLoadingFriendInfo = false;
      console.error("Error fetching friend info:", error);
      throw error;
    }
  }

  async conversationList() {
    try {
      // Show loading indicator if not already showing
      if (!this.chatFriendListParent.querySelector('.loading-friend-list')) {
        this.chatFriendListParent.innerHTML = `
          <li class="loading-friend-list">
            <div class="spinner small"></div>
            <div>Loading conversations...</div>
          </li>
        `;
      }
      
      const response = await fetch("https://localhost/api/friends/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try refreshing
          const newToken = await this.refreshToken();
          if (!newToken) throw new Error("Could not refresh token");
          
          // Retry with new token
          const retryResponse = await fetch("https://localhost/api/friends/", {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (!retryResponse.ok) throw new Error(`HTTP error! status: ${retryResponse.status}`);
          const friends = await retryResponse.json();
          this.processFriendsList(friends);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const friends = await response.json();
      this.processFriendsList(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      this.showNotification("Failed to load friends list. Please try again.", false);
      
      // Show error state
      this.chatFriendListParent.innerHTML = `
        <li class="friend-list-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Could not load conversations</p>
          <button class="retry-button">Retry</button>
        </li>
      `;
      
      // Add event listener for retry button
      const retryButton = this.chatFriendListParent.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => this.conversationList());
      }
    }
  }
  
  processFriendsList(friends) {
    this.chatFriendListParent.innerHTML = "";
    
    if (!friends || friends.length === 0) {
      this.chatFriendListParent.innerHTML = `
        <li class="empty-friend-list">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>No friends yet. Add friends to start chatting!</p>
        </li>
      `;
      return;
    }
    
    // Add friends with staggered animation for better UX
    friends.forEach((friend, index) => {
      setTimeout(() => {
        this.addFriendToConversation(friend);
        
        // Add click event after friend is added to DOM
        const friendElement = this.chatFriendListParent.querySelector(`.chat_friend_list_body__friend[data-id="${friend.friend.id}"]`);
        if (friendElement) {
          friendElement.addEventListener("click", () => this.selectFriend(friendElement, true));
        }
      }, index * 50); // Staggered delay for visual appeal
    });
  }

  addFriendToConversation(friend) {
    const child = document.createElement("li");
    child.classList.add("chat_friend_list_body__friend");
    
    // Store both ID and username as data attributes for easier selection
    child.dataset.id = friend.friend.id;
    child.dataset.username = friend.friend.username;
    
    const status = friend.friend.status ? "online" : "offline";
    const firstName = friend.friend.first_name || "";
    const lastName = friend.friend.last_name || "";
    const username = friend.friend.username || "";
    const lastMessage = "Start a conversation";
    const avatar = friend.friend.profile_picture || "/media/profile_pics/default.png";
    child.innerHTML = `
      <div class="firend-info">
        <div class="friend-avatar">
          <img src="${avatar}" alt="avatar" class="friendAvatarImage" style="--isOnline: ${status === 'online'}">
          <div class="friend-status" data-${status}></div>
        </div>
      </div>
      <div class="firend-info-message">
        <div class="friend-name">${firstName} ${lastName}</div>
        <div class="friend-username">@${username}</div>
        <div class="friend-last-message">${lastMessage}</div>
      </div>
    `;
    this.chatFriendListParent.appendChild(child);
  }

  setupSearch() {
    const searchInput = this.shadow.querySelector(".search_firend");
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      this.chatFriendListParent.querySelectorAll(".chat_friend_list_body__friend").forEach((friend) => {
        const friendName = friend.querySelector(".friend-name").textContent.toLowerCase();
        friend.style.display = friendName.includes(searchTerm) ? "block" : "none";
      });
    });
  }

  getExtraInfo() {
    this.infoButton.addEventListener("click", async () => {
      if (this.selectedRecipientId) {
        try {
          const recipientInfo = await this.fetchUserInfo(this.selectedRecipientId);
          const username = recipientInfo.username;
          window.history.pushState({}, "", `/users/${username}`);
          window.dispatchEvent(
            new CustomEvent("stateChanged", { detail: { value: `/users/${username}` } })
          );
        } catch (error) {
          console.error("Error fetching recipient info:", error);
          this.showNotification("Failed to load user info", false);
        }
      } else {
        this.showNotification("No user selected", false);
      }
    });
  }

  async loadMessages(recipientId) {
    if (!recipientId) {
      console.warn("Cannot load messages: No recipient ID provided");
      return;
    }
    
    try {
      console.log(`Loading message history for recipient ID: ${recipientId}`);
      
      // Clear messages area and show loading state
      this.chatMessages.innerHTML = `
        <div class="loading-indicator">
          <div class="spinner"></div>
          <div class="loading-text">Loading message history...</div>
        </div>
      `;
      
      // Fetch message history from API
      const response = await fetch(`https://localhost/api/messages/?recipient_id=${recipientId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }
      
      const messages = await response.json();
      console.log(`Retrieved ${messages.length} messages from history`);
      
      // Store messages locally for persistence
      this.messageHistory = messages;
      localStorage.setItem(`chat_history_${recipientId}`, JSON.stringify(messages));
      
      // Clear loading state
      this.chatMessages.innerHTML = "";
      
      if (messages.length === 0) {
        // Show empty conversation message
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-conversation";
        emptyDiv.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No messages yet. Start a conversation!</p>
        `;
        this.chatMessages.appendChild(emptyDiv);
        return;
      }
      
      // Sort messages chronologically
      messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Display messages with a staggered animation effect
      messages.forEach((msg, index) => {
        setTimeout(() => {
          const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isSent = msg.sender.id === this.currentUser.id;
          this.addMessage({
            message: msg.content,
            time: time,
            type: isSent ? "sent" : "received",
            emoji: msg.is_emoji,
          }, false); // Don't play sound for loaded messages
          
          // Scroll down only after the last message is added
          if (index === messages.length - 1) {
            this.scrollDown();
          }
        }, index * 30); // Small staggered delay between messages
      });
    } catch (error) {
      console.error("Error loading message history:", error);
      
      // Try to load from local storage as fallback
      const localHistory = localStorage.getItem(`chat_history_${recipientId}`);
      if (localHistory) {
        console.log("Loading message history from local storage");
        const messages = JSON.parse(localHistory);
        // Display the messages from local storage
        // Code similar to above...
      } else {
        // Show error message
        this.chatMessages.innerHTML = `
          <div class="chat-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>Could not load message history</p>
            <button class="retry-button">Retry</button>
          </div>
        `;
        
        // Add retry button handler
        const retryButton = this.chatMessages.querySelector('.retry-button');
        if (retryButton) {
          retryButton.addEventListener('click', () => this.loadMessages(recipientId));
        }
      }
    }
  }
  
  updateChatInterface(friendInfo) {
    // Update header info with smooth transitions
    const chatHeaderName = this.shadow.querySelector(".chat-header-name");
    const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
    const chatAvatarImage = this.shadow.querySelector(".chatAvatarImage");
    
    // Set online status attribute for CSS container queries
    chatAvatarImage.style.setProperty('--isOnline', friendInfo.status ? 'true' : 'false');
    
    // Apply content with smooth animation
    chatHeaderName.textContent = `${friendInfo.first_name} ${friendInfo.last_name}`.trim() || friendInfo.username;
    chatHeaderStatus.textContent = friendInfo.status ? "Online" : "Offline";
    chatHeaderStatus.className = "chat-header-status" + (friendInfo.status ? " online" : "");
    
    // Smoothly change avatar image
    const newImage = new Image();
    newImage.onload = () => {
      chatAvatarImage.style.opacity = '0';
      setTimeout(() => {
        chatAvatarImage.src = friendInfo.profile_picture;
        chatAvatarImage.style.opacity = '1';
      }, 150);
    };
    newImage.src = friendInfo.profile_picture;
  }

  showNotification(message, isSuccess) {
    let notification = this.shadow.querySelector(".notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.className = "notification";
      notification.innerHTML = `
        <div class="notification-content">
          <ion-icon name="checkmark-circle-outline" class="notification-icon success"></ion-icon>
          <ion-icon name="alert-circle-outline" class="notification-icon error"></ion-icon>
          <span class="notification-message"></span>
        </div>
      `;
      this.shadow.appendChild(notification);
    }

    const notificationMessage = notification.querySelector(".notification-message");
    const successIcon = notification.querySelector(".notification-icon.success");
    const errorIcon = notification.querySelector(".notification-icon.error");

    notificationMessage.textContent = message;
    notification.className = `notification show ${isSuccess ? "success" : "error"}`;
    successIcon.hidden = !isSuccess;
    errorIcon.hidden = isSuccess;
    setTimeout(() => (notification.className = "notification"), 3000);
  }

  fallbackToApiMode(reason) {
    console.log(`Falling back to API mode: ${reason}`);
    this.usingApiFallback = true;
    
    // Update UI to show API fallback mode
    const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
    if (chatHeaderStatus) {
      chatHeaderStatus.textContent = `API mode (${reason})`;
      chatHeaderStatus.className = "chat-header-status warning";
    }
    
    this.showNotification(`Using API fallback: ${reason}`, false);
  }
  
  attemptReconnect(recipientId, recipientUsername) {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.manualDisconnect) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.selectedRecipientId === recipientId) {
          this.initWebSocket(recipientId, recipientUsername);
        }
      }, this.reconnectInterval * this.reconnectAttempts); // Exponential backoff
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.showNotification("Switched to API mode after failed connection attempts.", false);
      // Enable API fallback mode after max reconnection attempts
      this.usingApiFallback = true;
      
      // Update UI to show API mode
      const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
      if (chatHeaderStatus) {
        chatHeaderStatus.textContent = "API mode (fallback)";
        chatHeaderStatus.className = "chat-header-status warning";
      }
    }
  }

  updateLastMessageInFriendList(username, message) {
    // Find the friend element in the list by username or ID
    const friendElements = this.chatFriendListParent.querySelectorAll('.chat_friend_list_body__friend');
    for (const element of friendElements) {
      const nameElement = element.querySelector('.friend-name');
      if (nameElement && nameElement.textContent.toLowerCase().includes(username.toLowerCase())) {
        // Update the last message
        const lastMessageElement = element.querySelector('.friend-last-message');
        if (lastMessageElement) {
          const truncatedMessage = message.length > 25 ? message.substring(0, 22) + '...' : message;
          lastMessageElement.textContent = truncatedMessage;
          
          // Move this friend to the top of the list for better UX
          if (element.parentNode) {
            element.parentNode.prepend(element);
          }
        }
        break;
      }
    }
  }

  getRoomName(user1, user2) {
    // Clean usernames to remove any problematic characters
    const cleanUser1 = user1.replace(/[^a-zA-Z0-9]/g, '');
    const cleanUser2 = user2.replace(/[^a-zA-Z0-9]/g, '');
    
    // Sort alphabetically for consistency
    const names = [cleanUser1, cleanUser2].sort();
    return `${names[0]}_${names[1]}`;
  }
  
  initWebSocket(recipientId, recipientUsername) {
    // If we don't have both required pieces of data, don't attempt connection
    if (!recipientId || !recipientUsername) {
      console.error("Cannot initialize WebSocket: Missing recipient ID or username");
      this.fallbackToApiMode("Missing connection details");
      return;
    }
    
    // Clear any existing connection
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    // Update status to connecting
    const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
    if (chatHeaderStatus) {
      chatHeaderStatus.textContent = "Connecting...";
      chatHeaderStatus.className = "chat-header-status connecting";
    }
    
    // Don't try WebSocket if we're forcing API mode
    if (this.forceApiMode) {
      if (chatHeaderStatus) {
        chatHeaderStatus.textContent = "API mode (forced)";
        chatHeaderStatus.className = "chat-header-status warning";
      }
      this.usingApiFallback = true;
      this.showNotification("Using API mode for messaging", true);
      return;
    }
    
    // Store current recipient info for reconnection
    this.activeRecipientId = recipientId;
    this.activeRecipientUsername = recipientUsername;
    
    // Make sure we have a clean username for the room name
    const myUsername = this.currentUser.username;
    const cleanRecipientUsername = recipientUsername.trim();
    
    // Form the room name with the two usernames - order alphabetically to ensure consistent room naming
    const roomName = this.getRoomName(myUsername, cleanRecipientUsername);
    console.log(`Room name: ${roomName}`);
    
    try {
      // Get the current protocol (ws or wss) based on http/https
      const protocol = window.location.protocol === 'https:' ? 'ws:' : 'ws:';
      // When running locally or within Docker
      let host;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        host = window.location.host; // Include port if any
      } else {
        host = window.location.hostname; // Just the domain for production
      }
      
      // Encode the token for URL safety
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token available");
      }
      const encodedToken = encodeURIComponent(token);
      
      // Form the complete WebSocket URL with the token as a query parameter
      const wsUrl = `${protocol}//${host}/ws/chat/${roomName}/?token=${encodedToken}`;
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);
      
      // Create the WebSocket connection
      this.websocket = new WebSocket(wsUrl);
      this.connectionTimeout = setTimeout(() => {
        if (this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
          console.error("WebSocket connection timeout");
          this.websocket.close();
          this.fallbackToApiMode("Connection timeout");
        }
      }, 5000); // 5 second timeout
      
      // WebSocket event handlers
      this.websocket.onopen = (event) => {
        console.log("WebSocket connection established!");
        clearTimeout(this.connectionTimeout);
        this.reconnectAttempts = 0; // Reset reconnect counter on successful connection
        
        if (chatHeaderStatus) {
          chatHeaderStatus.textContent = "Connected";
          chatHeaderStatus.className = "chat-header-status online";
        }
        
        this.showNotification("WebSocket connection established", true);
        this.usingApiFallback = false;
        console.log("WebSocket ready state:", this.websocket.readyState);
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message received:", data);
          
          // Check message type
          if (data.type === 'chat_message') {
            // This is a real chat message from another user
            this.addMessage({
              message: data.message,
              time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "received",
              emoji: data.is_emoji || false
            }, true); // Play sound for new messages
          } else if (data.status === 'connected') {
            // Connection confirmation
            console.log("WebSocket connected to room:", data.room);
          } else if (data.error) {
            // Error message
            console.error("WebSocket error message:", data.error);
            this.showNotification(`WebSocket error: ${data.error}`, false);
          } else if (data.message) {
            // Default case - generic message
            this.addMessage({
              message: data.message,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "received",
              emoji: data.is_emoji || false
            }, true);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      
      this.websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.fallbackToApiMode("Connection error");
      };
      
      this.websocket.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
        clearTimeout(this.connectionTimeout);
        
        // Don't attempt reconnect if manual disconnect or if we're switching conversations
        if (!this.manualDisconnect && this.selectedRecipientId === recipientId) {
          this.attemptReconnect(recipientId, recipientUsername);
        }
      };
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
      this.showNotification("Using API fallback for messages.", false);
      
      // Update status to show fallback mode
      if (chatHeaderStatus) {
        chatHeaderStatus.textContent = "API mode (fallback)";
        chatHeaderStatus.className = "chat-header-status warning";
      }
      
      // Use API fallback mode
      this.usingApiFallback = true;
    }
  }

  sendWebSocketMessage(messageInfo) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      try {
        // Ensure we have valid recipient ID
        if (!this.numericRecipientId) {
          console.error("Cannot send WebSocket message: No valid recipient ID");
          return false;
        }
        
        // Format message data with all required fields for backend
        const messageData = {
          ...messageInfo,
          sender_id: this.currentUser.id,
          recipient_id: this.numericRecipientId,
          content: messageInfo.message,  // Include content field for backend
          is_emoji: messageInfo.emoji || false
        };
        
        console.log("Sending message via WebSocket:", messageData);
        this.websocket.send(JSON.stringify(messageData));
        return true;
      } catch (e) {
        console.error("Error sending via WebSocket:", e);
        return false;
      }
    } else {
      console.log("WebSocket not connected, can't send message");
      return false;
    }
  }

  getMessage() {
    const input = this.shadow.getElementById("messageInput");
    if (!input.value) return null;
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    const value = input.value.trim();
    if (!value) return null;
    return value.replace(/[&<>"'/]/g, (s) => entityMap[s]);
  }

  observeActionButtons() {
    // Message input
    const messageInput = this.shadow.querySelector("#messageInput");
    messageInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message && this.selectedRecipientId) {
          messageInput.value = "";
          messageInput.style.height = "40px";
          
          // Get the current time for displayed message
          const now = new Date();
          const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          // Format message info
          this.#messageInfo = {
            message: message,
            time: formattedTime,
            type: "sent",
            emoji: false,
          };
          try {
            if (this.usingApiFallback) {
              // When using API fallback, send via API first then display
              await this.sendMessageApi(this.numericRecipientId, message, false);
              this.addMessage(this.#messageInfo);
            } else {
              // When using WebSocket, try WebSocket first, fallback to API
              if (this.sendWebSocketMessage(this.#messageInfo)) {
                this.addMessage(this.#messageInfo);
              } else {
                await this.sendMessageApi(this.numericRecipientId, message, false);
                this.addMessage(this.#messageInfo);
              }
            }
          } catch (error) {
            console.error("Error sending message:", error);
            this.showNotification("Failed to send message", false);
          }
        }
      }
    });

    // Send button
    const sendButton = this.shadow.querySelector(".send-button");
    if (sendButton) {
      sendButton.addEventListener("click", async () => {
        const input = this.shadow.querySelector("#messageInput");
        const message = input.value.trim();
        
        if (!message) return;
        
        // Create message info
        this.#messageInfo = {
          message: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "sent",
          emoji: false,
        };
        
        input.value = "";
        input.focus();
        
        try {
          // Always use API mode since WebSockets are disabled
          console.log(`Sending message to recipient ID ${this.numericRecipientId} via API`)
          await this.sendMessageApi(this.numericRecipientId, message, false);
          this.addMessage(this.#messageInfo);
        } catch (error) {
          console.error("Error sending message:", error);
          this.showNotification(`Failed to send message: ${error.message}`, false);
        }
      });
    }

    // Thumbs up button
    const thumbsupButton = this.shadow.querySelector(".like-button");
    if (thumbsupButton) {
      thumbsupButton.addEventListener("click", async () => {
        // Get the current time for displayed message
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        this.#messageInfo = {
          message: "👍",
          time: formattedTime,
          type: "sent",
          emoji: true,
        };
        try {
          if (this.usingApiFallback) {
            // When using API fallback, send via API first then display
            await this.sendMessageApi(this.numericRecipientId, "👍", true);
            this.addMessage(this.#messageInfo);
          } else {
            // When using WebSocket, try WebSocket first, fallback to API
            if (this.sendWebSocketMessage(this.#messageInfo)) {
              this.addMessage(this.#messageInfo);
            } else {
              await this.sendMessageApi(this.numericRecipientId, "👍", true);
              this.addMessage(this.#messageInfo);
            }
          }
        } catch (error) {
          console.error("Error sending emoji:", error);
          this.showNotification("Failed to send emoji", false);
        }
      });
    }
  }

  setupMessageInput() {
    const input = this.shadow.querySelector("#messageInput");
    if (!input) return;
    
    // Handle Enter key press
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        
        const message = input.value.trim();
        if (!message) return;
        
        // Format message info
        this.#messageInfo = {
          message: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "sent",
          emoji: false,
        };
        
        input.value = "";
        
        try {
          // Always use API mode since WebSockets are disabled
          console.log(`Sending message via API to ${this.numericRecipientId}`);
          await this.sendMessageApi(this.numericRecipientId, message, false);
          this.addMessage(this.#messageInfo);
        } catch (error) {
          console.error("Error sending message:", error);
          this.showNotification(`Failed to send message: ${error.message}`, false);
        }
      }
    });
    
    // Auto-resize input as user types
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });
  }

  addMessage(messageInfo, playSound = true) {
    if (!messageInfo.message) return;
    
    const message = document.createElement("div");
    message.classList.add("message", messageInfo.type);
    
    // Set animation index for staggered appearance
    const currentMessageCount = this.chatMessages.querySelectorAll(".message").length;
    message.style.setProperty('--index', currentMessageCount);
    
    // For emoji messages
    if (messageInfo.emoji) {
      message.classList.add("emoji");
      message.innerHTML = `
        <div class="text"><div class="emoji">${messageInfo.message}</div></div>
        <div class="time">${messageInfo.time}</div>
      `;
    } else {
      // Format URLs as clickable links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const messageWithLinks = messageInfo.message.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
      
      message.innerHTML = `
        <div class="text">${messageWithLinks}</div>
        <div class="time">${messageInfo.time}</div>
      `;
    }
    
    this.chatMessages.appendChild(message);
    this.chatMessages.classList.add("selectedChat");
    
    if (!messageInfo.emoji) {
      this.clearInput();
    }
    
    this.scrollDown();
    
    // Play notification sound only for received messages and if sound playback is requested
    if (messageInfo.type === 'received' && playSound && this.notificationSound) {
      this.notificationSound.play().catch(e => console.warn('Could not play notification sound:', e));
    }
  }

  scrollDown() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  clearInput() {
    const input = this.shadow.getElementById("messageInput");
    input.value = "";
    input.focus();
  }

  async selectFriend(friendElement, clearInput = false) {
    if (clearInput) this.clearInput();
    this.chatFriendListParent.querySelectorAll(".chat_friend_list_body__friend").forEach((friend) => {
      friend.classList.remove("selected");
    });
    friendElement.classList.add("selected");

    const friendId = friendElement.dataset.id;
    this.selectedRecipientId = friendId;
    
    // CRITICAL FIX: Convert to numeric ID immediately
    if (friendId) {
      const numericId = parseInt(friendId);
      if (!isNaN(numericId)) {
        this.numericRecipientId = numericId;
        console.log(`Set numericRecipientId to ${numericId} in selectFriend`);
      } else {
        console.warn(`Could not convert friendId ${friendId} to a number`);
      }
    }

    try {
      // Show loading animation while fetching friend info
      this.chatMessages.innerHTML = `
        <div class="loading-indicator">
          <div class="spinner"></div>
          <div class="loading-text">Loading conversation...</div>
        </div>
      `;
      
      const friendInfo = await this.getFriendInfo(friendId);
      this.updateChatInterface(friendInfo);
      
      // Re-enable WebSocket connection attempt
      this.usingApiFallback = false; // Start with WebSocket mode
      try {
        // Try to initialize WebSocket with a timeout
        console.log("Attempting WebSocket connection...");
        this.initWebSocket(friendId, friendInfo.username);
        
        // Update status to show attempting connection
        const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
        if (chatHeaderStatus) {
          chatHeaderStatus.textContent += " (connecting...)";
        }
      } catch (wsError) {
        console.error("WebSocket initialization failed:", wsError);
        // Fall back to API mode
        this.usingApiFallback = true;
        const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
        if (chatHeaderStatus) {
          chatHeaderStatus.textContent += " (API fallback)";
        }
      }
      
    } catch (error) {
      console.error("Error selecting friend:", error);
      
      // Show error state in chat area
      this.chatMessages.innerHTML = `
        <div class="chat-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Could not load conversation</p>
          <button class="retry-button">Retry</button>
        </div>
      `;
      
      // Add event listener for retry button
      const retryButton = this.chatMessages.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => this.selectFriend(friendElement, clearInput));
      }
    }
  }

  async selectRecipientById(recipientIdOrUsername) {
    this.selectedRecipientId = recipientIdOrUsername;
    
    // Try to find friend in the list by either ID or username
    const isNumeric = !isNaN(parseInt(recipientIdOrUsername));
    
    // Remove active class from all friends
    this.chatFriendListParent
      .querySelectorAll(".chat_friend_list_body__friend")
      .forEach((friend) => friend.classList.remove("active"));
      
    // First try to find by ID
    let selectedFriend = this.chatFriendListParent.querySelector(
      `.chat_friend_list_body__friend[data-id="${recipientIdOrUsername}"]`
    );
    
    // If not found and it's not a numeric ID, try searching by username attribute
    if (!selectedFriend && !isNumeric) {
      // Try to find friend by username attribute if available
      const allFriends = this.chatFriendListParent.querySelectorAll('.chat_friend_list_body__friend');
      for (const friend of allFriends) {
        if (friend.getAttribute('data-username') === recipientIdOrUsername) {
          selectedFriend = friend;
          break;
        }
      }
    }
    
    if (selectedFriend) {
      selectedFriend.classList.add("active");
      // Update our selectedRecipientId if we found a numeric ID
      const numericId = selectedFriend.getAttribute('data-id');
      if (numericId && !isNaN(parseInt(numericId))) {
        this.numericRecipientId = parseInt(numericId);
        console.log(`Set numeric ID from selected friend: ${this.numericRecipientId}`);
      }
    }
    
    // Show chat loading state
    this.chatMessages.innerHTML = `
      <div class="chat-loading">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>
    `;
    
    try {
      // Get the recipient info
      const friendInfo = await this.getFriendInfo(recipientIdOrUsername);
      
      // Store the actual numeric ID for API calls
      if (friendInfo && friendInfo.id) {
        this.numericRecipientId = friendInfo.id;
        this.selectedRecipientUsername = friendInfo.username;
        console.log(`Stored numeric ID ${this.numericRecipientId} for recipient ${friendInfo.username}`);
      }
      
      this.updateChatInterface(friendInfo);
      
      // Get recipient username (for WebSocket)
      const recipientUsername = friendInfo.username;
      
      // Load message history
      await this.loadMessages(this.numericRecipientId);
      
      // Initialize WebSocket connection
      this.initWebSocket(this.numericRecipientId, recipientUsername);
      
      // Add connection mode toggle button
      this.addConnectionModeToggle();
    } catch (error) {
      console.error("Error selecting recipient:", error);
      
      // Show error state in chat area
      this.chatMessages.innerHTML = `
        <div class="chat-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Could not load conversation</p>
          <button class="retry-button">Retry</button>
        </div>
      `;
      
      // Add event listener for retry button
      const retryButton = this.chatMessages.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => this.selectRecipientById(recipientId));
      }
    }
  }

  addConnectionModeToggle() {
    // First remove any existing toggle
    const existingToggle = this.shadow.querySelector('.connection-mode-toggle');
    if (existingToggle) {
      existingToggle.remove();
    }
    
    // Create new toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'connection-mode-toggle';
    
    // Set the appropriate text based on current mode
    if (this.forceApiMode) {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Using API Mode (Click to try WebSocket)</span>
      `;
      toggleButton.classList.add('api-mode');
    } else {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="2"></circle>
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
        </svg>
        <span>Using WebSocket (Click to use API)</span>
      `;
      toggleButton.classList.add('websocket-mode');
    }
    
    // Add click handler to toggle mode
    toggleButton.addEventListener('click', () => {
      this.forceApiMode = !this.forceApiMode;
      
      if (this.forceApiMode) {
        // Switch to API mode
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
        this.usingApiFallback = true;
        
        // Update status display
        const chatHeaderStatus = this.shadow.querySelector(".chat-header-status");
        if (chatHeaderStatus) {
          chatHeaderStatus.textContent = "API mode (manual)";
          chatHeaderStatus.className = "chat-header-status warning";
        }
        
        this.showNotification("Switched to API mode for messaging", true);
      } else {
        // Try to reconnect WebSocket
        if (this.selectedRecipientId) {
          this.getFriendInfo(this.selectedRecipientId)
            .then(friendInfo => {
              this.initWebSocket(this.selectedRecipientId, friendInfo.username);
            })
            .catch(error => {
              console.error("Error getting friend info for WebSocket reconnection:", error);
              this.showNotification("Failed to reconnect WebSocket", false);
            });
        }
      }
      
      // Update the toggle button appearance
      this.addConnectionModeToggle();
    });
    
    // Add to the chat header
    const chatHeader = this.shadow.querySelector('.chat-header');
    if (chatHeader) {
      chatHeader.appendChild(toggleButton);
    }
  }
}

customElements.define("chat-page", CHAT);
export default CHAT;
