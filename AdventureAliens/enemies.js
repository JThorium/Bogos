import * as THREE from 'three';
import { EnemyProjectile } from './projectiles.js'; // Import EnemyProjectile

export class FlyingEnemy {
    constructor(gameToThreeJS, scene) {
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

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
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update(cameraX) {
        this.x -= this.speed;
        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class GroundEnemy {
    constructor(platform, gameToThreeJS, scene) {
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

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
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update() {
        this.x += this.speed * this.direction;

        if (this.x <= this.platform.x || this.x + this.width >= this.platform.x + this.platform.width) {
            this.direction *= -1;
            this.x = Math.max(this.platform.x, Math.min(this.x, this.platform.x + this.platform.width - this.width));
        }
        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
        this.mesh.rotation.y = this.direction === 1 ? 0 : Math.PI;
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class SpitterEnemy extends GroundEnemy {
    constructor(platform, gameToThreeJS, scene, player, enemyProjectiles) {
        super(platform, gameToThreeJS, scene); // Pass gameToThreeJS and scene to super constructor
        this.player = player;
        this.enemyProjectiles = enemyProjectiles;

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
            const playerScreenX = this.player.x - cameraX;
            const selfScreenX = this.x - cameraX;
            const distanceToPlayer = Math.abs(this.player.x - this.x);

            if (distanceToPlayer < this.detectionRange && playerScreenX > 0 && playerScreenX < window.innerWidth && selfScreenX > 0 && selfScreenX < window.innerWidth) {
                this.shoot();
            }
        }
    }

    shoot() {
        this.enemyProjectiles.push(new EnemyProjectile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            this.gameToThreeJS,
            this.scene
        ));
        this.shootCooldown = this.fireRate + Math.random() * 60;
    }
}
