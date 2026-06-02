export class InventorySystem {
    constructor() {
        this.items = [];
        this.rareItems = [];
        this.portalItems = [];
        
        this.maxItems = 10;
        this.rareToPortal = 5;
        this.portalToAngel = 3;
        
        this.onItemCollected = null;
        this.onRareCreated = null;
        this.onPortalCreated = null;
        this.onAngelTransformation = null;
    }

    addItem() {
        this.items.push({
            type: 'dino',
            id: Date.now(),
            icon: '🦖'
        });
        
        if (this.onItemCollected) {
            this.onItemCollected(this.items.length);
        }
        
        if (this.items.length >= this.maxItems) {
            this.synthesizeRare();
        }
        
        return this.items.length;
    }

    synthesizeRare() {
        if (this.items.length < this.maxItems) return null;
        
        this.items = [];
        
        const rare = {
            type: 'rare',
            id: Date.now(),
            icon: this.getRandomRareIcon()
        };
        this.rareItems.push(rare);
        
        if (this.onRareCreated) {
            this.onRareCreated(rare);
        }
        
        if (this.rareItems.length >= this.rareToPortal) {
            this.createPortal();
        }
        
        return rare;
    }

    getRandomRareIcon() {
        const icons = ['⭐', '💎', '🌟', '✨', '🔮'];
        return icons[Math.floor(Math.random() * icons.length)];
    }

    createPortal() {
        if (this.rareItems.length < this.rareToPortal) return null;
        
        this.rareItems = [];
        
        const stations = ['land', 'water', 'sky'];
        const existing = this.portalItems.map(p => p.station);
        const available = stations.filter(s => !existing.includes(s));
        
        if (available.length === 0) {
            this.transformToAngel();
            return null;
        }
        
        const station = available[0];
        const portal = {
            type: 'portal',
            station: station,
            id: Date.now(),
            icon: this.getStationIcon(station)
        };
        this.portalItems.push(portal);
        
        if (this.onPortalCreated) {
            this.onPortalCreated(portal);
        }
        
        return portal;
    }

    getStationIcon(station) {
        const icons = {
            land: '🌍',
            water: '🌊',
            sky: '☁️'
        };
        return icons[station] || '🔮';
    }

    transformToAngel() {
        if (this.onAngelTransformation) {
            this.onAngelTransformation();
        }
    }

    canTeleport() {
        return this.portalItems.length >= this.portalToAngel || this.isAngelMode;
    }

    isAngelMode = false;

    getCounts() {
        return {
            items: this.items.length,
            rare: this.rareItems.length,
            portal: this.portalItems.length
        };
    }

    reset() {
        this.items = [];
        this.rareItems = [];
        this.portalItems = [];
        this.isAngelMode = false;
    }
}

export class InventoryUI {
    constructor(inventory) {
        this.inventory = inventory;
        this.panel = document.getElementById('inventory-panel');
        this.grid = document.getElementById('inventory-grid');
        this.closeBtn = document.getElementById('close-inventory');
        
        this.initSlots();
        this.bindEvents();
    }

    initSlots() {
        this.grid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            slot.dataset.index = i;
            this.grid.appendChild(slot);
        }
    }

    bindEvents() {
        this.closeBtn.onclick = () => this.hide();
        
        this.inventory.onItemCollected = (count) => this.updateSlots();
        this.inventory.onRareCreated = (rare) => this.showRareNotification(rare);
        this.inventory.onPortalCreated = (portal) => this.showPortalNotification(portal);
    }

    updateSlots() {
        const slots = this.grid.querySelectorAll('.inv-slot');
        
        this.inventory.items.forEach((item, i) => {
            if (slots[i]) {
                slots[i].textContent = item.icon;
                slots[i].dataset.type = item.type;
            }
        });
        
        this.inventory.rareItems.forEach((item, i) => {
            const idx = 10 + i;
            if (slots[idx]) {
                slots[idx].textContent = item.icon;
                slots[idx].dataset.type = 'rare';
            }
        });
    }

    showRareNotification(rare) {
        const notif = document.createElement('div');
        notif.className = 'notification rare-notif';
        notif.textContent = `${rare.icon} 레어 아이템 획득! 더블클릭하여 동영상 재생`;
        notif.onclick = () => this.playRareVideo(rare);
        document.body.appendChild(notif);
        
        setTimeout(() => notif.remove(), 5000);
    }

    showPortalNotification(portal) {
        const names = { land: '땅', water: '물속', sky: '하늘' };
        const notif = document.createElement('div');
        notif.className = 'notification portal-notif';
        notif.textContent = `${portal.icon} ${names[portal.station]} 포탈 획득!`;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.remove(), 5000);
    }

    playRareVideo(rare) {
        const videoOverlay = document.getElementById('video-placeholder');
        const videoContent = document.getElementById('video-content');
        
        videoContent.innerHTML = `
            <div class="glow-orb"></div>
            <h2>${rare.icon} 레어 아이템 동영상</h2>
            <p>동영상 재생 중...</p>
            <p style="font-size:12px;opacity:0.7">(클릭하여 닫기)</p>
        `;
        
        videoOverlay.classList.remove('hidden');
        videoOverlay.onclick = () => videoOverlay.classList.add('hidden');
    }

    show() {
        this.panel.classList.remove('hidden');
        this.updateSlots();
    }

    hide() {
        this.panel.classList.add('hidden');
    }

    toggle() {
        if (this.panel.classList.contains('hidden')) {
            this.show();
        } else {
            this.hide();
        }
    }
}