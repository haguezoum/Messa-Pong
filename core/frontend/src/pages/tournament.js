let template = document.createElement("template");

template.innerHTML = /*html*/`
<div id="tournament-page" class="tournament-page">
    <div class="container">
        <header-bar></header-bar>
        <div class="tournament-content">
            <h1 class="tournament-title">Tournament Mode</h1>
            
            <!-- Tournament bracket visualization -->
            <div class="tournament-bracket">
                <div class="round-labels">
                    <div class="round-label">Semifinals</div>
                    <div class="round-label">Final</div>
                    <div class="round-label">Champion</div>
                </div>
                
                <div class="bracket-container">
                    <!-- Semifinals -->
                    <div class="bracket-round semifinals">
                        <div class="match-card" id="semifinal1">
                            <div class="match-header">Semifinal 1</div>
                            <div class="match-players">
                                <div class="player" id="player1">Player 1</div>
                                <div class="vs-label">VS</div>
                                <div class="player" id="player2">Player 2</div>
                            </div>
                            <button class="play-match-btn" id="play-semifinal1-btn">
                                Play Match
                                <span class="button-glow"></span>
                            </button>
                            <div class="match-result" id="semifinal1-result">
                                <!-- Winner will be shown here -->
                            </div>
                        </div>
                        
                        <div class="match-card" id="semifinal2">
                            <div class="match-header">Semifinal 2</div>
                            <div class="match-players">
                                <div class="player" id="player3">Player 3</div>
                                <div class="vs-label">VS</div>
                                <div class="player" id="player4">Player 4</div>
                            </div>
                            <button class="play-match-btn" id="play-semifinal2-btn">
                                Play Match
                                <span class="button-glow"></span>
                            </button>
                            <div class="match-result" id="semifinal2-result">
                                <!-- Winner will be shown here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Final -->
                    <div class="bracket-round final">
                        <div class="match-card" id="final-match">
                            <div class="match-header">Final Match</div>
                            <div class="match-players">
                                <div class="player" id="semifinal1-winner">TBD</div>
                                <div class="vs-label">VS</div>
                                <div class="player" id="semifinal2-winner">TBD</div>
                            </div>
                            <button class="play-match-btn" id="play-final-btn" disabled>
                                Play Final
                                <span class="button-glow"></span>
                            </button>
                            <div class="match-result" id="final-result">
                                <!-- Winner will be shown here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Champion -->
                    <div class="bracket-round champion">
                        <div class="champion-card" id="champion-display">
                            <div class="champion-trophy">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="champion-title">Tournament Champion</div>
                            <div class="champion-name" id="tournament-champion">TBD</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button id="backButton" class="back-button">
                <span class="button-text">Back to Game Selection</span>
                <span class="button-glow"></span>
            </button>
        </div>
    </div>
    <cloud-moving cloudCount="10"></cloud-moving>
</div>`;

class TournamentPage extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        
        // Add Font Awesome for icons
        const fontAwesome = document.createElement("link");
        fontAwesome.setAttribute("rel", "stylesheet");
        fontAwesome.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
        this.shadow.appendChild(fontAwesome);

        // Add CSS
        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "src/assets/style/tournament-page.css");
        this.shadow.appendChild(linkElem);
        
        // Initialize tournament data
        this.tournamentData = {
            players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
            semifinal1Winner: null,
            semifinal2Winner: null,
            champion: null,
            currentMatch: null,
            currentPlayers: []
        };
        
        // Try to load saved tournament state
        this.loadTournamentState();
    }

    connectedCallback() {
        console.log("Tournament page component connected");
        this.shadow.appendChild(template.content.cloneNode(true));
        
        // Update UI to reflect current tournament state
        this.updateTournamentUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check if we're returning from a match
        this.checkReturnFromMatch();
    }
    
    loadTournamentState() {
        const savedState = localStorage.getItem('tournamentState');
        if (savedState) {
            try {
                this.tournamentData = JSON.parse(savedState);
                console.log('Loaded tournament state:', this.tournamentData);
            } catch (e) {
                console.error('Failed to load tournament state:', e);
            }
        }
    }
    
    saveTournamentState() {
        localStorage.setItem('tournamentState', JSON.stringify(this.tournamentData));
        console.log('Saved tournament state:', this.tournamentData);
    }
    
    updateTournamentUI() {
        // Update semifinal 1 display
        if (this.tournamentData.semifinal1Winner) {
            const semifinal1Result = this.shadow.getElementById('semifinal1-result');
            semifinal1Result.textContent = `Winner: ${this.tournamentData.semifinal1Winner}`;
            semifinal1Result.classList.add('match-completed');
            
            const semifinal1Btn = this.shadow.getElementById('play-semifinal1-btn');
            semifinal1Btn.textContent = 'Match Completed';
            semifinal1Btn.disabled = true;
            
            const semifinal1Winner = this.shadow.getElementById('semifinal1-winner');
            semifinal1Winner.textContent = this.tournamentData.semifinal1Winner;
            semifinal1Winner.classList.add('winner');
        }
        
        // Update semifinal 2 display
        if (this.tournamentData.semifinal2Winner) {
            const semifinal2Result = this.shadow.getElementById('semifinal2-result');
            semifinal2Result.textContent = `Winner: ${this.tournamentData.semifinal2Winner}`;
            semifinal2Result.classList.add('match-completed');
            
            const semifinal2Btn = this.shadow.getElementById('play-semifinal2-btn');
            semifinal2Btn.textContent = 'Match Completed';
            semifinal2Btn.disabled = true;
            
            const semifinal2Winner = this.shadow.getElementById('semifinal2-winner');
            semifinal2Winner.textContent = this.tournamentData.semifinal2Winner;
            semifinal2Winner.classList.add('winner');
        }
        
        // Enable final match button if both semifinals are completed
        if (this.tournamentData.semifinal1Winner && this.tournamentData.semifinal2Winner) {
            const playFinalBtn = this.shadow.getElementById('play-final-btn');
            playFinalBtn.disabled = false;
        }
        
        // Update champion if available
        if (this.tournamentData.champion) {
            const finalResult = this.shadow.getElementById('final-result');
            finalResult.textContent = `Champion: ${this.tournamentData.champion}`;
            finalResult.classList.add('match-completed');
            
            const playFinalBtn = this.shadow.getElementById('play-final-btn');
            playFinalBtn.textContent = 'Tournament Complete';
            playFinalBtn.disabled = true;
            
            const tournamentChampion = this.shadow.getElementById('tournament-champion');
            tournamentChampion.textContent = this.tournamentData.champion;
            tournamentChampion.classList.add('champion-crowned');
            
            const championDisplay = this.shadow.getElementById('champion-display');
            championDisplay.classList.add('champion-crowned');
        }
    }
    
    checkReturnFromMatch() {
        // Check if we're returning from a match
        const matchWinner = localStorage.getItem('tournamentMatchWinner');
        const matchType = localStorage.getItem('tournamentMatchType');
        
        if (matchWinner && matchType) {
            console.log(`Returned from ${matchType}, winner: ${matchWinner}`);
            
            // Update tournament data based on match result
            if (matchType === 'semifinal1') {
                this.tournamentData.semifinal1Winner = matchWinner;
            } else if (matchType === 'semifinal2') {
                this.tournamentData.semifinal2Winner = matchWinner;
            } else if (matchType === 'final') {
                this.tournamentData.champion = matchWinner;
            }
            
            // Save updated tournament state
            this.saveTournamentState();
            
            // Update UI to reflect changes
            this.updateTournamentUI();
            
            // Clear the match data
            localStorage.removeItem('tournamentMatchWinner');
            localStorage.removeItem('tournamentMatchType');
        }
    }

    setupEventListeners() {
        // Back button to game selection
        const backButton = this.shadow.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                // Clear tournament state when going back
                localStorage.removeItem('tournamentState');
                localStorage.removeItem('tournamentMatchWinner');
                localStorage.removeItem('tournamentMatchType');
                
                window.dispatchEvent(new CustomEvent('stateChanged', {
                    detail: { value: '/selectgamemode' }
                }));
            });
        }
        
        // Semifinal 1 match button
        const playSemifinal1Btn = this.shadow.getElementById('play-semifinal1-btn');
        if (playSemifinal1Btn) {
            playSemifinal1Btn.addEventListener('click', () => {
                this.startMatch('semifinal1', [this.tournamentData.players[0], this.tournamentData.players[1]]);
            });
        }
        
        // Semifinal 2 match button
        const playSemifinal2Btn = this.shadow.getElementById('play-semifinal2-btn');
        if (playSemifinal2Btn) {
            playSemifinal2Btn.addEventListener('click', () => {
                this.startMatch('semifinal2', [this.tournamentData.players[2], this.tournamentData.players[3]]);
            });
        }
        
        // Final match button
        const playFinalBtn = this.shadow.getElementById('play-final-btn');
        if (playFinalBtn) {
            playFinalBtn.addEventListener('click', () => {
                if (this.tournamentData.semifinal1Winner && this.tournamentData.semifinal2Winner) {
                    this.startMatch('final', [this.tournamentData.semifinal1Winner, this.tournamentData.semifinal2Winner]);
                }
            });
        }
        
        // New tournament button (could be added later)
        // const newTournamentBtn = this.shadow.getElementById('new-tournament-btn');
        // if (newTournamentBtn) {
        //     newTournamentBtn.addEventListener('click', () => {
        //         this.resetTournament();
        //     });
        // }
    }
    
    startMatch(matchType, players) {
        console.log(`Starting ${matchType} between ${players[0]} and ${players[1]}`);
        
        // Save match info to retrieve after the game
        localStorage.setItem('tournamentMatchType', matchType);
        
        // Navigate to local game page
        window.dispatchEvent(new CustomEvent('stateChanged', {
            detail: { value: '/localgame' }
        }));
        
        // Store current match data
        this.tournamentData.currentMatch = matchType;
        this.tournamentData.currentPlayers = players;
        this.saveTournamentState();
    }
    
    resetTournament() {
        this.tournamentData = {
            players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
            semifinal1Winner: null,
            semifinal2Winner: null,
            champion: null,
            currentMatch: null,
            currentPlayers: []
        };
        
        this.saveTournamentState();
        
        // Refresh the UI
        this.updateTournamentUI();
    }

    disconnectedCallback() {
        console.log("Tournament page disconnected");
        
        // Save tournament state when component is disconnected
        this.saveTournamentState();
    }
}

customElements.define('tournament-page', TournamentPage);
export default TournamentPage; 