const template = document.createElement("template")
template.innerHTML = /*html*/ `
<div id="select-game" class="select-game">
    <div class="container">
       
      <header-bar></header-bar>
      
      <div class="page-title-container" data-text="SELECT GAME MODE">
        <h1 class="page-title" data-text="SELECT GAME MODE">SELECT GAME MODE</h1>
        <div class="title-glow"></div>
        <div class="title-particles"></div>
      </div>
      
      <main class="game-options">
            <div class="game-option" id="tournament">
                <div class="option-content">
                    <div class="option-shine"></div>
                    <div class="option-particles"></div>
                    <img class="option-image" src="https://i.ytimg.com/vi/KtSoqmke8fE/maxresdefault.jpg" alt="Tournament mode" loading="lazy">
                    <div class="option-controls">
                        <h3>Tournament</h3>
                        <p class="option-description">Compete in structured brackets</p>
                        <span class="action-btn">
                            <ion-icon name="trophy-outline"></ion-icon>
                            <span class="action-glow"></span>
                        </span>
                    </div>
                    <div class="option-overlay"></div>
                </div>
            </div>
            <div class="game-option" id="play-offline">
                <div class="option-content">
                    <div class="option-shine"></div>
                    <div class="option-particles"></div>
                    <img class="option-image" src="https://i.ytimg.com/vi/ECdqrJFTLDM/maxresdefault.jpg" alt="Play offline mode" loading="lazy">
                    <div class="option-controls">
                        <h3>Play Offline</h3>
                        <p class="option-description">Local 2-player competition</p>
                        <span class="action-btn">
                            <ion-icon name="people-outline"></ion-icon>
                            <span class="action-glow"></span>
                        </span>
                    </div>
                    <div class="option-overlay"></div>
                </div>
            </div>
            <div class="game-option" id="play-ai">
                <div class="option-content">
                    <div class="option-shine"></div>
                    <div class="option-particles"></div>
                    <img class="option-image" src="https://miro.medium.com/v2/resize:fit:1280/0*9UXP9CSoFZoFw3OD" alt="Play with AI mode" loading="lazy">
                    <div class="option-controls">
                        <h3>Play with AI</h3>
                        <p class="option-description">Challenge our intelligent CPU</p>
                        <span class="action-btn">
                            <ion-icon name="hardware-chip-outline"></ion-icon>
                            <span class="action-glow"></span>
                        </span>
                    </div>
                    <div class="option-overlay"></div>
                </div>
            </div>
        </main>
    </div>
    
    <div class="floating-elements">
      <div class="floating-element" style="--delay: 0s; --size: 30px; --top: 10%; --left: 5%;"><ion-icon name="trophy"></ion-icon></div>
      <div class="floating-element" style="--delay: 2s; --size: 20px; --top: 20%; --left: 80%;"><ion-icon name="people"></ion-icon></div>
      <div class="floating-element" style="--delay: 1s; --size: 25px; --top: 70%; --left: 90%;"><ion-icon name="hardware-chip"></ion-icon></div>
      <div class="floating-element" style="--delay: 3s; --size: 35px; --top: 85%; --left: 15%;"><ion-icon name="game-controller"></ion-icon></div>
      <div class="floating-element" style="--delay: 0.5s; --size: 22px; --top: 45%; --left: 45%;"><ion-icon name="medal"></ion-icon></div>
    </div>
    
    <div class="background-grid"></div>
	<cloud-moving cloudCount="10"></cloud-moving> 
</div>`

class SelectGame extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: "open" })

    // Add Ionicons script
    const ioniconsModule = document.createElement("script")
    ioniconsModule.setAttribute("type", "module")
    ioniconsModule.setAttribute("src", "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js")

    const ioniconsNoModule = document.createElement("script")
    ioniconsNoModule.setAttribute("nomodule", "")
    ioniconsNoModule.setAttribute("src", "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js")

    // Add CSS
    const linkElem = document.createElement("link")
    linkElem.setAttribute("rel", "stylesheet")
    linkElem.setAttribute("href", "select-game.css")

    // Append elements to shadow DOM
    this.shadow.appendChild(ioniconsModule)
    this.shadow.appendChild(ioniconsNoModule)
    this.shadow.appendChild(linkElem)

    // Current theme state
    this.currentTheme = null
  }

  connectedCallback() {
    console.log("SelectGame component connected")
    this.shadow.appendChild(template.content.cloneNode(true))
    
    // Add CSS
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/selectgamemode-page.css");
    this.shadow.appendChild(linkElem);
    
    // Add Font Awesome for additional icons
    const fontAwesome = document.createElement("link");
    fontAwesome.setAttribute("rel", "stylesheet");
    fontAwesome.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
    this.shadow.appendChild(fontAwesome);
    
    // Set default theme
    this.setTheme("default")

    // Setup event listeners
    this.setupEventListeners()
    
    // Add custom animations
    this.setupAnimations()

    // Set highlighted option by default without navigating
    setTimeout(() => {
      // Just visually select the AI option without triggering navigation
      const aiOption = this.shadow.getElementById("play-ai")
      if (aiOption) {
        const allOptions = this.shadow.querySelectorAll(".game-option")
        allOptions.forEach((option) => option.classList.remove("active"))
        aiOption.classList.add("active")
        this.setTheme("earth")
      }
    }, 100)
  }

  setupEventListeners() {
    // Get all game option elements
    const gameOptions = this.shadow.querySelectorAll(".game-option")

    // Add click and hover event listeners to each option
    gameOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        this.handleOptionClick(e.currentTarget.id)
      })

      // Add hover events for theme changes
      option.addEventListener("mouseenter", (e) => {
        const optionId = e.currentTarget.id
        if (optionId === "tournament") {
          this.setTheme("fire")
        } else if (optionId === "play-offline") {
          this.setTheme("water")
        } else if (optionId === "play-ai") {
          this.setTheme("earth")
        }
      })

      // Reset theme when mouse leaves
      option.addEventListener("mouseleave", () => {
        // Only reset if the option is not active
        if (!option.classList.contains("active")) {
          this.setTheme("default")
        }
      })
    })

    // Add back button functionality
    const backButton = this.shadow.querySelector(".back-button")
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.goBack()
      })
    }
  }

  setupAnimations() {
    // Create particle animation for each option
    const createParticles = (container, count, colors) => {
      const particlesContainer = container.querySelector('.option-particles')
      if (!particlesContainer) return
      
      particlesContainer.innerHTML = ''
      
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        
        // Random properties
        const size = 2 + Math.random() * 4
        const posX = Math.random() * 100
        const posY = Math.random() * 100
        const delay = Math.random() * 5
        const duration = 1 + Math.random() * 2
        const color = colors[Math.floor(Math.random() * colors.length)]
        
        // Apply styles
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${posX}%`
        particle.style.top = `${posY}%`
        particle.style.background = color
        particle.style.animationDelay = `${delay}s`
        particle.style.animationDuration = `${duration}s`
        
        particlesContainer.appendChild(particle)
      }
    }
    
    // Simple function to handle title hover effects
    const setupTitleHoverEffect = () => {
      const titleContainer = this.shadow.querySelector('.page-title-container')
      const title = this.shadow.querySelector('.page-title')
      
      if (titleContainer && title) {
        titleContainer.addEventListener('mouseenter', () => {
          title.classList.add('title-hover')
        })
        
        titleContainer.addEventListener('mouseleave', () => {
          title.classList.remove('title-hover')
        })
      }
    }
    
    // Set up particles for each game option
    const gameOptions = this.shadow.querySelectorAll('.game-option')
    gameOptions.forEach((option) => {
      let colors = ['#ffffff']
      
      if (option.id === 'tournament') {
        colors = ['#ff5722', '#ff9800', '#ffcc80']
      } else if (option.id === 'play-offline') {
        colors = ['#29b6f6', '#4fc3f7', '#81d4fa']
      } else if (option.id === 'play-ai') {
        colors = ['#66bb6a', '#81c784', '#a5d6a7']
      }
      
      createParticles(option, 15, colors)
    })
    
    // Setup simplified title hover effect
    setupTitleHoverEffect()
    
    // Add continuous pulsing animation to the title
    const titleGlow = this.shadow.querySelector('.title-glow')
    if (titleGlow) {
      // Apply the pulse class immediately for continuous animation
      titleGlow.classList.add('pulse')
      
      // Add special effect when hovering over the title
      const titleContainer = this.shadow.querySelector('.page-title-container')
      if (titleContainer) {
        titleContainer.addEventListener('mouseenter', () => {
          // Intensify the glow on hover
          titleGlow.style.opacity = '0.9'
          titleGlow.style.filter = 'blur(18px)'
        })
        
        titleContainer.addEventListener('mouseleave', () => {
          // Return to normal glow when not hovering
          titleGlow.style.opacity = '0.6'
          titleGlow.style.filter = 'blur(10px)'
        })
      }
    }
    
    // Add hover effect for game options
    gameOptions.forEach((option) => {
      const actionBtn = option.querySelector('.action-btn')
      if (actionBtn) {
        actionBtn.addEventListener('mouseenter', () => {
          const glow = actionBtn.querySelector('.action-glow')
          if (glow) {
            glow.style.opacity = '1'
            glow.classList.add('pulse')
          }
        })
        
        actionBtn.addEventListener('mouseleave', () => {
          const glow = actionBtn.querySelector('.action-glow')
          if (glow) {
            glow.style.opacity = '0.5'
            glow.classList.remove('pulse')
          }
        })
      }
    })
    
    // Animate the floating elements
    this.animateFloatingElements()
    
    // Periodically refresh option particles only
    this.animationIntervals = []
    const refreshInterval = setInterval(() => {
      gameOptions.forEach((option) => {
        let colors = ['#ffffff']
        
        if (option.id === 'tournament') {
          colors = ['#ff5722', '#ff9800', '#ffcc80']
        } else if (option.id === 'play-offline') {
          colors = ['#29b6f6', '#4fc3f7', '#81d4fa']
        } else if (option.id === 'play-ai') {
          colors = ['#66bb6a', '#81c784', '#a5d6a7']
        }
        
        createParticles(option, 10, colors) // Reduced particle count
      })
    }, 15000) // Reduced refresh frequency
    
    this.animationIntervals.push(refreshInterval)
  }
  
  animateFloatingElements() {
    const elements = this.shadow.querySelectorAll('.floating-element')
    elements.forEach(element => {
      // Set random movement animation
      const randomX = 10 + Math.random() * 10
      const randomY = 10 + Math.random() * 10
      const randomDuration = 5 + Math.random() * 10
      
      element.style.animation = `float-element ${randomDuration}s ease-in-out infinite alternate, rotate ${randomDuration * 2}s linear infinite`
      element.style.setProperty('--move-x', `${randomX}px`)
      element.style.setProperty('--move-y', `${randomY}px`)
    })
  }
  
  handleOptionClick(optionId, shouldNavigate = true) {
    console.log(`Selected option: ${optionId}`)

    // Add active class to the clicked option
    const selectedOption = this.shadow.getElementById(optionId)

    // Remove active class from all options first
    const allOptions = this.shadow.querySelectorAll(".game-option")
    allOptions.forEach((option) => option.classList.remove("active"))

    // Add active class to the selected option
    selectedOption.classList.add("active")

    // Only navigate if explicitly requested (user click)
    if (shouldNavigate) {
      // Handle redirection based on option selected
      if (optionId === "play-ai") {
        // Redirect to AI game
        window.dispatchEvent(new CustomEvent('stateChanged', {
          detail: { value: '/aigame' }
        }))
      } else if (optionId === "play-offline") {
        // Redirect to local game
        window.dispatchEvent(new CustomEvent('stateChanged', {
          detail: { value: '/localgame' }
        }))
      } else if (optionId === "tournament") {
        // Redirect to tournament mode
        window.dispatchEvent(new CustomEvent('stateChanged', {
          detail: { value: '/tournament' }
        }))
      }
    }

    // Dispatch a custom event with the selected option
    const event = new CustomEvent("gameOptionSelected", {
      detail: { option: optionId },
      bubbles: true,
      composed: true,
    })

    this.dispatchEvent(event)
  }

  setTheme(theme) {
    // Skip if it's the same theme
    if (this.currentTheme === theme) return

    const selectGameElement = this.shadow.querySelector(".select-game")

    // Remove all theme classes
    selectGameElement.classList.remove("water-theme", "fire-theme", "earth-theme")

    // Add new theme class
    if (theme === "water") {
      selectGameElement.classList.add("water-theme")
    } else if (theme === "fire") {
      selectGameElement.classList.add("fire-theme")
    } else if (theme === "earth") {
      selectGameElement.classList.add("earth-theme")
    }

    // Update current theme
    this.currentTheme = theme

    // Dispatch theme change event
    const event = new CustomEvent("themeChanged", {
      detail: { theme },
      bubbles: true,
      composed: true,
    })

    this.dispatchEvent(event)
  }

  goBack() {
    console.log("Going back to previous page")
    // Dispatch a custom event for navigation
    const event = new CustomEvent("navigateBack", {
      bubbles: true,
      composed: true,
    })

    this.dispatchEvent(event)
  }

  // Public method to programmatically select a game option
  // shouldNavigate parameter determines if selection should trigger navigation
  selectOption(optionId, shouldNavigate = true) {
    if (["tournament", "play-offline", "play-ai"].includes(optionId)) {
      this.handleOptionClick(optionId, shouldNavigate)
    } else {
      console.error(`Invalid option ID: ${optionId}`)
    }
  }

  // Public method to programmatically set theme
  changeTheme(theme) {
    if (["default", "water", "fire", "earth"].includes(theme)) {
      this.setTheme(theme)
    } else {
      console.error(`Invalid theme: ${theme}`)
    }
  }

  disconnectedCallback() {
    console.log("SelectGame component disconnected")

    // Clean up event listeners if needed
    const gameOptions = this.shadow.querySelectorAll(".game-option")
    gameOptions.forEach((option) => {
      option.removeEventListener("click", this.handleOptionClick)
      option.removeEventListener("mousemove", null)
      option.removeEventListener("mouseleave", null)
    })

    const backButton = this.shadow.querySelector(".back-button")
    if (backButton) {
      backButton.removeEventListener("click", this.goBack)
    }
    
    const pageTitle = this.shadow.querySelector('.page-title')
    if (pageTitle) {
      pageTitle.removeEventListener('mouseover', null)
      pageTitle.removeEventListener('mouseleave', null)
    }
    
    // Clear any animation intervals
    if (this.animationIntervals) {
      this.animationIntervals.forEach(interval => clearInterval(interval))
    }
  }

  static get observedAttributes() {
    return ["theme", "selected-option"]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "theme" && oldValue !== newValue) {
      this.changeTheme(newValue)
    }

    if (name === "selected-option" && oldValue !== newValue) {
      this.selectOption(newValue)
    }
  }
}

customElements.define("select-game", SelectGame)
export default SelectGame