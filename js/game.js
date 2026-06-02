console.log('[Game] Starting...');

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

class Renderer {
    constructor(canvas) {
        console.log('[Renderer] Initializing...');
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        
        this.setupLighting();
        this.setupFog();
        
        window.addEventListener('resize', () => this.onResize());
        console.log('[Renderer] Done');
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        this.scene.add(sun);
        this.sunLight = sun;
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
    }

    getScene() { return this.scene; }
    getCamera() { return this.camera; }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

class Player3D {
    constructor(scene) {
        console.log('[Player3D] Creating...');
        this.group = new THREE.Group();
        this.group.name = 'Player';
        this.isAngel = false;
        
        this.createBody();
        this.createWings();
        this.createHalo();
        
        this.group.position.set(0, 1, 0);
        scene.add(this.group);
        console.log('[Player3D] Done');
    }

    createBody() {
        const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.7 });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 1.2;
        this.body.castShadow = true;
        this.group.add(this.body);

        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.8 });
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
        this.group.add(this.leftArm);
        this.rightArm = new THREE.Mesh(armGeo, armMat);
        this.rightArm.position.set(0.6, 1.4, 0);
        this.group.add(this.rightArm);

        const legGeo = new THREE.CapsuleGeometry(0.12, 0.7, 4, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.7 });
        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.2, 0.4, 0);
        this.group.add(this.leftLeg);
        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.2, 0.4, 0);
        this.group.add(this.rightLeg);
    }

    createWings() {
        const wingGeo = new THREE.PlaneGeometry(2, 1);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
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
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.8 });
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

    getPosition() { return this.group.position; }
    setPosition(x, y, z) { this.group.position.set(x, y, z); }
}

class Dino3D {
    constructor(scene, type, position) {
        this.group = new THREE.Group();
        this.type = type;
        this.group.position.copy(position);
        
        const colors = { velociraptor: 0x228B22, stegasaurus: 0x4A4A4A, pachycephalasaurus: 0x8B4513 };
        this.createDinoModel(colors[type] || 0x888888);
        scene.add(this.group);
    }

    createDinoModel(color) {
        const bodyGeo = new THREE.CapsuleGeometry(0.8, 2, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
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
        [[0.5, 0.5, 0.4], [0.5, 0.5, -0.4], [-0.8, 0.5, 0.4], [-0.8, 0.5, -0.4]].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, bodyMat.clone());
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
    }

    update(deltaTime) {
        this.group.rotation.y += Math.sin(Date.now() * 0.001) * 0.01;
    }

    getPosition() { return this.group.position; }
}

class Ground3D {
    constructor(scene, station) {
        const configs = { land: { color: 0x3A5F0B, size: 200 }, water: { color: 0x006994, size: 200 }, sky: { color: 0x87CEEB, size: 200 } };
        const cfg = configs[station] || configs.land;
        
        const groundGeo = new THREE.PlaneGeometry(cfg.size, cfg.size);
        const groundMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 1.0 });
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        scene.add(this.ground);

        this.createTrees(scene);
    }

    createTrees(scene) {
        for (let i = 0; i < 30; i++) {
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
}

class PortalSystem {
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
            const torusMat = new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
            const torus = new THREE.Mesh(torusGeo, torusMat);
            torus.rotation.y = Math.PI / 2;
            portal.add(torus);
            const innerGeo = new THREE.CircleGeometry(2.3, 32);
            const innerMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            inner.rotation.y = Math.PI / 2;
            portal.add(inner);
            this.scene.add(portal);
            this.portals.push({ group: portal, torus, station: p.station, position: p.position });
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
            if (Math.sqrt(dx * dx + dz * dz) < 4) return portal.station;
        }
        return null;
    }
}

class PlayerController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        this.moveSpeed = 8;
        this.sprintSpeed = 15;
        this.jumpSpeed = 12;
        this.gravity = 25;
        this.lookSpeed = 0.002;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.isGrounded = true;
        this.eulerX = 0;
        this.eulerY = 0;
        this.keys = { forward: false, backward: false, left: false, right: false, jump: false, sprint: false, flyUp: false, flyDown: false };
        this.setupInput();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', () => document.body.requestPointerLock());
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
            case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
            case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
            case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
            case 'Space': this.player.isAngel ? this.keys.flyUp = true : this.keys.jump = true; break;
            case 'ShiftLeft': this.keys.sprint = true; break;
            case 'ControlLeft': if (this.player.isAngel) this.keys.flyDown = true; break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
            case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
            case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
            case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
            case 'Space': this.keys.flyUp = false; break;
            case 'ShiftLeft': this.keys.sprint = false; break;
            case 'ControlLeft': this.keys.flyDown = false; break;
        }
    }

    onMouseMove(e) {
        if (document.pointerLockElement) {
            this.eulerY -= e.movementX * this.lookSpeed;
            this.eulerX -= e.movementY * this.lookSpeed;
            this.eulerX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.eulerX));
            this.camera.quaternion.setFromEuler(new THREE.Euler(this.eulerX, this.eulerY, 0, 'YXZ'));
        }
    }

    update(deltaTime) {
        const speed = this.keys.sprint ? this.sprintSpeed : this.moveSpeed;
        this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
        this.direction.x = Number(this.keys.right) - Number(this.keys.left);
        this.direction.normalize();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0; forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0; right.normalize();
        this.velocity.x = (forward.x * this.direction.z + right.x * this.direction.x) * speed;
        this.velocity.z = (forward.z * this.direction.z + right.z * this.direction.x) * speed;
        if (this.player.isAngel) {
            this.velocity.y = 0;
            if (this.keys.flyUp) this.velocity.y = this.jumpSpeed;
            if (this.keys.flyDown) this.velocity.y = -this.jumpSpeed;
        } else {
            if (this.keys.jump && this.isGrounded) { this.velocity.y = this.jumpSpeed; this.isGrounded = false; }
            if (!this.isGrounded) this.velocity.y -= this.gravity * deltaTime;
            const playerPos = this.player.getPosition();
            if (playerPos.y <= 1) { playerPos.y = 1; this.velocity.y = 0; this.isGrounded = true; }
        }
        const playerPos = this.player.getPosition();
        playerPos.x += this.velocity.x * deltaTime;
        playerPos.y += this.velocity.y * deltaTime;
        playerPos.z += this.velocity.z * deltaTime;
        playerPos.x = Math.max(-95, Math.min(95, playerPos.x));
        playerPos.z = Math.max(-95, Math.min(95, playerPos.z));
        this.camera.position.copy(playerPos);
        this.camera.position.y += 2;
    }
}

class DinosaurManager {
    constructor() {
        this.dinosaurs = [];
        this.dinoTypes = ['velociraptor', 'stegasaurus', 'pachycephalasaurus'];
        this.spawnDinosaurs();
    }

    spawnDinosaurs() {
        const spawnPoints = [
            { x: 10, y: 0, z: -15 }, { x: -20, y: 0, z: 10 }, { x: 15, y: 0, z: 20 },
            { x: -25, y: 0, z: -20 }, { x: 30, y: 0, z: -5 }, { x: -10, y: 0, z: 30 },
            { x: 5, y: 0, z: -30 }, { x: -30, y: 0, z: 15 }, { x: 25, y: 0, z: 25 }, { x: -15, y: 0, z: -10 }
        ];
        spawnPoints.forEach((pos, i) => {
            const type = this.dinoTypes[i % this.dinoTypes.length];
            this.dinosaurs.push({
                type, name: this.getDinoName(type, i), position: pos,
                quizzes: this.generateQuizzes(), isActive: true
            });
        });
    }

    getDinoName(type, index) {
        const names = { velociraptor: ['래피', '스위프트', '크리프트', '론'], stegasaurus: ['스테고', '플레이트', '소러스', '에코'], pachycephalasaurus: ['패키', '헤드', '본', '스매쉬'] };
        return (names[type] || names.velociraptor)[index % 4];
    }

    generateQuizzes() {
        const allQuizzes = [
            { q: '공룡은 언제地球上出現?', a: ['2억 3천만 년 전', '6천 6백만 년 전', '1천만 년 전', '5억 년 전'], c: 0 },
            { q: '가장 큰 공룡은?', a: ['티라노사우루스', '아르entinasaurus', '브라키오사우루스', '밀로사우루스'], c: 1 },
            { q: '공룡은なんに分類?', a: ['포유류', '파충류', '조류', '양서류'], c: 1 },
            { q: '티라노사우루스의食性は?', a: ['초식', '육식', '잡식', 'scavenging'], c: 1 },
            { q: '공룡의末裔は?', a: ['포유류', '조류', '파충류', '양서류'], c: 1 },
            { q: '三角恐竜の名前は?', a: ['티라노사우루스', '트리케라톱스', '스테고사우루스', '파키세팔로사우루스'], c: 1 },
            { q: '翼を持つ공룡は?', a: ['티라노사우루스', '브라키오사우루스', '프테라노돈', '스테고사우루스'], c: 2 },
            { q: '공룡の全種類は?', a: ['約500種', '約1000種', '約2000種', '約10000種'], c: 1 },
            { q: '最もスマートな공룡は?', a: ['티라노사우루스', '스트로보사우루스', '트리오벡스', '파키세팔로사우루스'], c: 2 },
            { q: '공룡の発見者は?', a: ['ダーウィン', 'マantia', 'アンティニ', 'ダーwin'], c: 2 }
        ];
        return [...allQuizzes].sort(() => Math.random() - 0.5).slice(0, 3);
    }

    getDinosaurs() { return this.dinosaurs; }
    getDinoAtPosition(pos, threshold = 5) {
        return this.dinosaurs.find(d => {
            if (!d.isActive) return false;
            const dx = d.position.x - pos.x, dz = d.position.z - pos.z;
            return Math.sqrt(dx * dx + dz * dz) < threshold;
        });
    }
    markDinoAsCaptured(dinoName) { const d = this.dinosaurs.find(d => d.name === dinoName); if (d) d.isActive = false; }
    resetDinosaurs() { this.dinosaurs.forEach(d => d.isActive = true); }
}

class DinosaurUI {
    constructor() {
        this.dialog = document.getElementById('quiz-dialog');
        this.nameEl = document.getElementById('dino-name');
        this.questionEl = document.getElementById('quiz-question');
        this.answersEl = document.getElementById('quiz-answers');
        this.feedbackEl = document.getElementById('quiz-feedback');
        this.onQuizComplete = null;
    }

    showDialog(dino) {
        this.nameEl.textContent = `🦖 ${dino.name}`;
        this.showQuestion(dino.quizzes[0]);
        this.dialog.classList.remove('hidden');
    }

    showQuestion(quiz) {
        this.questionEl.textContent = quiz.q;
        this.answersEl.innerHTML = '';
        quiz.a.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-answer';
            btn.textContent = `${i + 1}. ${answer}`;
            btn.onclick = () => this.checkAnswer(i, quiz.c);
            this.answersEl.appendChild(btn);
        });
        this.feedbackEl.classList.add('hidden');
    }

    checkAnswer(selected, correct) {
        const isCorrect = selected === correct;
        this.feedbackEl.textContent = isCorrect ? '🎉 정답!' : '❌ 오답';
        this.feedbackEl.classList.remove('hidden');
        this.feedbackEl.style.color = isCorrect ? '#00ff00' : '#ff0000';
        const buttons = this.answersEl.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === correct) btn.style.background = '#00ff00';
            else if (i === selected) btn.style.background = '#ff0000';
        });
        setTimeout(() => {
            this.hideDialog();
            if (this.onQuizComplete) this.onQuizComplete(isCorrect);
        }, 1500);
    }

    hideDialog() { this.dialog.classList.add('hidden'); }
}

class InventorySystem {
    constructor() {
        this.items = []; this.rareItems = []; this.portalItems = [];
        this.maxItems = 10; this.rareToPortal = 5; this.portalToAngel = 3;
        this.onItemCollected = null; this.onRareCreated = null; this.onPortalCreated = null; this.onAngelTransformation = null;
        this.isAngelMode = false;
    }

    addItem() {
        this.items.push({ type: 'dino', id: Date.now(), icon: '🦖' });
        if (this.onItemCollected) this.onItemCollected(this.items.length);
        if (this.items.length >= this.maxItems) this.synthesizeRare();
        return this.items.length;
    }

    synthesizeRare() {
        if (this.items.length < this.maxItems) return null;
        this.items = [];
        const rare = { type: 'rare', id: Date.now(), icon: ['⭐', '💎', '🌟', '✨', '🔮'][Math.floor(Math.random() * 5)] };
        this.rareItems.push(rare);
        if (this.onRareCreated) this.onRareCreated(rare);
        if (this.rareItems.length >= this.rareToPortal) this.createPortal();
        return rare;
    }

    createPortal() {
        if (this.rareItems.length < this.rareToPortal) return null;
        this.rareItems = [];
        const stations = ['land', 'water', 'sky'];
        const existing = this.portalItems.map(p => p.station);
        const available = stations.filter(s => !existing.includes(s));
        if (available.length === 0) { this.transformToAngel(); return null; }
        const station = available[0];
        const portal = { type: 'portal', station, id: Date.now(), icon: { land: '🌍', water: '🌊', sky: '☁️' }[station] };
        this.portalItems.push(portal);
        if (this.onPortalCreated) this.onPortalCreated(portal);
        return portal;
    }

    transformToAngel() { if (this.onAngelTransformation) this.onAngelTransformation(); }
    getCounts() { return { items: this.items.length, rare: this.rareItems.length, portal: this.portalItems.length }; }
    reset() { this.items = []; this.rareItems = []; this.portalItems = []; this.isAngelMode = false; }
}

class UIManager {
    constructor() {
        this.hud = {
            dinoCount: document.getElementById('dino-count'),
            rareCount: document.getElementById('rare-count'),
            portalCount: document.getElementById('portal-count')
        };
        this.interactionPrompt = document.getElementById('interaction-prompt');
        this.startScreen = document.getElementById('start-screen');
        this.winScreen = document.getElementById('win-screen');
        this.portalPanel = document.getElementById('portal-panel');
        this.portalBtns = document.querySelectorAll('.portal-btn');
        this.onStartGame = null; this.onPortalSelect = null; this.onRestart = null;
        this.bindEvents();
    }

    bindEvents() {
        const startBtn = document.getElementById('start-button');
        if (startBtn) startBtn.addEventListener('click', () => { this.hideStartScreen(); if (this.onStartGame) this.onStartGame(); });
        const restartBtn = document.getElementById('restart-button');
        if (restartBtn) restartBtn.addEventListener('click', () => { this.hideWinScreen(); if (this.onRestart) this.onRestart(); });
        this.portalBtns.forEach(btn => btn.addEventListener('click', () => { if (this.onPortalSelect) this.onPortalSelect(btn.dataset.station); }));
        document.getElementById('close-portal')?.addEventListener('click', () => this.hidePortalPanel());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyI') document.getElementById('inventory-panel')?.classList.toggle('hidden');
            if (e.code === 'KeyP') this.togglePortalPanel();
        });
    }

    updateHUD(counts) {
        if (this.hud.dinoCount) this.hud.dinoCount.textContent = `🦖 공룡: ${counts.items}/10`;
        if (this.hud.rareCount) this.hud.rareCount.textContent = `⭐ 레어: ${counts.rare}/5`;
        if (this.hud.portalCount) this.hud.portalCount.textContent = `🔮 포탈: ${counts.portal}/3`;
    }

    showInteractionPrompt(show, text = '[E] 공룡과 대화하기') {
        if (this.interactionPrompt) {
            this.interactionPrompt.classList.toggle('hidden', !show);
            const span = this.interactionPrompt.querySelector('span');
            if (span) span.textContent = text;
        }
    }

    hideStartScreen() { this.startScreen?.classList.add('hidden'); }
    showWinScreen() { this.winScreen?.classList.remove('hidden'); }
    hideWinScreen() { this.winScreen?.classList.add('hidden'); }
    showPortalPanel() { this.portalPanel?.classList.remove('hidden'); }
    hidePortalPanel() { this.portalPanel?.classList.add('hidden'); }
    togglePortalPanel() { this.portalPanel?.classList.toggle('hidden'); }

    showAngelScreen() {
        const angelScreen = document.getElementById('angel-screen');
        if (angelScreen) { angelScreen.classList.remove('hidden'); setTimeout(() => angelScreen.classList.add('hidden'), 3000); }
    }
}

class GameState {
    constructor() { this.state = 'start'; this.isPaused = false; this.isAngelMode = false; this.currentStation = 'land'; }
    setState(newState) { this.state = newState; console.log(`Game state: ${newState}`); }
    setStation(station) { this.currentStation = station; }
    enableAngelMode() { this.isAngelMode = true; this.state = 'angel'; }
    reset() { this.state = 'playing'; this.isPaused = false; this.isAngelMode = false; this.currentStation = 'land'; }
}

class Game {
    constructor() {
        console.log('[Game] Constructor started');
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) { console.error('[Game] Canvas not found!'); return; }
        this.isRunning = false;
        this.lastTime = 0;
        this.init();
    }

    init() {
        console.log('[Game] Init started');
        try {
            this.renderer = new Renderer(this.canvas);
            this.scene = this.renderer.getScene();
            this.camera = this.renderer.getCamera();
            this.gameState = new GameState();
            this.ui = new UIManager();
            this.player = new Player3D(this.scene);
            this.playerController = new PlayerController(this.camera, this.player);
            this.dinoManager = new DinosaurManager();
            this.dinoUI = new DinosaurUI();
            this.inventory = new InventorySystem();
            this.portalSystem = new PortalSystem(this.scene);
            this.stationManager = { currentStation: 'land', onStationChange: null };
            this.createDino3DModels();
            this.createEnvironment();
            this.setupCallbacks();
            this.setupControls();
            this.ui.onStartGame = () => this.start();
            this.ui.onRestart = () => this.restart();
            this.ui.onPortalSelect = (station) => this.teleportToStation(station);
            this.dinoUI.onQuizComplete = (isCorrect) => this.onQuizComplete(isCorrect);
            console.log('[Game] Init complete');
        } catch (e) { console.error('[Game] Init error:', e); }
    }

    createDino3DModels() {
        this.dino3DModels = [];
        this.dinoManager.getDinosaurs().forEach((dino, i) => {
            this.dino3DModels.push(new Dino3D(this.scene, dino.type, new THREE.Vector3(dino.position.x, dino.position.y, dino.position.z)));
        });
    }

    createEnvironment() {
        new Ground3D(this.scene, 'land');
        for (let i = 0; i < 25; i++) {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3, 8), new THREE.MeshStandardMaterial({ color: 0x4A3728 }));
            trunk.position.y = 1.5; tree.add(trunk);
            const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0x228B22 }));
            leaves.position.y = 4; tree.add(leaves);
            const x = (Math.random() - 0.5) * 80, z = (Math.random() - 0.5) * 80;
            if (Math.abs(x) > 5 || Math.abs(z) > 5) { tree.position.set(x, 0, z); tree.scale.setScalar(0.7 + Math.random() * 0.5); this.scene.add(tree); }
        }
    }

    setupCallbacks() {
        this.inventory.onItemCollected = () => this.ui.updateHUD(this.inventory.getCounts());
        this.inventory.onRareCreated = () => this.ui.updateHUD(this.inventory.getCounts());
        this.inventory.onPortalCreated = () => this.ui.updateHUD(this.inventory.getCounts());
        this.inventory.onAngelTransformation = () => this.transformToAngel();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE' && this.gameState.state === 'playing') this.tryInteractWithDino();
            if (e.code === 'Escape') this.dinoUI.hideDialog();
        });
    }

    tryInteractWithDino() {
        const nearbyDino = this.dinoManager.getDinoAtPosition(this.player.getPosition());
        if (nearbyDino) { this.gameState.setState('quiz'); this.dinoUI.showDialog(nearbyDino); }
    }

    onQuizComplete(isCorrect) {
        this.gameState.setState('playing');
        if (isCorrect) { this.inventory.addItem(); this.ui.updateHUD(this.inventory.getCounts()); }
    }

    teleportToStation(station) {
        if (this.inventory.portalItems.length < 3 && !this.inventory.isAngelMode) {
            alert('포탈 아이템이 부족합니다!'); return;
        }
        this.stationManager.currentStation = station;
        this.ui.hidePortalPanel();
    }

    transformToAngel() {
        this.player.transformToAngel();
        this.inventory.isAngelMode = true;
        this.gameState.enableAngelMode();
        this.ui.showAngelScreen();
        setTimeout(() => this.ui.showWinScreen(), 3500);
    }

    start() {
        console.log('[Game] Starting...');
        this.isRunning = true;
        this.gameState.setState('playing');
        this.animate();
    }

    restart() {
        this.inventory.reset();
        this.dinoManager.resetDinosaurs();
        this.gameState.reset();
        this.player.setPosition(0, 1, 0);
        this.dino3DModels.forEach((model, i) => {
            const dino = this.dinoManager.getDinosaurs()[i];
            model.group.position.set(dino.position.x, dino.position.y, dino.position.z);
        });
        this.ui.updateHUD(this.inventory.getCounts());
        this.start();
    }

    update(deltaTime) {
        this.playerController.update(deltaTime);
        this.player.update(deltaTime);
        this.dino3DModels.forEach(dino => dino.update(deltaTime));
        this.portalSystem.update(Date.now() * 0.001);
        const nearbyDino = this.dinoManager.getDinoAtPosition(this.player.getPosition());
        this.ui.showInteractionPrompt(!!nearbyDino);
    }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.renderer.render();
    }
}

console.log('[Game] Loading complete, waiting for DOM...');
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Game] DOM loaded, creating game...');
    window.game = new Game();
    console.log('[Game] Created:', window.game);
});