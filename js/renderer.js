import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.setupLighting();
        this.setupFog();
        
        window.addEventListener('resize', () => this.onResize());
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        this.scene.add(sun);
        this.sunLight = sun;

        const fill = new THREE.DirectionalLight(0x8888ff, 0.3);
        fill.position.set(-30, 20, -30);
        this.scene.add(fill);
    }

    setupFog() {
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 150);
    }

    setStationAmbient(station) {
        const configs = {
            land: { fog: 0x87CEEB, ambient: 0x404060, sun: 0xffffff },
            water: { fog: 0x006994, ambient: 0x203040, sun: 0x446688 },
            sky: { fog: 0x87CEEB, ambient: 0x606080, sun: 0xfffacd }
        };
        const cfg = configs[station] || configs.land;
        this.scene.fog = new THREE.Fog(cfg.fog, 30, 200);
        this.scene.children.forEach(child => {
            if (child.isAmbientLight) child.color.setHex(cfg.ambient);
            if (child.isDirectionalLight && child === this.sunLight) child.color.setHex(cfg.sun);
        });
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}

export class Player3D {
    constructor(scene) {
        this.group = new THREE.Group();
        this.group.name = 'Player';
        
        this.createBody();
        this.createWings();
        this.createHalo();
        
        this.isAngel = false;
        this.group.position.set(0, 1, 0);
        scene.add(this.group);
    }

    createBody() {
        const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x4488ff,
            roughness: 0.7,
            metalness: 0.1
        });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 1.2;
        this.body.castShadow = true;
        this.group.add(this.body);

        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0xffcc99,
            roughness: 0.8
        });
        this.head = new THREE.Mesh(headGeo, headMat);
        this.head.position.y = 2.1;
        this.head.castShadow = true;
        this.group.add(this.head);

        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.1, 2.15, 0.25);
        this.group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.1, 2.15, 0.25);
        this.group.add(rightEye);

        const armGeo = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.7 });
        
        this.leftArm = new THREE.Mesh(armGeo, armMat);
        this.leftArm.position.set(-0.6, 1.4, 0);
        this.leftArm.castShadow = true;
        this.group.add(this.leftArm);
        
        this.rightArm = new THREE.Mesh(armGeo, armMat);
        this.rightArm.position.set(0.6, 1.4, 0);
        this.rightArm.castShadow = true;
        this.group.add(this.rightArm);

        const legGeo = new THREE.CapsuleGeometry(0.12, 0.7, 4, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.7 });
        
        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.2, 0.4, 0);
        this.leftLeg.castShadow = true;
        this.group.add(this.leftLeg);
        
        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.2, 0.4, 0);
        this.rightLeg.castShadow = true;
        this.group.add(this.rightLeg);
    }

    createWings() {
        const wingGeo = new THREE.PlaneGeometry(2, 1);
        const wingMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        
        this.leftWing = new THREE.Mesh(wingGeo, wingMat);
        this.leftWing.position.set(-1, 2.2, 0);
        this.leftWing.rotation.y = Math.PI / 2;
        this.leftWing.visible = false;
        this.group.add(this.leftWing);

        this.rightWing = new THREE.Mesh(wingGeo, wingMat);
        this.rightWing.position.set(1, 2.2, 0);
        this.rightWing.rotation.y = -Math.PI / 2;
        this.rightWing.visible = false;
        this.group.add(this.rightWing);
    }

    createHalo() {
        const haloGeo = new THREE.TorusGeometry(0.4, 0.05, 8, 32);
        const haloMat = new THREE.MeshBasicMaterial({ 
            color: 0xffd700,
            transparent: true,
            opacity: 0.8
        });
        this.halo = new THREE.Mesh(haloGeo, haloMat);
        this.halo.position.y = 2.6;
        this.halo.rotation.x = Math.PI / 2;
        this.halo.visible = false;
        this.group.add(this.halo);
    }

    transformToAngel() {
        this.isAngel = true;
        this.leftWing.visible = true;
        this.rightWing.visible = true;
        this.halo.visible = true;
        
        this.body.material.emissive = new THREE.Color(0x444400);
        this.body.material.emissiveIntensity = 0.3;
    }

    update(deltaTime) {
        if (this.isAngel) {
            const time = Date.now() * 0.002;
            this.leftWing.rotation.z = Math.sin(time) * 0.3;
            this.rightWing.rotation.z = -Math.sin(time) * 0.3;
            this.halo.position.y = 2.6 + Math.sin(time * 2) * 0.05;
        }
    }

    getPosition() {
        return this.group.position;
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }
}

export class Dino3D {
    constructor(scene, type, position) {
        this.group = new THREE.Group();
        this.type = type;
        this.group.position.copy(position);
        
        const colors = {
            velociraptor: 0x228B22,
            stegasaurus: 0x4A4A4A,
            pachycephalasaurus: 0x8B4513
        };
        
        this.createDinoModel(colors[type] || 0x888888);
        scene.add(this.group);
        
        this.velocity = new THREE.Vector3();
        this.wanderTimer = 0;
        this.wanderDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    }

    createDinoModel(color) {
        const bodyGeo = new THREE.CapsuleGeometry(0.8, 2, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 1.5;
        body.castShadow = true;
        this.group.add(body);

        const headGeo = new THREE.BoxGeometry(1.2, 0.8, 0.8);
        const head = new THREE.Mesh(headGeo, bodyMat.clone());
        head.position.set(1.5, 1.8, 0);
        head.castShadow = true;
        this.group.add(head);

        const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(1.8, 2.0, 0.4);
        this.group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(1.8, 2.0, -0.4);
        this.group.add(rightEye);

        const tailGeo = new THREE.ConeGeometry(0.4, 3, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat.clone());
        tail.rotation.z = -Math.PI / 2;
        tail.position.set(-2, 1.5, 0);
        tail.castShadow = true;
        this.group.add(tail);

        const legGeo = new THREE.CapsuleGeometry(0.15, 0.8, 4, 8);
        
        const positions = [
            [0.5, 0.5, 0.4], [0.5, 0.5, -0.4],
            [-0.8, 0.5, 0.4], [-0.8, 0.5, -0.4]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, bodyMat.clone());
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
    }

    update(deltaTime) {
        this.wanderTimer += deltaTime;
        
        if (this.wanderTimer > 3) {
            this.wanderTimer = 0;
            this.wanderDirection = new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }

        this.group.rotation.y += Math.sin(Date.now() * 0.001) * 0.01;
    }

    getPosition() {
        return this.group.position;
    }

    getDistanceTo(position) {
        return this.group.position.distanceTo(position);
    }

    faceTarget(targetPos) {
        const direction = new THREE.Vector3().subVectors(targetPos, this.group.position);
        direction.y = 0;
        if (direction.length() > 0.01) {
            const angle = Math.atan2(direction.x, direction.z);
            this.group.rotation.y = angle;
        }
    }
}

export class Ground3D {
    constructor(scene, station) {
        const configs = {
            land: { color: 0x3A5F0B, size: 200 },
            water: { color: 0x006994, size: 200 },
            sky: { color: 0x87CEEB, size: 200 }
        };
        
        const cfg = configs[station] || configs.land;
        
        const groundGeo = new THREE.PlaneGeometry(cfg.size, cfg.size);
        const groundMat = new THREE.MeshStandardMaterial({ 
            color: cfg.color,
            roughness: 1.0
        });
        
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        scene.add(this.ground);

        this.createEnvironment(scene, station);
    }

    createEnvironment(scene, station) {
        if (station === 'land' || station === 'sky') {
            this.createTrees(scene);
        }
        
        if (station === 'water') {
            this.createSeaweed(scene);
        }
        
        if (station === 'sky') {
            this.createClouds(scene);
        }
    }

    createTrees(scene) {
        const treeCount = 30;
        
        for (let i = 0; i < treeCount; i++) {
            const tree = new THREE.Group();
            
            const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3728 });
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 2;
            trunk.castShadow = true;
            tree.add(trunk);

            const leavesGeo = new THREE.ConeGeometry(2, 4, 8);
            const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = 5;
            leaves.castShadow = true;
            tree.add(leaves);

            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            tree.position.set(x, 0, z);
            
            tree.scale.setScalar(0.8 + Math.random() * 0.6);
            scene.add(tree);
        }
    }

    createSeaweed(scene) {
        for (let i = 0; i < 20; i++) {
            const seaweed = new THREE.Group();
            
            for (let j = 0; j < 5; j++) {
                const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 6);
                const stemMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
                const stem = new THREE.Mesh(stemGeo, stemMat);
                stem.position.y = j * 1.2;
                stem.rotation.x = Math.random() * 0.3;
                stem.rotation.z = Math.random() * 0.3;
                seaweed.add(stem);
            }

            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            seaweed.position.set(x, 0, z);
            scene.add(seaweed);
        }
    }

    createClouds(scene) {
        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Group();
            
            for (let j = 0; j < 4; j++) {
                const puffGeo = new THREE.SphereGeometry(1.5, 8, 8);
                const puffMat = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9
                });
                const puff = new THREE.Mesh(puffGeo, puffMat);
                puff.position.set(j * 1.5 - 2, Math.random(), 0);
                puff.scale.y = 0.6;
                cloud.add(puff);
            }

            cloud.position.set(
                (Math.random() - 0.5) * 150,
                20 + Math.random() * 20,
                (Math.random() - 0.5) * 150
            );
            scene.add(cloud);
        }
    }
}

export class Portal3D {
    constructor(scene, station, position) {
        this.group = new THREE.Group();
        this.station = station;
        this.group.position.copy(position);
        
        const colors = {
            land: 0x8B4513,
            water: 0x006994,
            sky: 0x87CEEB
        };

        const portalGeo = new THREE.TorusGeometry(2, 0.3, 16, 32);
        const portalMat = new THREE.MeshStandardMaterial({ 
            color: colors[station] || 0x888888,
            emissive: colors[station] || 0x444444,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        this.portal = new THREE.Mesh(portalGeo, portalMat);
        this.portal.rotation.y = Math.PI / 2;
        this.group.add(this.portal);

        const innerGeo = new THREE.CircleGeometry(1.8, 32);
        const innerMat = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        this.inner = new THREE.Mesh(innerGeo, innerMat);
        this.inner.rotation.y = Math.PI / 2;
        this.group.add(this.inner);

        scene.add(this.group);
    }

    update(time) {
        this.portal.rotation.z = time * 0.5;
    }

    getPosition() {
        return this.group.position;
    }

    isPlayerNear(playerPos, threshold = 4) {
        return this.group.position.distanceTo(playerPos) < threshold;
    }
}

export class Item3D {
    constructor(scene, position, type) {
        this.group = new THREE.Group();
        this.type = type;
        this.group.position.copy(position);
        
        const colors = {
            dino: 0xFFD700,
            rare: 0x9400D3,
            portal: 0x00CED1
        };

        const geo = type === 'portal' ? 
            new THREE.TorusGeometry(0.3, 0.1, 8, 16) :
            new THREE.OctahedronGeometry(0.3, 0);
        
        const mat = new THREE.MeshStandardMaterial({ 
            color: colors[type] || 0x888888,
            emissive: colors[type] || 0x444444,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.castShadow = true;
        this.group.add(this.mesh);

        scene.add(this.group);
        this.bobTime = Math.random() * Math.PI * 2;
    }

    update(deltaTime) {
        this.bobTime += deltaTime * 2;
        this.mesh.position.y = Math.sin(this.bobTime) * 0.2;
        this.mesh.rotation.y += deltaTime;
    }

    getPosition() {
        return this.group.position;
    }

    isPlayerNear(playerPos, threshold = 2) {
        return this.group.position.distanceTo(playerPos) < threshold;
    }
}