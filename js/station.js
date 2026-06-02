import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class StationManager {
    constructor() {
        this.currentStation = 'land';
        this.stations = ['land', 'water', 'sky'];
        this.transitionDuration = 2000;
        this.isTransitioning = false;
        this.onStationChange = null;
    }

    async changeStation(station, player, scene, ground) {
        if (this.isTransitioning || station === this.currentStation) return;
        
        this.isTransitioning = true;
        
        const transitionEl = document.getElementById('station-transition');
        const nameEl = document.getElementById('transition-name');
        const names = { land: '땅 스테이션', water: '물속 스테이션', sky: '하늘 스테이션' };
        
        nameEl.textContent = names[station];
        transitionEl.classList.remove('hidden');
        
        await this.fadeOut();
        
        this.currentStation = station;
        
        if (this.onStationChange) {
            this.onStationChange(station);
        }
        
        this.reloadScene(station, scene, ground, player);
        
        await this.fadeIn();
        
        transitionEl.classList.add('hidden');
        this.isTransitioning = false;
    }

    async fadeOut() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    async fadeIn() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    reloadScene(station, scene, ground, player) {
        scene.children.forEach(child => {
            if (child.type === 'Group' || child.type === 'Mesh') {
                if (!child.isCamera) {
                    scene.remove(child);
                }
            }
        });

        const configs = {
            land: { groundColor: 0x3A5F0B, fogColor: 0x87CEEB },
            water: { groundColor: 0x006994, fogColor: 0x001e36 },
            sky: { groundColor: 0x87CEEB, fogColor: 0x87CEEB }
        };
        
        const cfg = configs[station] || configs.land;
        
        const newGround = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.MeshStandardMaterial({ color: cfg.groundColor })
        );
        newGround.rotation.x = -Math.PI / 2;
        scene.add(newGround);

        scene.fog = new THREE.Fog(cfg.fogColor, 30, 200);

        if (player) {
            player.setPosition(0, station === 'water' ? 3 : 1, 0);
        }
    }

    getCurrentStation() {
        return this.currentStation;
    }

    canAccessStation(station) {
        return true;
    }
}