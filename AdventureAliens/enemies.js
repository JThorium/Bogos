import * as THREE from 'three';
import { EnemyProjectile } from './projectiles.js'; // Import EnemyProjectile

// Dependencies will be injected via setEnemyDependencies
let gameToThreeJS, scene, player, enemyProjectiles, createParticles, dnaDrops, runState, killedEnemies;

export function setEnemyDependencies(dependencies) {
    ({ gameToThreeJS, scene, player, enemyProjectiles, createParticles, dnaDrops, runState, killedEnemies } = dependencies);
}

export class FlyingEnemy {
    constructor() { // Constructor no longer takes dependencies directly
        this.width = 30;
        this.height = 30;
        this.x = window.innerWidth; // Initial spawn off-screen to the right
        this.y = Math.random() * (window.innerHeight * 0.6 - this.height) + (window.innerHeight * 0.2);
        this.speed = Math.random() * 2 + 1;
        this.health = 1;
        this.dnaValue = 10;
        this.scoreValue = 100;

        const geometry = new THREE.SphereGeometry(this.width / 2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update(cameraX) {
        this.x -= this.speed;
        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class GroundEnemy {
    constructor(platform) { // Constructor no longer takes dependencies directly
        this.width = 40;
        this.height = 40;
        this.x = platform.x + Math.random() * (platform.width - this.width); // Spawn randomly on the given platform
        this.y = platform.y - this.height;
        this.speed = 1.5;
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.health = 2;
        this.dnaValue = 15;
        this.scoreValue = 150;
        this.platform = platform;

        const geometry = new THREE.BoxGeometry(this.width, this.height, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 }); // Violet
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update() {
        this.x += this.speed * this.direction;

        if (this.x <= this.platform.x || this.x + this.width >= this.platform.x + this.platform.width) {
            this.direction *= -1;
            this.x = Math.max(this.platform.x, Math.min(this.x, this.platform.x + this.platform.width - this.width));
        }
        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
        this.mesh.rotation.y = this.direction === 1 ? 0 : Math.PI;
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class SpitterEnemy extends GroundEnemy {
    constructor(platform) { // Constructor no longer takes dependencies directly
        super(platform); // Pass platform to super constructor
        this.health = 3;
        this.dnaValue = 25;
        this.scoreValue = 200;
        this.shootCooldown = 0;
        this.fireRate = 180;
        this.detectionRange = 500;

        this.mesh.material.color.setHex(0xf59e0b); // Amber
    }

    update(cameraX) {
        super.update();

        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        } else {
            const playerScreenX = player.x - cameraX; // Use injected player
            const selfScreenX = this.x - cameraX;
            const distanceToPlayer = Math.abs(player.x - this.x); // Use injected player

            if (distanceToPlayer < this.detectionRange && playerScreenX > 0 && playerScreenX < window.innerWidth && selfScreenX > 0 && selfScreenX < window.innerWidth) {
                this.shoot();
            }
        }
    }

    shoot() {
        enemyProjectiles.push(new EnemyProjectile( // Use injected enemyProjectiles
            this.x + this.width / 2,
            this.y + this.height / 2,
            player.x + player.width / 2, // Use injected player
            player.y + player.height / 2 // Use injected player
        ));
        this.shootCooldown = this.fireRate + Math.random() * 60;
    }
}
