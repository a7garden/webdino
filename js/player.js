import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PlayerController {
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
        this.isFlying = false;
        this.isSprinting = false;
        
        this.eulerX = 0;
        this.eulerY = 0;
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            flyUp: false,
            flyDown: false
        };
        
        this.setupInput();
        this.lockPointer();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', () => this.requestPointerLock());
        
        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement) {
                console.log('Pointer unlocked');
            }
        });
    }

    lockPointer() {
        document.body.requestPointerLock();
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
            case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
            case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
            case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
            case 'Space': 
                if (this.player.isAngel) this.keys.flyUp = true;
                else this.keys.jump = true;
                break;
            case 'ShiftLeft': this.keys.sprint = true; break;
            case 'ControlLeft':
                if (this.player.isAngel) this.keys.flyDown = true;
                break;
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
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();
        
        this.velocity.x = (forward.x * this.direction.z + right.x * this.direction.x) * speed;
        this.velocity.z = (forward.z * this.direction.z + right.z * this.direction.x) * speed;
        
        if (this.player.isAngel) {
            this.isFlying = true;
            this.velocity.y = 0;
            
            if (this.keys.flyUp) this.velocity.y = this.jumpSpeed;
            if (this.keys.flyDown) this.velocity.y = -this.jumpSpeed;
        } else {
            if (this.keys.jump && this.isGrounded) {
                this.velocity.y = this.jumpSpeed;
                this.isGrounded = false;
            }
            
            if (!this.isGrounded) {
                this.velocity.y -= this.gravity * deltaTime;
            }
            
            const groundLevel = 1;
            const playerPos = this.player.getPosition();
            if (playerPos.y <= groundLevel) {
                playerPos.y = groundLevel;
                this.velocity.y = 0;
                this.isGrounded = true;
            }
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

    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        return forward.normalize();
    }
}