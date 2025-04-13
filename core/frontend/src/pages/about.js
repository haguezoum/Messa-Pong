class AboutPage extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "/src/assets/style/about-page.css");
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    this.render();
    this.setupAnimations();
  }

  render() {
    const template = document.createElement("template");
    template.innerHTML = /*html*/ `
      <div id="about-page" class="about-page">
        <div class="container">
        <header-bar></header-bar>
          <header class="page-header">
            <h1 class="title">THE AMAZING TEAM</h1>
          </header>
          
          <main class="team-grid">
            <!-- Team Member 1 -->
            <div class="team-member" data-member="dev1">
              <div class="member-card">
                <div class="card-inner">
                  <div class="card-front">
                    <div class="comic-burst"></div>
                    <img class="member-image" src="/src/assets/images/haguezou.png" alt="Team Member 1">
                    <div class="member-name">Hassan Aguezoum</div>
                    <div class="member-title">FRONTEND WIZARD</div>
                  </div>
                  <div class="card-back">
                    <div class="member-bio">
                      <p>Full-stack developer with a passion for React and modern JavaScript. Creates pixel-perfect UIs and smooth animations.</p>
                    </div>
                    <div class="social-links">
                      <a href="https://github.com/haguezoum" class="social-icon github" aria-label="GitHub">
                        <i class="icon-github"></i>
                      </a>
                      <a href="https://linkedin.com/hassan-aguezoum" class="social-icon linkedin" aria-label="LinkedIn">
                        <i class="icon-linkedin"></i>
                      </a>
                      <a href="mailto:hassanaguezoum@gmail.com" class="social-icon email" aria-label="Email">
                        <i class="icon-email"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Team Member 2 -->
            <div class="team-member" data-member="dev2">
              <div class="member-card">
                <div class="card-inner">
                  <div class="card-front">
                    <div class="comic-burst"></div>
                    <img class="member-image" src="/src/assets/images/mbelouer.png" alt="Team Member 2">
                    <div class="member-name">BELOUARRAQ Mohammed</div>
                    <div class="member-title">BACKEND GENIUS</div>
                  </div>
                  <div class="card-back">
                    <div class="member-bio">
                      <p>Database expert and API architect. Builds robust and scalable backend systems that power our applications.</p>
                    </div>
                    <div class="social-links">
                      <a href="https://github.com/haguezoum" class="social-icon github" aria-label="GitHub">
                        <i class="icon-github"></i>
                      </a>
                      <a href="https://linkedin.com/hassan-aguezoum" class="social-icon linkedin" aria-label="LinkedIn">
                        <i class="icon-linkedin"></i>
                      </a>
                      <a href="mailto:hassanaguezoum@gmail.com" class="social-icon email" aria-label="Email">
                        <i class="icon-email"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Team Member 3 -->
            <div class="team-member" data-member="dev3">
              <div class="member-card">
                <div class="card-inner">
                  <div class="card-front">
                    <div class="comic-burst"></div>
                    <img class="member-image" src="/src/assets/images/bounjah.png" alt="Team Member 3">
                    <div class="member-name">Mohamed Elalej</div>
                    <div class="member-title">UI/UX Designer Prince</div>
                  </div>
                  <div class="card-back">
                    <div class="member-bio">
                      <p>Versatile developer who bridges the gap between frontend and backend. Expert in React, Node.js and Python.</p>
                    </div>
                    <div class="card-back">
                    <div class="member-bio">
                      <p>Database expert and API architect. Builds robust and scalable backend systems that power our applications.</p>
                    </div>
                    <div class="social-links">
                      <a href="https://github.com/haguezoum" class="social-icon github" aria-label="GitHub">
                        <i class="icon-github"></i>
                      </a>
                      <a href="https://linkedin.com/hassan-aguezoum" class="social-icon linkedin" aria-label="LinkedIn">
                        <i class="icon-linkedin"></i>
                      </a>
                      <a href="mailto:hassanaguezoum@gmail.com" class="social-icon email" aria-label="Email">
                        <i class="icon-email"></i>
                      </a>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Team Member 4 -->
            <div class="team-member" data-member="dev4">
              <div class="member-card">
                <div class="card-inner">
                  <div class="card-front">
                    <div class="comic-burst"></div>
                    <img class="member-image" src="/src/assets/images/tarazan.png" alt="Team Member 4">
                    <div class="member-name">Tarzan</div>
                    <div class="member-title">DEVOPS MASTER</div>
                  </div>
                  <div class="card-back">
                    <div class="member-bio">
                      <p>Infrastructure and deployment expert. Ensures our applications run smoothly in any environment with Docker and Kubernetes.</p>
                    </div>
                    <div class="social-links">
                      <a href="https://github.com" class="social-icon github" aria-label="GitHub">
                        <i class="icon-github"></i>
                      </a>
                      <a href="https://linkedin.com" class="social-icon linkedin" aria-label="LinkedIn">
                        <i class="icon-linkedin"></i>
                      </a>
                      <a href="mailto:example@example.com" class="social-icon email" aria-label="Email">
                        <i class="icon-email"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Team Member 5 -->
            <div class="team-member" data-member="dev5">
              <div class="member-card">
                <div class="card-inner">
                  <div class="card-front">
                    <div class="comic-burst"></div>
                    <img class="member-image" src="/src/assets/images/tstos.png" alt="Team Member 5">
                    <div class="member-name">Ayoub Et-tass</div>
                    <div class="member-title">Backend Engineer</div>
                  </div>
                  <div class="card-back">
                    <div class="member-bio">
                      <p>Software Engineer and research assistant @Oracle, creating OCI services and tools. </p>
                    </div>
                    <div class="social-links">
                      <a href="https://github.com" class="social-icon github" aria-label="GitHub">
                        <i class="icon-github"></i>
                      </a>
                      <a href="https://linkedin.com" class="social-icon linkedin" aria-label="LinkedIn">
                        <i class="icon-linkedin"></i>
                      </a>
                      <a href="mailto:example@example.com" class="social-icon email" aria-label="Email">
                        <i class="icon-email"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <footer class="page-footer">
            <div class="footer-text">THE AMAZING PING PONG PROJECT TEAM FROM 1337 CODING SCHOOL © 2025</div>
          </footer>
        </div>
        
        <div class="comic-dots"></div>
      </div>
    `;
    
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  setupAnimations() {
    // Get all team member cards
    const memberCards = this.shadow.querySelectorAll('.member-card');
    
    // Add flip animation on click
    memberCards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });

    // Add entrance animations
    const teamMembers = this.shadow.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
      setTimeout(() => {
        member.classList.add('animate-in');
      }, 200 * index);
    });

    // Add hover effect for social links
    const socialLinks = this.shadow.querySelectorAll('.social-icon');
    socialLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.classList.add('pulse');
      });
      link.addEventListener('animationend', () => {
        link.classList.remove('pulse');
      });
    });
  }

  disconnectedCallback() {
    // Clean up any event listeners or resources
    const memberCards = this.shadow.querySelectorAll('.member-card');
    memberCards.forEach(card => {
      card.removeEventListener('click', () => {});
    });
  }
}

customElements.define("about-page", AboutPage);