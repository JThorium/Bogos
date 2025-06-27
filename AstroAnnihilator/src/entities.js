import { gameFrame, ghostTimer, spectreTimer, setGhostTimer, setMaterialsThisRun, setWaveCredits, scoreMultiplier, currentBoss, player } from './gameData.js';
import { enemies, enemyBullets, particles, powerups, obstacles, turrets, createExplosion, addScore, isColliding, triggerScreenShake, showInGameShopUI as showInGameShop, startMusic } from './game.js';
import { projectAndDrawWireframe } from './utils.js';
import { ASTEROID_MODEL, QUASAR_MODEL, MAGNETAR_MODEL } from './models.js';
import { sfx } from './audio.js';

export class Bullet { constructor(x, y, speedX, speedY, color, damage = 1) { this.x = x; this.y = y; this.speedX = speedX; this.speedY = speedY; this.size = 5; this.color = color; this.damage = damage; this.canSlow = false; } update() { let timeMod = 1; if (player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200) { timeMod = 0.2; } this.x += this.speedX * timeMod; this.y += this.speedY * timeMod; if (gameFrame % 3 === 0) particles.push(new Particle(this.x, this.y, 0, this.speedY * 0.2, this.color, 2, 8)); } draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
export class HomingBullet extends Bullet { constructor(x, y, speedX, speedY, color, damage, range = 400) { super(x, y, speedX, speedY, color, damage); this.turnSpeed = 0.05; this.target = null; this.range = range; } update() { if (!this.target || enemies.indexOf(this.target) === -1) this.findTarget(); if(this.target) { const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x); const currentAngle = Math.atan2(this.speedY, this.speedX); let angleDiff = targetAngle - currentAngle; while (angleDiff > Math.PI) angleDiff -= 2*Math.PI; while (angleDiff < -Math.PI) angleDiff += 2*Math.PI; const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(this.turnSpeed, Math.abs(angleDiff)); const speed = Math.hypot(this.speedX, this.speedY) + 0.1; this.speedX = Math.cos(newAngle) * speed; this.speedY = Math.sin(newAngle) * speed;} super.update(); } findTarget() { let closestDist = Infinity; this.target = null; for(const enemy of enemies) { const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y); if (dist < closestDist && dist < this.range) { closestDist = dist; this.target = enemy; } } } }
export class Star { constructor() { this.x = Math.random() * screenWidth; this.y = Math.random() * screenHeight; this.size = Math.random() * 2 + 1; this.speed = this.size * 0.5; } update() { let timeMod = 1; if (player && player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200) { timeMod = 0.2; } this.y += this.speed * timeMod; if (this.y > screenHeight) { this.y = -this.size; this.x = Math.random() * screenWidth; } } draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.size / 3})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
export class Particle { constructor(x, y, speedX, speedY, color, size, lifespan) { this.x = x; this.y = y; this.speedX = speedX + (Math.random() - 0.5) * 2; this.speedY = speedY + (Math.random() - 0.5) * 2; this.color = color; this.size = size; this.lifespan = lifespan; this.maxLifespan = lifespan; } update() { this.x += this.speedX; this.y += this.speedY; this.lifespan--; this.size *= 0.95; } draw() { const rgb = `${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}`; ctx.fillStyle = `rgba(${rgb}, ${this.lifespan / this.maxLifespan})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
export class PowerUp { constructor(x, y) { this.x = x; this.y = y; this.size = 10; this.speedY = 2; const types = ['shield', 'minion', 'ghost', 'bomb']; this.type = types[Math.floor(Math.random() * types.length)]; this.color = { shield: '#60a5fa', minion: '#a78bfa', ghost: '#e5e7eb', bomb: '#ffffff'}[this.type]; } update() { this.y += this.speedY; } draw() { ctx.fillStyle = this.color; ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2); ctx.fillStyle = "black"; ctx.font = "12px 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const label = { shield: 'S', minion: 'M', ghost: 'G', bomb: 'B'}[this.type]; ctx.fillText(label, this.x, this.y); } }
export class RawMaterialPickup extends PowerUp { constructor(x, y) { super(x, y); this.type = 'material'; this.color = '#94a3b8'; } draw() { ctx.fillStyle = this.color; ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Math.PI / 4); ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2); ctx.restore(); ctx.fillStyle = "black"; ctx.font = "12px 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('[M]', this.x, this.y); } }
export class Obstacle { constructor(type) { this.type = type; this.x = Math.random() * screenWidth; this.y = -50; this.speedY = Math.random() * 1 + 0.5; this.size = Math.random() * 20 + 15; this.angleX = Math.random()*Math.PI*2; this.angleY = Math.random()*Math.PI*2; this.angleZ = 0; this.rotationSpeed = (Math.random() - 0.5) * 0.02; if(type === 'asteroid') { this.health = this.size / 10; this.color = '#a1a1aa'; this.model = ASTEROID_MODEL; } else if (type === 'blackhole') { this.color = '#000'; this.size = Math.random() * 30 + 40; this.gravityWell = this.size * 4; this.lifespan = 600; this.y = Math.random() * screenHeight * 0.6; sfx.blackhole.triggerAttack(); } } update() { this.angleY += this.rotationSpeed; if(this.type === 'asteroid') { this.y += this.speedY; } else if(this.type === 'blackhole') { if(player) { const dx = this.x-player.x; const dy = this.y-player.y; const dist = Math.hypot(dx,dy); if(dist < this.gravityWell) { const pull = (1 - dist / this.gravityWell) * 0.2; player.x += dx/dist * pull; player.y += dy/dist * pull; if(dist < this.size) player.hit(); }} this.lifespan--; if(this.lifespan <= 0) sfx.blackhole.triggerRelease(); }} draw() { if(this.type === 'asteroid') { projectAndDrawWireframe(this.model, this.x, this.y, this.size, {x:this.angleX, y:this.angleY, z:this.angleZ}, this.color, 1.5); } else if(this.type === 'blackhole') { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(200, 50, 255, ${0.5 + Math.sin(gameFrame*0.1)*0.2})`; ctx.lineWidth = 3; ctx.stroke(); } }
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
        this.y = Math.random() * screenHeight * 0.6;
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
        if (this.y > screenHeight + this.size) this.y = -this.size;
    }

    draw() {
        projectAndDrawWireframe(this.model, this.x, this.y, this.size, {x:this.angleX, y:this.angleY, z:this.angleZ}, this.color, 2);
        // Draw pulse effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.pulseRadius * (1 - this.currentPulseCooldown / this.pulseCooldown), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250, 200, 0, ${0.5 * (this.currentPulseCooldown / this.pulseCooldown)})`;
        ctx.lineWidth = 5;
        ctx.stroke();
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
        this.x = Math.random() * screenWidth;
        this.y = Math.random() * screenHeight;
        this.size = Math.random() * 200 + 100;

        const layerCount = Math.floor(Math.random() * 3) + 2; // 2-4 layers
        const colors = [
            `rgba(255, 100, 100, 0.02)`, // Red (Hydrogen)
            `rgba(100, 100, 255, 0.02)`, // Blue (Oxygen)
            `rgba(100, 255, 100, 0.02)`  // Green (Sulphur)
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
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        this.layers.forEach(layer => {
            ctx.save();
            ctx.translate(layer.x, layer.y);
            ctx.rotate(layer.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, layer.radius, layer.radius / 2, 0, 0, Math.PI * 2);
            ctx.fillStyle = layer.color;
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
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
        this.y = Math.random() * screenHeight * 0.6;
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
        if (this.y > screenHeight + this.size) this.y = -this.size;
    }

    draw() {
        projectAndDrawWireframe(this.model, this.x, this.y, this.size, {x:this.angleX, y:this.angleY, z:this.angleZ}, this.color, 2);
        // Draw gravity field
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.gravityField, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(gameFrame*0.05)*0.05})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    takeDamage(amount) { return false; } // Invincible
}
