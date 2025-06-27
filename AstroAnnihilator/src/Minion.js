import { gameState, scene, camera, renderer } from './game.js';
import { Bullet } from './Bullet.js';
import { HomingBullet } from './HomingBullet.js';
import { gameToThreeCoords, hexToThreeColor } from './threeDUtils.js';

export class Minion {
    constructor(parent) {
        this.parent = parent;
        this.x = parent.x;
        this.y = parent.y;
        this.size = 8;
        this.angle = 0;
        this.orbitRadius = 50;
        this.shootCooldown = 60;
        this.color = '#a78bfa';
        this.minionMesh = null; // Three.js mesh for the minion
    }

    update(index) {
        this.angle += 0.03;
        const orbitAngle = this.angle + (index * (Math.PI * 2 / this.parent.minions.length));
        this.x = this.parent.x + Math.cos(orbitAngle) * this.orbitRadius;
        this.y = this.parent.y + Math.sin(orbitAngle) * this.orbitRadius;

        if (gameState.player && gameState.player.abilityState.name === 'destroyer' && gameState.player.abilityState.active) {
            if (this.shootCooldown <= 0) {
                gameState.playerBullets.push(new HomingBullet(this.x, this.y, 0, -6, this.color, 0.5));
                this.shootCooldown = 60;
            }
        } else if (this.shootCooldown <= 0) {
            gameState.playerBullets.push(new Bullet(this.x, this.y, 0, -6, this.color, 1));
            this.shootCooldown = 75;
        }
        this.shootCooldown--;

        // Update Three.js mesh position
        if (this.minionMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.minionMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.minionMesh.rotation.z = -this.angle; // Rotate around Z-axis
        }
    }

    draw() {
        if (this.minionMesh) scene.remove(this.minionMesh);

        const geometry = new THREE.CircleGeometry(this.size, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: hexToThreeColor(this.color), 
            wireframe: true 
        });
        this.minionMesh = new THREE.Mesh(geometry, material);

        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.minionMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        this.minionMesh.rotation.z = -this.angle; // Initial rotation
        scene.add(this.minionMesh);
    }
}
