import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PortalSystem {
    constructor(scene) {
        this.scene = scene;
        this.portals = [];
        this.createPortals();
    }

    createPortals() {
        const portalData = [
            { station: 'land', position: { x: 0, y: 0, z: -40 }, color: 0x8B4513 },
            { station: 'water', position: { x: 40, y: 0, z: 0 }, color: 0x006994 },
            { station: 'sky', position: { x: -40, y: 0, z: 0 }, color: 0x87CEEB }
        ];

        portalData.forEach(p => {
            const portal = new THREE.Group();
            portal.position.set(p.position.x, p.position.y + 2, p.position.z);
            
            const torusGeo = new THREE.TorusGeometry(2.5, 0.4, 16, 32);
            const torusMat = new THREE.MeshStandardMaterial({
                color: p.color,
                emissive: p.color,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.9
            });
            const torus = new THREE.Mesh(torusGeo, torusMat);
            torus.rotation.y = Math.PI / 2;
            portal.add(torus);

            const innerGeo = new THREE.CircleGeometry(2.3, 32);
            const innerMat = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            inner.rotation.y = Math.PI / 2;
            portal.add(inner);

            const labelGeo = new THREE.PlaneGeometry(3, 1);
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            const names = { land: '땅 STATION', water: '물속 STATION', sky: '하늘 STATION' };
            ctx.fillText(names[p.station], 128, 40);
            
            const labelTex = new THREE.CanvasTexture(canvas);
            const labelMat = new THREE.MeshBasicMaterial({ 
                map: labelTex,
                transparent: true
            });
            const label = new THREE.Mesh(labelGeo, labelMat);
            label.position.y = 4;
            label.rotation.y = Math.PI / 2;
            portal.add(label);

            this.scene.add(portal);
            this.portals.push({
                group: portal,
                torus: torus,
                station: p.station,
                position: p.position
            });
        });
    }

    update(time) {
        this.portals.forEach((p, i) => {
            p.torus.rotation.z = time * 0.5 + i * 2;
        });
    }

    checkPortalInteraction(playerPos) {
        for (const portal of this.portals) {
            const dx = portal.position.x - playerPos.x;
            const dz = portal.position.z - playerPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 4) {
                return portal.station;
            }
        }
        return null;
    }

    getPortalPosition(station) {
        const portal = this.portals.find(p => p.station === station);
        return portal ? portal.position : null;
    }
}