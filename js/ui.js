export class UIManager {
    constructor() {
        this.hud = {
            dinoCount: document.getElementById('dino-count') || { textContent: '' },
            rareCount: document.getElementById('rare-count') || { textContent: '' },
            portalCount: document.getElementById('portal-count') || { textContent: '' }
        };
        this.interactionPrompt = document.getElementById('interaction-prompt');
        
        this.startScreen = document.getElementById('start-screen');
        this.winScreen = document.getElementById('win-screen');
        this.portalPanel = document.getElementById('portal-panel');
        
        this.portalBtns = document.querySelectorAll('.portal-btn');
        
        this.onStartGame = null;
        this.onPortalSelect = null;
        this.onRestart = null;
        
        this.bindEvents();
    }

    bindEvents() {
        const startBtn = document.getElementById('start-button');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.hideStartScreen();
                if (this.onStartGame) this.onStartGame();
            });
        }

        const restartBtn = document.getElementById('restart-button');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hideWinScreen();
                if (this.onRestart) this.onRestart();
            });
        }

        this.portalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const station = btn.dataset.station;
                if (this.onPortalSelect) this.onPortalSelect(station);
            });
        });

        const closePortalBtn = document.getElementById('close-portal');
        if (closePortalBtn) {
            closePortalBtn.addEventListener('click', () => {
                this.hidePortalPanel();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyI') {
                const panel = document.getElementById('inventory-panel');
                if (panel) panel.classList.toggle('hidden');
            }
            if (e.code === 'KeyP') {
                this.togglePortalPanel();
            }
        });
    }

    updateHUD(counts) {
        if (this.hud.dinoCount) {
            this.hud.dinoCount.textContent = `🦖 공룡: ${counts.items}/10`;
        }
        if (this.hud.rareCount) {
            this.hud.rareCount.textContent = `⭐ 레어: ${counts.rare}/5`;
        }
        if (this.hud.portalCount) {
            this.hud.portalCount.textContent = `🔮 포탈: ${counts.portal}/3`;
        }
    }

    showInteractionPrompt(show, text = '[E] 공룡과 대화하기') {
        if (this.interactionPrompt) {
            this.interactionPrompt.classList.toggle('hidden', !show);
            const span = this.interactionPrompt.querySelector('span');
            if (span) span.textContent = text;
        }
    }

    hideStartScreen() {
        if (this.startScreen) this.startScreen.classList.add('hidden');
    }

    showWinScreen() {
        if (this.winScreen) this.winScreen.classList.remove('hidden');
    }

    hideWinScreen() {
        if (this.winScreen) this.winScreen.classList.add('hidden');
    }

    showPortalPanel() {
        if (this.portalPanel) this.portalPanel.classList.remove('hidden');
    }

    hidePortalPanel() {
        if (this.portalPanel) this.portalPanel.classList.add('hidden');
    }

    togglePortalPanel() {
        if (this.portalPanel) this.portalPanel.classList.toggle('hidden');
    }

    showAngelScreen() {
        const angelScreen = document.getElementById('angel-screen');
        if (angelScreen) {
            angelScreen.classList.remove('hidden');
            setTimeout(() => {
                angelScreen.classList.add('hidden');
            }, 3000);
        }
    }
}

export class GameState {
    constructor() {
        this.state = 'start';
        this.isPaused = false;
        this.isAngelMode = false;
        this.currentStation = 'land';
    }

    setState(newState) {
        this.state = newState;
        console.log(`Game state: ${newState}`);
    }

    setStation(station) {
        this.currentStation = station;
    }

    enableAngelMode() {
        this.isAngelMode = true;
        this.state = 'angel';
    }

    reset() {
        this.state = 'playing';
        this.isPaused = false;
        this.isAngelMode = false;
        this.currentStation = 'land';
    }
}