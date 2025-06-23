import { gameState, BOSS_MODEL_1, BOSS_MODEL_2, ctx, sfx, ui } from './game.js';
import { Bullet } from './Bullet.js';
import { projectAndDrawWireframe, createExplosion, addScore } from './utils.js';

export class Boss {
    constructor(bossModel) { this.model = bossModel; this.name = bossModel.name; this.size = 60; this.x = gameState.screenWidth / 2; this.y = -this.size; this.targetY = 150; this.health = (80 + Math.floor(gameState.score / 1000)) * (gameState.waveCount > 1 ? 1.5 : 1); this.maxHealth = this.health; this.color = '#ec4899'; this.shootCooldown = 0; this.phase = 'entering'; this.angleX = 0; this.angleY = 0; this.angleZ = 0; this.speedX = 2; }
    update() {
        let isSlowed = gameState.player.abilityState.name === 'chronomancer' && gameState.player.abilityState.active && Math.hypot(this.x-gameState.player.x, this.y-gameState.player.y) < 200;
        const speedMod = isSlowed ? 0.2 : 1;
        this.angleX += 0.005 * speedMod; this.angleY += 0.01 * speedMod;
        if (this.phase === 'entering') { this.y += (this.targetY - this.y) * 0.05 * speedMod; if (Math.abs(this.y - this.targetY) < 1) this.phase = 'fighting'; }
        else if (this.phase === 'fighting') { this.x += this.speedX * speedMod; if (this.x < this.size || this.x > gameState.screenWidth - this.size) this.speedX *= -1; this.shootCooldown--; if (this.shootCooldown <= 0) { this.shoot(); this.shootCooldown = this.health < this.maxHealth / 2 ? 30 : 50; } }
    }
    draw() { projectAndDrawWireframe(this.model, this.x, this.y, this.size, {x:this.angleX, y:this.angleY, z:this.angleZ}, this.color, 4); }
    shoot() { const patterns = [ () => { for (let i = 0; i < 6; i++) { const angle = (i / 6) * Math.PI * 2 + this.angleY * 2; gameState.enemyBullets.push(new Bullet(this.x, this.y, Math.sin(angle) * 2.5, Math.cos(angle) * 2.5, this.color)); } }, () => { gameState.enemyBullets.push(new Bullet(this.x, this.y, 0, 5, this.color)); gameState.enemyBullets.push(new Bullet(this.x, this.y, -1.5, 5, this.color)); gameState.enemyBullets.push(new Bullet(this.x, this.y, 1.5, 5, this.color)); } ]; if (this.name === "BEHEMOTH") { patterns.push(() => { const angle = Math.atan2(gameState.player.y - this.y, gameState.player.x - this.x); for(let i=-1; i<=1; i++) {gameState.enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle + i*0.2) * 4, Math.sin(angle + i*0.2) * 4, this.color));}}) } patterns[Math.floor(Math.random() * patterns.length)](); }
    takeDamage(amount) { this.health -= amount; return this.health <= 0; }
}