// Game Mode Selection Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mode selection screen loaded');
    
    // Get DOM elements
    const friendModeButton = document.querySelector('#friend-mode .mode-button');
    const aiModeButton = document.querySelector('#ai-mode .mode-button');
    const backButton = document.getElementById('back-button');
    
    // Add event listeners
    if (friendModeButton) {
        friendModeButton.addEventListener('click', function() {
            console.log('Friend mode selected');
            // Redirect to the existing local multiplayer game
            window.location.href = '/local/friend';
        });
    }
    
    if (aiModeButton) {
        aiModeButton.addEventListener('click', function() {
            console.log('AI mode selected');
            // Redirect to the AI mode game
            window.location.href = '/local/ai';
        });
    }
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            console.log('Back button clicked');
            // Redirect to the main menu
            window.location.href = '/';
        });
    }
    
    // Add hover effects for cards
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle animation or effect on hover
            this.style.transform = 'translateY(-5px)';
            this.style.borderColor = 'var(--accent-color)';
            this.style.boxShadow = '0 10px 25px rgba(14, 12, 40, 0.6), inset 0 0 40px rgba(135, 205, 234, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset the animation or effect
            this.style.transform = '';
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
        
        // Make the entire card clickable
        card.addEventListener('click', function(e) {
            // If the click wasn't on the button itself, trigger the button click
            if (!e.target.classList.contains('mode-button')) {
                const button = this.querySelector('.mode-button');
                if (button) button.click();
            }
        });
    });
    
    // Add particle effects for visual appeal
    createParticles();
});

// Function to create floating particles in the background
function createParticles() {
    const container = document.querySelector('.game-container');
    if (!container) return;
    
    // Create a container for particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.position = 'absolute';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.overflow = 'hidden';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '-1';
    
    container.insertBefore(particleContainer, container.firstChild);
    
    // Create particles
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    
    // Random size between 2px and 6px
    const size = Math.random() * 4 + 2;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random opacity between 0.1 and 0.5
    const opacity = Math.random() * 0.4 + 0.1;
    
    // Random animation duration between 15s and 40s
    const duration = Math.random() * 25 + 15;
    
    // Set particle styles
    particle.style.position = 'absolute';
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = 'rgba(135, 205, 234, ' + opacity + ')';
    particle.style.boxShadow = '0 0 10px rgba(135, 205, 234, 0.5)';
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animation = `floatParticle ${duration}s linear infinite`;
    
    // Add the particle to the container
    container.appendChild(particle);
    
    // Create the keyframe animation dynamically
    if (!document.querySelector('#particleAnimation')) {
        const style = document.createElement('style');
        style.id = 'particleAnimation';
        style.innerHTML = `
            @keyframes floatParticle {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: ${opacity};
                }
                25% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(90deg);
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                }
                75% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(270deg);
                }
                100% {
                    transform: translate(0, 0) rotate(360deg);
                    opacity: ${opacity};
                }
            }
        `;
        document.head.appendChild(style);
    }
} 