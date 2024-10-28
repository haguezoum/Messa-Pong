let template = document.createElement("template");

template.innerHTML =
  `<div id="login-page"> 
    <form class="form">
      
        <label for="nome">Name:</label>
        
          <input type="text" class="infos" id="nome" name="nome">
        <div class="mario"></div>
          <label for="email">E-mail:</label>
          <input type="email" id="email" name="email">

          <button type="submit">Send</button>
          <button type="reset" id="limpar">Clear</button>


    </form>
  </div>`;






class LOGIN extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/login-page.css');
    shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("LOGIN is Connected");
  }
  
  async disconnectedCallback() {
    console.log('LOGIN is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('login-page', LOGIN);

export default LOGIN;