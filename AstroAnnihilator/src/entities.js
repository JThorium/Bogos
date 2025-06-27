import { gameFrame, ghostTimer, spectreTimer, setGhostTimer, setMaterialsThisRun, setWaveCredits, scoreMultiplier, currentBoss } from './gameData.js';
import { enemies, enemyBullets, particles, powerups, obstacles, turrets, createExplosion, addScore, isColliding, triggerScreenShake, startMusic, scene, camera, renderer, player } from './game.js';
import { showInGameShopUI as showInGameShop } from './ui.js';
import { ASTEROID_MODEL, QUASAR_MODEL, MAGNETAR_MODEL } from './models.js';
import { sfx } from './audio.js';
import { createWireframeModel, hexToThreeColor, gameToThreeCoords } from './threeDUtils.js';

export class Bullet {
    constructor(x, y, speedX, speedY, color, damage = 1) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = 5;
        this.color = color;
        this.damage = damage;
        this.canSlow = false;
        this.bulletMesh = null; // Three.js mesh for the bullet
    }

    update() {
        let timeMod = 1;
        if (player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x - player.x, this.y - player.y) < 200) { timeMod = 0.2; }
        this.x += this.speedX * timeMod;
        this.y += this.speedY * timeMod;
        if (gameFrame % 3 === 0) particles.push(new Particle(this.x, this.y, 0, this.speedY * 0.2, this.color, 2, 8));

        // Update Three.js mesh position
        if (this.bulletMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.bulletMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        }
    }

    draw() {
        // Remove previous mesh
        if (this.bulletMesh) scene.remove(this.bulletMesh);

        // Create and add new mesh
        const geometry = new THREE.SphereGeometry(this.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: hexToThreeColor(this.color) });
        this.bulletMesh = new THREE.Mesh(geometry, material);

        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.bulletMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.bulletMesh);
    }
}

export class HomingBullet extends Bullet {
    constructor(x, y, speedX, speedY, color, damage, range = 400) {
        super(x, y, speedX, speedY, color, damage);
        this.turnSpeed = 0.05;
        this.target = null;
        this.range = range;
    }

    update() {
        if (!this.target || enemies.indexOf(this.target) === -1) this.findTarget();
        if (this.target) {
            const targetPos = gameToThreeCoords(this.target.x, this.target.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            const currentPos = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);

            const targetAngle = Math.atan2(targetPos.y - currentPos.y, targetPos.x - currentPos.x);
            const currentAngle = Math.atan2(this.speedY, this.speedX);
            let angleDiff = targetAngle - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(this.turnSpeed, Math.abs(angleDiff));
            const speed = Math.hypot(this.speedX, this.speedY) + 0.1;
            this.speedX = Math.cos(newAngle) * speed;
            this.speedY = Math.sin(newAngle) * speed;
        }
        super.update();
    }

    findTarget() {
        let closestDist = Infinity;
        this.target = null;
        for (const enemy of enemies) {
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < closestDist && dist < this.range) {
                closestDist = dist;
                this.target = enemy;
            }
        }
    }
}

export class Star {
    constructor() {
        this.x = Math.random() * window.screenWidth;
        this.y = Math.random() * window.screenHeight;
        this.size = Math.random() * 2 + 1;
        this.speed = this.size * 0.5;
        this.starMesh = null;
    }

    update() {
        let timeMod = 1;
        if (player && player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x - player.x, this.y - player.y) < 200) { timeMod = 0.2; }
        this.y += this.speed * timeMod;
        if (this.y > window.screenHeight) {
            this.y = -this.size;
            this.x = Math.random() * window.screenWidth;
        }
        if (this.starMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.starMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        }
    }

    draw() {
        if (this.starMesh) scene.remove(this.starMesh);
        const geometry = new THREE.SphereGeometry(this.size, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: this.size / 3 });
        this.starMesh = new THREE.Mesh(geometry, material);
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.starMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.starMesh);
    }
}

export class Particle {
    constructor(x, y, speedX, speedY, color, size, lifespan) {
        this.x = x;
        this.y = y;
        this.speedX = speedX + (Math.random() - 0.5) * 2;
        this.speedY = speedY + (Math.random() - 0.5) * 2;
        this.color = color;
        this.size = size;
        this.lifespan = lifespan;
        this.maxLifespan = lifespan;
        this.particleMesh = null;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifespan--;
        this.size *= 0.95;
        if (this.particleMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.particleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.particleMesh.scale.setScalar(this.size);
            this.particleMesh.material.opacity = this.lifespan / this.maxLifespan;
        }
    }

    draw() {
        if (this.particleMesh) scene.remove(this.particleMesh);
        const geometry = new THREE.SphereGeometry(this.size, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: hexToThreeColor(this.color), transparent: true, opacity: this.lifespan / this.maxLifespan });
        this.particleMesh = new THREE.Mesh(geometry, material);
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.particleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.particleMesh);
    }
}

export class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.speedY = 2;
        const types = ['shield', 'minion', 'ghost', 'bomb'];
        this.type = types[Math.floor(Math.random() * types.length)];
        this.color = { shield: '#60a5fa', minion: '#a78bfa', ghost: '#e5e7eb', bomb: '#ffffff'}[this.type];
        this.powerupMesh = null;
    }

    update() {
        this.y += this.speedY;
        if (this.powerupMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.powerupMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        }
    }

    draw() {
        if (this.powerupMesh) scene.remove(this.powerupMesh);
        const geometry = new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2);
        const material = new THREE.MeshBasicMaterial({ color: hexToThreeColor(this.color) });
        this.powerupMesh = new THREE.Mesh(geometry, material);
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.powerupMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.powerupMesh);
    }
}

export class RawMaterialPickup extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'material';
        this.color = '#94a3b8';
    }

    draw() {
        if (this.powerupMesh) scene.remove(this.powerupMesh);
        const geometry = new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2);
        const material = new THREE.MeshBasicMaterial({ color: hexToThreeColor(this.color) });
        this.powerupMesh = new THREE.Mesh(geometry, material);
        this.powerupMesh.rotation.set(Math.PI / 4, Math.PI / 4, 0);
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.powerupMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.powerupMesh);
    }
}

export class Obstacle {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * window.screenWidth;
        this.y = -50;
        this.speedY = Math.random() * 1 + 0.5;
        this.size = Math.random() * 20 + 15;
        this.angleX = Math.random() * Math.PI * 2;
        this.angleY = Math.random() * Math.PI * 2;
        this.angleZ = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.obstacleMesh = null;
        if (type === 'asteroid') {
            this.health = this.size / 10;
            this.color = '#a1a1aa';
            this.model = ASTEROID_MODEL;
        } else if (type === 'blackhole') {
            this.color = '#000';
            this.size = Math.random() * 30 + 40;
            this.gravityWell = this.size * 4;
            this.lifespan = 600;
            this.y = Math.random() * window.screenHeight * 0.6;
            sfx.blackhole.triggerAttack();
        }
    }

    update() {
        this.angleY += this.rotationSpeed;
        if (this.type === 'asteroid') {
            this.y += this.speedY;
        } else if (this.type === 'blackhole') {
            if (player) {
                const dx = this.x - player.x;
                const dy = this.y - player.y;
                const dist = Math.hypot(dx, dy);
                if (dist < this.gravityWell) {
                    const pull = (1 - dist / this.gravityWell) * 0.2;
                    player.x += dx / dist * pull;
                    player.y += dy / dist * pull;
                    if (dist < this.size) player.hit();
                }
            }
            this.lifespan--;
            if (this.lifespan <= 0) sfx.blackhole.triggerRelease();
        }
        if (this.obstacleMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.obstacleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.obstacleMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        }
    }

    draw() {
        if (this.obstacleMesh) scene.remove(this.obstacleMesh);
        if (this.type === 'asteroid') {
            this.obstacleMesh = createWireframeModel(this.model, hexToThreeColor(this.color), this.size / 10);
        } else if (this.type === 'blackhole') {
            const geometry = new THREE.SphereGeometry(this.size, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
            this.obstacleMesh = new THREE.Mesh(geometry, material);
            const ringGeometry = new THREE.RingGeometry(this.size * 1.2, this.size * 1.3, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xcc32ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 + Math.sin(gameFrame * 0.1) * 0.2 });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.x = Math.PI / 2;
            this.obstacleMesh.add(ringMesh);
        }
        if (this.obstacleMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.obstacleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            scene.add(this.obstacleMesh);
        }
    }
    takeDamage(amount) {
        if (this.type !== 'asteroid') return false;
        this.health -= amount;
        return this.health <= 0;
    }
}

export class Quasar extends Obstacle {
    constructor() {
        super('quasar');
        this.size = Math.random() * 20 + 30;
        this.color = '#facc15';
        this.model = QUASAR_MODEL;
        this.pulseRadius = this.size * 2;
        this.pulseDamage = 0.1;
        this.pulseCooldown = 120;
        this.currentPulseCooldown = Math.random() * 120;
        this.y = Math.random() * window.screenHeight * 0.6;
        this.speedY = 0; // Quasars don't move vertically
    }

    update() {
        this.angleY += 0.01;
        this.currentPulseCooldown--;
        if (this.currentPulseCooldown <= 0) {
            this.pulse();
            this.currentPulseCooldown = this.pulseCooldown;
        }
        // Quasars don't move, but we keep them on screen
        if (this.y > window.screenHeight + this.size) this.y = -this.size;
        if (this.obstacleMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.obstacleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.obstacleMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        }
    }

    draw() {
        if (this.obstacleMesh) scene.remove(this.obstacleMesh);
        this.obstacleMesh = createWireframeModel(this.model, hexToThreeColor(this.color), this.size / 10);
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.obstacleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.obstacleMesh);

        // Draw pulse effect (simplified for 3D)
        const pulseGeometry = new THREE.SphereGeometry(this.pulseRadius * (1 - this.currentPulseCooldown / this.pulseCooldown), 32, 32);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: hexToThreeColor(this.color),
            transparent: true,
            opacity: 0.5 * (this.currentPulseCooldown / this.pulseCooldown),
            wireframe: true
        });
        const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulseMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(pulseMesh);
    }

    pulse() {
        if (player && Math.hypot(this.x - player.x, this.y - player.y) < this.pulseRadius) {
            player.health -= this.pulseDamage;
            triggerScreenShake(5, 10);
            sfx.playerHit.triggerAttackRelease("A2", "8n");
        }
    }

    takeDamage(amount) { return false; } // Invincible
}

export class Nebula {
    constructor() {
        this.layers = [];
        this.x = Math.random() * window.screenWidth;
        this.y = Math.random() * window.screenHeight;
        this.size = Math.random() * 200 + 100;
        this.nebulaMeshes = [];

        const layerCount = Math.floor(Math.random() * 3) + 2; // 2-4 layers
        const colors = [
            `#FF6464`, // Red (Hydrogen)
            `#6464FF`, // Blue (Oxygen)
            `#64FF64`  // Green (Sulphur)
        ];

        for (let i = 0; i < layerCount; i++) {
            this.layers.push({
                x: (Math.random() - 0.5) * this.size,
                y: (Math.random() - 0.5) * this.size,
                radius: Math.random() * (this.size / 2) + (this.size / 4),
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001
            });
        }
    }

    update() {
        this.layers.forEach(layer => {
            layer.rotation += layer.rotationSpeed;
        });
        // Update mesh positions/rotations if needed
        this.nebulaMeshes.forEach((mesh, i) => {
            const layer = this.layers[i];
            const threeCoords = gameToThreeCoords(this.x + layer.x, this.y + layer.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            mesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            mesh.rotation.z = layer.rotation;
        });
    }

    draw() {
        this.nebulaMeshes.forEach(mesh => scene.remove(mesh));
        this.nebulaMeshes = [];

        this.layers.forEach(layer => {
            const geometry = new THREE.EllipseCurve(
                0,  0,            // xCenter, yCenter
                layer.radius, layer.radius / 2, // xRadius, yRadius
                0,  2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                layer.rotation    // aRotation
            );
            const points = geometry.getPoints(50);
            const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: hexToThreeColor(layer.color), transparent: true, opacity: 0.02 });
            const ellipse = new THREE.Line(ellipseGeometry, material);

            const threeCoords = gameToThreeCoords(this.x + layer.x, this.y + layer.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            ellipse.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            scene.add(ellipse);
            this.nebulaMeshes.push(ellipse);
        });
    }
}

export class Magnetar extends Obstacle {
    constructor() {
        super('magnetar');
        this.size = Math.random() * 20 + 35;
        this.color = '#ef4444';
        this.model = MAGNETAR_MODEL;
        this.gravityField = this.size * 3;
        this.coreDamage = 0.5;
        this.y = Math.random() * window.screenHeight * 0.6;
        this.speedY = 0; // Magnetars don't move vertically
    }

    update() {
        this.angleX += 0.01;
        this.angleY += 0.005;

        if (player) {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const dist = Math.hypot(dx, dy);

            if (dist < this.gravityField) {
                const pull = (1 - dist / this.gravityField) * 0.5; // Stronger pull
                player.x += dx / dist * pull;
                player.y += dy / dist * pull;

                if (dist < this.size) {
                    player.health -= this.coreDamage;
                    triggerScreenShake(3, 5);
                    sfx.playerHit.triggerAttackRelease("A2", "8n");
                }
            }
        }

        // Affect player bullets
        playerBullets.forEach(bullet => {
            const dx = this.x - bullet.x;
            const dy = this.y - bullet.y;
            const dist = Math.hypot(dx, dy);
            if (dist < this.gravityField) {
                const pull = (1 - dist / this.gravityField) * 0.1;
                bullet.speedX += dx / dist * pull;
                bullet.speedY += dy / dist * pull;
            }
        });

        // Magnetars don't move, but we keep them on screen
        if (this.y > window.screenHeight + this.size) this.y = -this.size;
        if (this.obstacleMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.obstacleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.obstacleMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        }
    }

    draw() {
        if (this.obstacleMesh) scene.remove(this.obstacleMesh);
        this.obstacleMesh = createWireframeModel(this.model, hexToThreeColor(this.color), this.size / 10);
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.obstacleMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(this.obstacleMesh);

        // Draw gravity field (simplified for 3D)
        const gravityGeometry = new THREE.SphereGeometry(this.gravityField, 32, 32);
        const gravityMaterial = new THREE.MeshBasicMaterial({
            color: hexToThreeColor(this.color),
            transparent: true,
            opacity: 0.1 + Math.sin(gameFrame * 0.05) * 0.05,
            wireframe: true
        });
        const gravityMesh = new THREE.Mesh(gravityGeometry, gravityMaterial);
        gravityMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        scene.add(gravityMesh);
    }

    takeDamage(amount) { return false; } // Invincible
}
