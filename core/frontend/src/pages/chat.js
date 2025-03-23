let template = document.createElement("template");

template.innerHTML = /*html*/
`
<div id="chat-page" class="chat-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="chat-page__container__header">
      <div class="chat-header-title">
        <h1>👾</h1>
      </div>
    </div>
    <!-- start the body of chat devided to three sections -->
    <div class="chat-page__container__body">
      <section class="chat-page__container__body__chat_friend_list">
          <div class="chat_friend_list_header">
              <div class="home_btn">
                 <router-link to="/home" class="router-link">
                    <span slot="title"><ion-icon class="home_icon" name="home"></ion-icon></span>
                 </router-link>
              </div>
              <div class="profile-avatar-container">
                <span class="profile-name">find or start a conversation</span>
              </div>
              <div class="search_firend_container">
                  <div class="wrapper">
                    <ion-icon name="search" class="search_icon"></ion-icon>
                    <input type="text" class="search_firend" placeholder="Search for a friend">
                  </div>
              </div>
          </div>
          <div class="chat_friend_list_body">
             <ul class="chat_friend_list_item">
             </ul> 
          </div>
      </section>

      <!-- 🔰 Start chat body ----------->
      <section class="chat-page__container__body__chat">
        <div class="chat-page__container__body__chat__header">
            <div class="chat-header-avatar">
              <img src="https://cdn.intra.42.fr/users/d9f9db534fb3caa1b1e7eb8bb338f390/haguezou.jpg" alt="avatar" class="chatAvatarImage">
              <div class="chat-header-info">
                <div class="chat-header-name"></div>
                <div class="chat-header-status"></div>
              </div>
            </div>
            <div class="extra_info_button">
              <ion-icon name="information-circle-outline" size="large"></ion-icon>
            </div>
        </div>
        <div class="chat-page__container__body__chat__messages">
             <!-- start message -->
            <div class="chat-container">
                <div class="chat-messages">
                  <!-- messages -->
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
                      <!-- ---Buttons--- -->
                      <button class="like-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                          <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
            </div>
             <!-- end message -->
        </div>
      </section>
      <!-- 🔰 End chat body ------------->
      <section class="chat-page__container__body__friend__personal__info">Hassab</section>
    </div>
    <!-- end the body of chat devided to three sections -->
  </div>
  <cloud-moving cloudCount="10"></cloud-moving> 
</div>`;


class CHAT extends HTMLElement {
  #messageInfo = {
    message: "",
    time: "",
    type: "",
    imoji: false
  }
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/chat-page.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("CHAT is Connected");
    this.chatAvatarImage = this.shadow.querySelector('.chatAvatarImage');
    this.chatHeaderName = this.shadow.querySelector('.chat-header-name');
    this.chatHeaderStatus = this.shadow.querySelector('.chat-header-status');
    this.chatMessages = this.shadow.querySelector('.chat-messages');
    this.chatFriendListParent  =  this.shadow.querySelector('.chat_friend_list_item');
    this.infoButton = this.shadow.querySelector('.extra_info_button');
    // --------------------------------
    this.observeActionButtons();
    this.conversationList();
    this.selectConversation();
    this.getConversationObjectOfCurrentUser();
    this.getExtraInfo();
  }
  
  disconnectedCallback() {
    console.log('CHAT is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

  // *********[ Methods ]******************************************************************************************************************************************

  // ------ Message tretment ------

  /**
   * @summary get the message from the input field and serilize it then return it to avoid any XSS attack
   * @returns {String} - return the message from the input field
   */
  getMessage(){
    const input = this.shadow.getElementById("messageInput");
    if(!input.value)
      return;
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };
    input.value = input.value.trim();
    if(input.value === "") return;
    const newValue = input.value.replace(/[&<>"'/]/g, s=>entityMap[s]);
    return newValue;
  }

  /**
   * @summary observe the action buttons (send Buuton -  Keyboard Enter - Send "thumb up 👍🏽" message ) and add the message to the chat by addMessage() method
   * @returns {void} - no return value
   */
  observeActionButtons(){
    const sendButton = this.shadow.querySelector('.send-button');
    sendButton.addEventListener('click', (e) => {
      this.#messageInfo.message = this.getMessage();
      this.#messageInfo.time = new Date().toLocaleTimeString();
      this.#messageInfo.type = "sent";
      this.addMessage(this.#messageInfo);
    });
    // handel Return/ Enter Click
    this.shadow.addEventListener("keydown",(e)=>{
        if(e.keyCode == 13 && e.target.tagName == "INPUT"){
            this.#messageInfo.message = this.getMessage();
            this.#messageInfo.time = new Date().toLocaleTimeString();
            this.#messageInfo.type = "sent";
            this.#messageInfo.imoji = false;
            this.addMessage(this.#messageInfo);
        }
    })
    // handel Like Button
    const likeButton = this.shadow.querySelector('.like-button');
    likeButton.addEventListener('click', (e) => {
      this.#messageInfo.message = "👍";
      this.#messageInfo.time = new Date().toLocaleTimeString();
      this.#messageInfo.type = "sent";
      this.#messageInfo.imoji = true;
      this.addMessage(this.#messageInfo);
    });
  }

  /**
   * 
   * @summary add the message to the chat body
   * @param {*} messageInfo Object containes the message, time, type and imoji of the message
   * @returns {void} - no return value
   */
  addMessage(messageInfo){
    const chatMessages = this.shadow.querySelector('.chat-messages');
    const message = document.createElement('div');

    chatMessages.classList.add('selectedChat');
    if(!messageInfo.message)
      return;
    message.classList.add('message', messageInfo.type);
    message.innerHTML = `
      <p>${messageInfo.message}</p>
      <div class="message-time">${messageInfo.time}</div>
    `;
    chatMessages.appendChild(message);
    if(messageInfo.imoji == true)
      message.classList.add('imoji');
    else if(messageInfo.imoji == false){  
      this.clearInput();
      message.classList.remove('imoji');
    }
    message.classList.remove('imoji');
    this.scrollDown();

    // use the API to post the message to the server
  }

  /**
   * 
   * @summary get the conversation object of the current user and display the last conversation
   * @returns {void} - no return value
   */
  scrollDown(){
    const chatMessages = this.shadow.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * 
   * @summary get the conversation object of the current user and display the last conversation
   * @returns {void} - no return value
   */
  clearInput(){
    const input = this.shadow.getElementById("messageInput");
    input.value = "";
    input.focus();  
  } 

// ****************************************************************************************************************************************************************

// ------ Select the conversation from the list ------

/**
 * 
 * @param {*} friendElemnt 
 * @param {*} clearInput 
 * @sumery select the friend from the list of friends and display the conversation
 * @return {void} - no return value
 */
async selectFriend(friendElemnt, clearInput = false){
  const friendId = friendElemnt.dataset.id;
  if(clearInput) this.clearInput();
  friendElemnt.parentNode.querySelectorAll('.chat_friend_list_body__friend').forEach((friend) => {
    friend.classList.remove('selected');
  });
  friendElemnt.classList.add('selected');
  try{
    const friendInfo = await this.getFriendInfo(friendId);
    this.updateChatInterface(friendInfo);
  }catch(err){
    console.log(err);
    this.chatMessages = "Error";
  }
}

  /**
   * @summary select the conversation from the list of friends and use this.addMessage() to display the conversation
   * @param {void} - no parameters
   * @returns {void} - no return value
   */
  selectConversation(){    
    const observer  =  new MutationObserver((mutations) => {
      // observe the chatFriendListParent for any changes(added by js to the DOM)
      if(this.chatFriendListParent.children.length > 0){
        const chatFriendListChild = this.chatFriendListParent.children;
        // add the first conversation to the chat body by default
        const firstFriend = chatFriendListChild[0];
        this.selectFriend(firstFriend);
          // --------------------------------------
          Array.from(chatFriendListChild).forEach((friend) => {
            friend.addEventListener('click', async (e) => {this.selectFriend(friend, true);});
          });
        observer.disconnect();
      }
    });
    observer.observe(this.chatFriendListParent, {childList: true});
}

/**
 * @summary update the chat interface with the new friend info
 * @param {*} friendInfo 
 * 
 */
updateChatInterface(friendInfo){
  this.chatAvatarImage.src = friendInfo.profile_picture_url;
  this.chatHeaderName.textContent = `${friendInfo.firstName} ${friendInfo.lastName}`;
  this.chatHeaderStatus.textContent = friendInfo.status? "Active now" : "Offline";
  this.chatMessages.innerHTML = "";
  friendInfo.discussion.forEach((discussion) => {
    const messageInfo = {
      message: discussion.message,
      time: discussion.timestamp.substring(11, 16),
      type: discussion.message_type,
      imoji: discussion.is_imoji
    }
    this.addMessage(messageInfo);
  });

}




  /**
   * 
   * @param {*} id - alphanumerical ID of the friend that we want to get his info
   * @returns  {Promise} - return the friend info object or throw an error
   */
  async getFriendInfo(id){
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      };
      const response = await app.API.get(`/api/users/${id}/`, { headers });
      return response;
    } catch (error) {
      console.error('Error fetching friend info:', error);
      return null;
    }
  }


  /**
   * 
   * @summary get the conversation object of the current user by calling his ID from JWT token
   * @returns {Promise} - return the conversation object of the current user
   *  
  */
  async getConversationObjectOfCurrentUser() {
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      };
      // get the conversation object of the current user
      const response = await app.API.get('/api/conversations/', { headers }); // temporary
      return response;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return null;
    }
  }

  /**
   *
   * @summary itereate over the conversation object and add each friend to the conversation list
   * @returns {Promise} - return true if the operation is done successfully or throw an error 
   */
  
  async conversationList() {
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      };
      // get the conversation object of the current user
      const response = await app.API.get('/api/conversations/', { headers });
      if (response && response.data) {
        response.data.forEach(conversation => {
          this.addFriendToConversation(conversation);
        });
      }
    } catch (error) {
      console.error('Error loading conversation list:', error);
    }
  }


  /**
   * 
   * @summary add the friend to the conversation list
   * @param {*} firend Object - the friend object that we want to add to the conversation list
   * @returns  {void} - add the friend to the conversation list
   */
  addFriendToConversation(firend){

    let conversationListParent =  this.shadow.querySelector('.chat_friend_list_item');
    let child = document.createElement('li');
    child.classList.add('chat_friend_list_body__friend');
    child.dataset.id = firend.userID;
    let status = firend.status? "online" : "offline";
    let firstName = firend.firstName;
    let lastName = firend.lastName;
    let lastMessage = firend.discussion.find(discussion => discussion.message_type == "received").message.substring(0, 60).concat(" ➢");
    let avatar = firend.profile_picture_url;
    child.innerHTML = `
      <div class="firend-info">
        <div class="friend-avatar">
          <img src="${avatar}" alt="avatar" class="friendAvatarImage" style="--isOnline:true">
          <div class="friend-status" data${status}></div>
        </div>
      </div>
      <div class="firend-info-message">
        <div class="friend-name">${firstName} ${lastName}</div>
        <div class="friend-last-message">${lastMessage}</div>
      </div>
    `;
    conversationListParent.appendChild(child);
    return ;
  }



  // ****************************************************************************************************************************************************************


  /**
   * 
   * @summary get extra information about the riend
   * @param {void} - no parameters
  * @returns {void} - no return value
   */
  getExtraInfo(){
    this.shadow.querySelector('.extra_info_button').addEventListener('click', (e) => {
      const id = e.currentTarget.parentNode.dataset.id;
      alert("Extra Info "+ id);
      console.log("Extra Info");
    });
  }
}
customElements.define('chat-page', CHAT);

export default CHAT;