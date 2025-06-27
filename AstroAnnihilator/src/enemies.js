import { ENEMY_MODELS, BOSS_MODEL_1, BOSS_MODEL_2 } from './models.js';
import { gameFrame, score, waveCount, currentBoss, setWaveCount, setCurrentBoss, isPaused, enemySpawnTable, spawnMultiplier, mouse, upgrades } from './gameData.js';
import { Bullet } from './entities.js';
import { player, enemyBullets, enemies, createExplosion, addScore, startMusic, scene, camera, renderer, obstacles } from './game.js';
import { gameToThreeCoords, hexToThreeColor } from './threeDUtils.js';
import { showInGameShopUI } from './ui.js';

export class Enemy {
    constructor(type = 'grunt', x = Math.random() * window.innerWidth, y = -30) {
        this.type = type;
        this.model = ENEMY_MODELS[type];
        this.x = x;
        this.y = y;
        this.angleX = 0;
        this.angleY = 0;
        this.angleZ = 0;
        this.slowTimer = 0;
        this.phase = 0;
        const difficulty = Math.min(5, 1 + score / 20000);
        this.enemyMesh = null; // Three.js mesh for the enemy

        switch (type) {
            case 'grunt': this.size = 20; this.color = '#f87171'; this.speedY = (Math.random() * 1 + 1) * difficulty; this.speedX = (Math.random() - 0.5) * 4; this.health = 1 * difficulty; this.shootCooldown = Math.random() * 100 + 50; break;
            case 'tank': this.size = 25; this.color = '#a1a1aa'; this.speedY = 1 * difficulty; this.speedX = 0; this.health = 5 * difficulty; this.shootCooldown = 180; break;
            case 'dasher': this.size = 15; this.color = '#facc15'; this.speedY = 5 * difficulty; this.speedX = 0; this.health = 0.5 * difficulty; this.shootCooldown = 999; break;
            case 'weaver': this.size = 18; this.color = '#a78bfa'; this.speedY = 2 * difficulty; this.speedX = 5; this.health = 1 * difficulty; this.shootCooldown = 120; break;
            case 'dodger': this.size = 18; this.color = '#6ee7b7'; this.speedY = 1.5 * difficulty; this.speedX = 0; this.health = 2 * difficulty; this.shootCooldown = 200; break;
            case 'orbiter': this.size = 22; this.color = '#fb923c'; this.speedY = 2 * difficulty; this.speedX = 0; this.health = 3 * difficulty; this.shootCooldown = 30; this.targetY = Math.random() * window.innerHeight * 0.4 + 50; break;
            case 'kamikaze': this.size = 20; this.color = '#fca5a5'; this.speedY = 2 * difficulty; this.speedX = 0; this.health = 1 * difficulty; this.shootCooldown = 999; break;
            case 'sniper': this.size = 15; this.color = '#818cf8'; this.speedY = 1 * difficulty; this.speedX = (Math.random() - 0.5) * 2; this.health = 2 * difficulty; this.shootCooldown = 150; break;
            case 'splitter': this.size = 25; this.color = '#f472b6'; this.speedY = 1 * difficulty; this.speedX = 0; this.health = 4 * difficulty; this.shootCooldown = 200; break;
            case 'stealth': this.size = 16; this.color = '#94a3b8'; this.speedY = 1.5 * difficulty; this.speedX = Math.random() * 2 - 1; this.health = 2 * difficulty; this.shootCooldown = 100; break;
        }
    }

    update() {
        let isSlowed = player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x - player.x, this.y - player.y) < 200;
        if (isSlowed) this.slowTimer--;
        const speedMod = isSlowed ? 0.2 : 1;

        this.angleX += 0.01;
        this.angleY += 0.02;
        this.phase++;
        this.y += this.speedY * speedMod;

        switch (this.type) {
            case 'grunt': this.x += this.speedX * speedMod; if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1; break;
            case 'weaver': this.x += Math.sin(this.phase * 0.1) * this.speedX * speedMod; break;
            case 'dodger': const dx = gameState.mouse.x - this.x; if (Math.abs(dx) < 100) this.x -= Math.sign(dx) * 2 * speedMod; break;
            case 'orbiter': if (this.y > this.targetY) { this.y = this.targetY; this.speedY = 0; this.x += Math.cos(this.phase * 0.05) * 2 * speedMod; } break;
            case 'kamikaze': const angle = Math.atan2(player.y - this.y, player.x - this.x); this.x += Math.cos(angle) * this.speedY * speedMod; this.y += Math.sin(angle) * this.speedY * speedMod; break;
            case 'sniper': this.x += this.speedX * speedMod; if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1; break;
            case 'stealth': this.x += this.speedX * speedMod; if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1; break;
        }

        this.shootCooldown--;
        if (this.shootCooldown <= 0 && player) {
            switch (this.type) {
                case 'grunt': enemyBullets.push(new Bullet(this.x, this.y, 0, 5, this.color)); this.shootCooldown = 120; break;
                case 'tank': for (let i = -1; i <= 1; i++) enemyBullets.push(new Bullet(this.x, this.y, i * 1.5, 5, this.color, 2)); this.shootCooldown = 180; break;
                case 'orbiter': if (this.speedY === 0) { for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + this.phase * 0.1; enemyBullets.push(new Bullet(this.x, this.y, Math.cos(a) * 3, Math.sin(a) * 3, this.color)); } this.shootCooldown = 60; } break;
                case 'sniper': const angle = Math.atan2(player.y - this.y, player.x - this.x); enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * 8, Math.sin(angle) * 8, this.color)); this.shootCooldown = 150; break;
                default: enemyBullets.push(new Bullet(this.x, this.y, 0, 5, this.color)); this.shootCooldown = 150; break;
            }
        }

        // Update Three.js mesh position
        if (this.enemyMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.enemyMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.enemyMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        }
    }

    draw() {
        if (this.enemyMesh) scene.remove(this.enemyMesh);

        let displayColor = this.color;
        if (this.type === 'stealth' && Math.sin(this.phase * 0.1) > 0) displayColor = 'transparent';

        this.enemyMesh = createWireframeModel(this.model, hexToThreeColor(displayColor), this.size * 0.8 / 20); // Scale is based on player's size for consistency
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.enemyMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        this.enemyMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        scene.add(this.enemyMesh);

        // Display health for enemies with more than 1 health
        if (this.health > 1) {
            // Placeholder for 3D text health display or alternative UI element
            // For now, we omit 2D text drawing.
        }
    }

    takeDamage(amount) {
        if (this.health <= 0) return false;
        this.health -= amount;
        return this.health <= 0;
    }

    onDeath() {
        if (this.type === 'splitter') {
            for (let i = 0; i < 3; i++) {
                enemies.push(new Enemy('grunt', this.x, this.y));
            }
        }
        if (player.abilities.alchemist && player.abilityState.active && Math.random() < 0.2) {
            powerups.push(new PowerUp(this.x, this.y));
        }
    }
}

export class Boss {
    constructor(bossModel) {
        this.model = bossModel;
        this.name = bossModel.name;
        this.size = 60;
        this.x = window.innerWidth / 2;
        this.y = -this.size;
        this.targetY = 150;
        this.health = (80 + Math.floor(score / 1000)) * (waveCount > 1 ? 1.5 : 1);
        this.maxHealth = this.health;
        this.color = '#ec4899';
        this.shootCooldown = 0;
        this.phase = 'entering';
        this.angleX = 0;
        this.angleY = 0;
        this.angleZ = 0;
        this.speedX = 2;
        this.bossMesh = null; // Three.js mesh for the boss
    }

    update() {
        let isSlowed = player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x - player.x, this.y - player.y) < 200;
        const speedMod = isSlowed ? 0.2 : 1;

        this.angleX += 0.005 * speedMod;
        this.angleY += 0.01 * speedMod;
        if (this.phase === 'entering') {
            this.y += (this.targetY - this.y) * 0.05 * speedMod;
            if (Math.abs(this.y - this.targetY) < 1) this.phase = 'fighting';
        } else if (this.phase === 'fighting') {
            this.x += this.speedX * speedMod;
            if (this.x < this.size || this.x > window.innerWidth - this.size) this.speedX *= -1;
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                this.shoot();
                this.shootCooldown = this.health < this.maxHealth / 2 ? 30 : 50;
            }
        }

        // Update Three.js mesh position
        if (this.bossMesh) {
            const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
            this.bossMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
            this.bossMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        }
    }

    draw() {
        if (this.bossMesh) scene.remove(this.bossMesh);

        this.bossMesh = createWireframeModel(this.model, hexToThreeColor(this.color), this.size / 20); // Scale similar to player
        const threeCoords = gameToThreeCoords(this.x, this.y, 0, window.innerWidth, window.innerHeight, camera.position.z);
        this.bossMesh.position.set(threeCoords.x, threeCoords.y, threeCoords.z);
        this.bossMesh.rotation.set(this.angleX, this.angleY, this.angleZ);
        scene.add(this.bossMesh);
    }

    shoot() {
        const patterns = [
            () => {
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + this.angleY * 2;
                    enemyBullets.push(new Bullet(this.x, this.y, Math.sin(angle) * 2.5, Math.cos(angle) * 2.5, this.color));
                }
            },
            () => {
                enemyBullets.push(new Bullet(this.x, this.y, 0, 5, this.color));
                enemyBullets.push(new Bullet(this.x, this.y, -1.5, 5, this.color));
                enemyBullets.push(new Bullet(this.x, this.y, 1.5, 5, this.color));
            }
        ];
        if (this.name === "BEHEMOTH") {
            patterns.push(() => {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                for (let i = -1; i <= 1; i++) { enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle + i * 0.2) * 4, Math.sin(angle + i * 0.2) * 4, this.color)); }
            })
        }
        patterns[Math.floor(Math.random() * patterns.length)]();
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

export const WaveManager = {
    nextBossScore: 7500,
    update: function () {
        if (currentBoss || isPaused) return;

        if (score >= this.nextBossScore) {
            this.spawnBoss();
            this.nextBossScore += 10000 + this.nextBossScore * 0.2;
        } else {
            // Asteroid field segment (e.g., every 10,000 score after the first boss, for 2000 score duration)
            const asteroidSegmentStart = 10000;
            const segmentDuration = 2000;
            const segmentInterval = 10000; // How often the segment repeats

            const inAsteroidSegment = (score > asteroidSegmentStart) &&
                ((score - asteroidSegmentStart) % segmentInterval < segmentDuration);

            if (inAsteroidSegment) {
                if (gameFrame % 30 === 0 && obstacles.filter(o => o.type === 'asteroid').length < 30) {
                    obstacles.push(new Obstacle('asteroid'));
                }
            } else {
                // Normal enemy spawning
                if (gameFrame % 100 === 0 && enemies.length < 15 * spawnMultiplier) {
                    const availableTypes = enemySpawnTable.filter(e => score >= e.score).flatMap(e => e.types);
                    const waveSize = Math.min(5, 1 + Math.floor(score / 4000)) * spawnMultiplier;
                    for (let i = 0; i < waveSize; i++) {
                        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                        enemies.push(new Enemy(type));
                    }
                }
            }

            // Blackhole spawning (less frequent, higher score)
            if (score > 50000 && gameFrame % 900 === 0 && !obstacles.some(o => o.type === 'blackhole')) {
                obstacles.push(new Obstacle('blackhole'));
            }

            // Quasar spawning (e.g., every 25,000 score, not during asteroid segment)
            if (score > 25000 && gameFrame % 1500 === 0 && !obstacles.some(o => o.type === 'quasar') && !inAsteroidSegment) {
                obstacles.push(new Quasar());
            }

            // Magnetar spawning (e.g., every 40,000 score, not during asteroid segment)
            if (score > 40000 && gameFrame % 2000 === 0 && !obstacles.some(o => o.type === 'magnetar') && !inAsteroidSegment) {
                obstacles.push(new Magnetar());
            }
        }
    },
    spawnBoss: function () {
        enemies.length = 0;
        setWaveCount(waveCount + 1);
        const bossModel = (waveCount % 2 !== 0) ? BOSS_MODEL_1 : BOSS_MODEL_2;
        setCurrentBoss(new Boss(bossModel));
        window.uiElements.bossNameEl.textContent = currentBoss.name;
        window.uiElements.bossHealthBarContainer.style.display = 'block';
        startMusic(true);
    }
};
