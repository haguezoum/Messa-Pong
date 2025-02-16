let template = document.createElement("template");

template.innerHTML =/*html*/`<div id="cloud-moving" class="cloud-moving"></div>`;

class Cloudmoving extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/cloud-moving.css");
    this.shadow.appendChild(linkElem);
    this.cloudCount = this.getAttribute("cloudCount");
    if (!this.cloudCount) {
      this.cloudCount = 20;
      console.log("Cloud Count is not provided, defaulting to 30");
    }
  }

  connectedCallback() {
    console.log("Cloudmoving is Connected");
    this.animateClouds();
  }

  disconnectedCallback() {
    console.log("Cloudmoving is Disonnected");
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

  // Function to animate clouds
  animateClouds = () => {
    let cloudContainer = this.shadow.querySelector(".cloud-moving");
    if (!cloudContainer) return; // Ensure the container exists

    // Clear existing clouds to avoid duplication
    cloudContainer.innerHTML = "";

    // Create new clouds
    for (let i = 0; i < this.cloudCount; i++) {
      let cloud = document.createElement("div");
      cloud.classList.add("cloud");
      cloudContainer.appendChild(cloud);
    }

    const randomBetween = (min, max) => Math.random() * (max - min) + min; // Random number between 2 values
    const clouds = this.shadow.querySelectorAll(".cloud-moving .cloud");

    clouds.forEach((cloud) => {
      let img = document.createElement("img");
      img.src = "src/assets/images/cloud.png";
      img.alt = "cloud";
      const random = Math.random();
      img.style.width = `${10 + random * 170}px`;
      img.style.height = "auto";
      cloud.appendChild(img);

      // Set initial position outside the viewport
      cloud.style.position = "absolute";
      cloud.style.bottom = `${randomBetween(0, 40)}%`; // Random vertical position
      cloud.style.left = `${-img.width}px`; // Start outside the left side of the viewport

      // Animation properties
      const animationDuration = randomBetween(100, 200); // Longer duration for smoother movement
      const animationDelay = randomBetween(0, 220); // Random delay to stagger clouds

      cloud.style.animationName = "moveClouds";
      cloud.style.animationTimingFunction = "linear";
      cloud.style.animationIterationCount = "infinite";
      cloud.style.animationDuration = `${animationDuration}s`;
      cloud.style.animationDelay = `${-animationDelay}s`; // Negative delay to start immediately
    });
  };
}
customElements.define("cloud-moving", Cloudmoving);

export default Cloudmoving;
