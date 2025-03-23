/**
 * 404 Not Found Page
 * Displayed when no matching route is found
 */

let template = document.createElement("template");
template.innerHTML = /*html*/ `
<style>
  .not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    padding: 0 2rem;
  }
  
  .status-code {
    font-size: 8rem;
    font-weight: bold;
    color: var(--alive-blue);
    margin: 0;
    line-height: 1;
  }
  
  .message {
    font-size: 2rem;
    margin: 1rem 0 2rem;
  }
  
  .description {
    color: #666;
    margin-bottom: 2rem;
    max-width: 600px;
  }
  
  .home-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--alive-blue);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .home-link:hover {
    background-color: #2980b9;
  }
</style>

<div class="not-found-container">
  <h1 class="status-code">404</h1>
  <h2 class="message">Page Not Found</h2>
  <p class="description">
    The page you're looking for doesn't exist or has been moved.
  </p>
  <a href="/" class="home-link" data-link>Return to Home</a>
</div>
`;

class NotFoundPage extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    console.log("404 page connected");
  }
}

customElements.define("not-found-page", NotFoundPage);
export default NotFoundPage; 