import * as THREE from 'three';
import { LaserProjectile, PlasmaProjectile } from './projectiles.js'; // Import projectile classes

// Dependencies will be injected via setPlayerDependencies
let gameToThreeJS, playerState, projectiles, createParticles, gameOver, updateHud, scene;

export function setPlayerDependencies(dependencies) {
    ({ gameToThreeJS, playerState, projectiles, createParticles, gameOver, updateHud, scene } = dependencies);
}

export class Player {
    constructor() { // Constructor no longer takes dependencies directly
        this.width = 40;
        this.height = 30;
        this.x = 100;
        this.y = window.innerHeight / 2 - this.height / 2;
        this.vx = 0;
        this.vy = 0;
        this.maxSpeed = 5;
        this.friction = 0.9;
        this.gravity = 0.8;
        this.jumpStrength = -18;
        this.isOnGround = false;
        this.jumps = 0;
        this.maxJumps = 2;
        this.jumpInputReleased = true;
        this.facingDirection = 1;

        this.shootCooldown = 0;

        const fireRateLevel = playerState.upgrades.rapidFireModule || 0;
        this.fireRate = 15 - fireRateLevel;

        this.maxHealth = 100 + (playerState.upgrades.exoskeletonPlating || 0) * 10;
        this.health = this.maxHealth;
        this.maxShield = (playerState.upgrades.shieldEmitter || 0) * 5;
        this.shield = this.maxShield;
        this.shieldRegenRate = (playerState.upgrades.shieldEmitter || 0) * 0.05;
        this.healthRegenRate = (playerState.upgrades.exoskeletonPlating || 0) * 0.01;

        this.warpUnlocked = (playerState.upgrades.emergencyWarp || 0) > 0;
        this.warpCooldown = 0;
        const warpLevel = playerState.upgrades.emergencyWarp || 0;
        this.warpMaxCooldown = (10 - warpLevel * 1.5) * 60;
        this.isWarping = false;

        this.availableWeapons = ['laser'];
        this.currentWeapon = 'laser';

        // Three.js mesh for player
        const bodyGeometry = new THREE.BoxGeometry(this.width, this.height - 10, 20);
        const headGeometry = new THREE.SphereGeometry(this.width / 2 - 5, 16, 16);

        const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x9333ea }); // Use Phong material for lighting
        this.bodyMesh = new THREE.Mesh(bodyGeometry, playerMaterial);
        this.headMesh = new THREE.Mesh(headGeometry, playerMaterial);
        this.headMesh.position.y = (this.height - 10) / 2 + 5; // Position head above body, adjusted for better visual
        this.bodyMesh.position.y = -5; // Adjust body position relative to group center

        // Create a more articulated player model
        const armGeometry = new THREE.BoxGeometry(5, 15, 5);
        const legGeometry = new THREE.BoxGeometry(5, 15, 5);

        this.leftArm = new THREE.Mesh(armGeometry, playerMaterial);
        this.rightArm = new THREE.Mesh(armGeometry, playerMaterial);
        this.leftLeg = new THREE.Mesh(legGeometry, playerMaterial);
        this.rightLeg = new THREE.Mesh(legGeometry, playerMaterial);

        this.leftArm.position.set(-this.width / 2 + 2.5, 0, 0);
        this.rightArm.position.set(this.width / 2 - 2.5, 0, 0);
        this.leftLeg.position.set(-this.width / 4, -this.height / 2, 0);
        this.rightLeg.position.set(this.width / 4, -this.height / 2, 0);

        // Add a visual indicator for facing direction (e.g., a small cone or box)
        const pointerGeometry = new THREE.ConeGeometry(5, 10, 8);
        const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow pointer
        this.facingPointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
        this.facingPointer.position.z = 15; // Slightly in front of the player
        this.facingPointer.position.y = 0; // Centered vertically on the body
        this.facingPointer.rotation.x = Math.PI / 2; // Point forward

        this.mesh = new THREE.Group();
        this.mesh.add(this.bodyMesh);
        this.mesh.add(this.headMesh);
        this.mesh.add(this.leftArm);
        this.mesh.add(this.rightArm);
        this.mesh.add(this.leftLeg);
        this.mesh.add(this.rightLeg);
        this.mesh.add(this.facingPointer); // Add the pointer to the player group
        scene.add(this.mesh); // Use the injected scene

        // Initial position in game coordinates
        this.mesh.position.copy(gameToThreeJS(this.x, this.y, 0)); // Use injected gameToThreeJS
        this.mesh.rotation.order = 'YXZ'; // Set rotation order for proper orientation
    }

    update(keys) {
        // Player bobbing animation
        this.mesh.position.y += Math.sin(Date.now() * 0.005) * 0.1; // Subtle vertical bob

        if (keys['a'] || keys['ArrowLeft']) {
            this.vx -= 1.2;
            this.facingDirection = -1;
        }
        if (keys['d'] || keys['ArrowRight']) {
            this.vx += 1.2;
            this.facingDirection = 1;
        }

        // Update facing pointer rotation
        this.facingPointer.rotation.y = this.facingDirection === 1 ? 0 : Math.PI; // Rotate pointer with player
        this.facingPointer.position.x = this.facingDirection === 1 ? this.width / 2 - 5 : -this.width / 2 + 5; // Position pointer correctly

        // Update arm/leg animations based on movement
        const walkCycleSpeed = 0.1;
        if (this.vx !== 0 && this.isOnGround) {
            this.leftLeg.rotation.x = Math.sin(Date.now() * walkCycleSpeed) * 0.5;
            this.rightLeg.rotation.x = Math.sin(Date.now() * walkCycleSpeed + Math.PI) * 0.5;
            this.leftArm.rotation.x = Math.sin(Date.now() * walkCycleSpeed + Math.PI) * 0.5;
            this.rightArm.rotation.x = Math.sin(Date.now() * walkCycleSpeed) * 0.5;
        } else {
            // Reset to idle position
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
        }

        // Adjust laser sight rotation to point horizontally
        if (this.laserSight) {
            this.laserSight.rotation.x = 0; // Reset X rotation
            this.laserSight.rotation.y = this.facingDirection === 1 ? Math.PI / 2 : -Math.PI / 2; // Rotate to point horizontally
            this.laserSight.position.x = gameToThreeJS(this.x + this.width / 2, this.y + this.height / 2, 0).x + (this.facingDirection * 100); // Extend from player
            this.laserSight.position.y = gameToThreeJS(this.x + this.width / 2, this.y + this.height / 2, 0).y;
            this.laserSight.position.z = 0;
        }

        if ((keys['w'] || keys['ArrowUp'])) {
            if (this.jumpInputReleased && this.jumps < this.maxJumps) {
                this.vy = this.jumpStrength;
                this.jumps++;
                this.jumpInputReleased = false;
            }
        } else {
            this.jumpInputReleased = true;
        }

        if (this.warpCooldown > 0) this.warpCooldown--;
        if ((keys['Shift']) && this.warpUnlocked && this.warpCooldown <= 0) {
            this.warp();
        }

        this.vx *= this.friction;
        if (Math.abs(this.vx) > this.maxSpeed) this.vx = Math.sign(this.vx) * this.maxSpeed;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
            this.x = 0;
        }

        this.isOnGround = false;

        if (this.shootCooldown > 0) this.shootCooldown--;
        if (keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
        }

        if (keys['q']) {
            this.switchWeapon();
            keys['q'] = false;
        }

        if (this.y > window.innerHeight + 100) gameOver(); // Fell off the world

        this.regenerateShield();
        this.regenerateHealth();

        // Update Three.js mesh position
        this.mesh.position.copy(gameToThreeJS(this.x, this.y, 0)); // Use injected gameToThreeJS
        this.mesh.rotation.y = this.facingDirection === 1 ? 0 : Math.PI; // Rotate player model

        // Update laser sight position and visibility
        if (this.laserSight) {
            this.laserSight.position.copy(gameToThreeJS(this.x + this.width / 2, this.y + this.height / 2, 0));
            this.laserSight.rotation.y = this.facingDirection === 1 ? 0 : Math.PI;
        }
    }

    // Add a laser sight to the player
    addLaserSight() {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 200, 8); // Thin cylinder for laser
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }); // Red, semi-transparent
        this.laserSight = new THREE.Mesh(geometry, material);
        this.laserSight.rotation.x = Math.PI / 2; // Point along X-axis
        scene.add(this.laserSight); // Use injected scene
    }

    removeLaserSight() {
        if (this.laserSight) {
            scene.remove(this.laserSight); // Use injected scene
            this.laserSight.geometry.dispose();
            this.laserSight.material.dispose();
            this.laserSight = null;
        }
    }

    regenerateShield() {
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate);
        }
    }

    regenerateHealth() {
        if (this.health < this.maxHealth) {
            this.health = Math.min(this.maxHealth, this.health + this.healthRegenRate);
        }
    }

    switchWeapon() {
        const currentIndex = this.availableWeapons.indexOf(this.currentWeapon);
        const nextIndex = (currentIndex + 1) % this.availableWeapons.length;
        this.currentWeapon = this.availableWeapons[nextIndex];
        this.shootCooldown = this.fireRate;
        this.updateHud();
    }

    shoot() {
        const projectileY = this.y + this.height / 2 - 2.5;
        const projectileX = this.facingDirection > 0 ? this.x + this.width : this.x;

        if (this.currentWeapon === 'laser') {
            projectiles.push(new LaserProjectile(projectileX, projectileY, this.facingDirection)); // Use injected projectiles
        } else if (this.currentWeapon === 'plasma') {
            projectiles.push(new PlasmaProjectile(projectileX, projectileY, this.facingDirection)); // Use injected projectiles
        }
        this.shootCooldown = this.fireRate;
    }

    warp() {
        const warpDirection = this.facingDirection;
        this.vx = 25 * warpDirection;
        this.vy = -2;
        this.warpCooldown = this.warpMaxCooldown;
        this.isWarping = true;
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#f0abfc', 30, 8, 40, 5); // Use injected createParticles
        setTimeout(() => this.isWarping = false, 200);
    }

    hit(damage) {
        if (this.isWarping) {
            return;
        }

        if (this.shield > 0) {
            this.shield -= damage;
            if (this.shield < 0) {
                this.health += this.shield;
                this.shield = 0;
            }
        } else {
            this.health -= damage;
        }

        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#facc15', 15, 6, 25, 4); // Use injected createParticles

        if (this.health <= 0) {
            this.health = 0;
            gameOver(); // Use injected gameOver
        }
    }
}
