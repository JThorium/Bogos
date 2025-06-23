import { gameState, ctx } from './game.js';
import { Bullet } from './Bullet.js';
import { HomingBullet } from './HomingBullet.js';

export class Minion {
    constructor(parent) { this.parent = parent; this.x = parent.x; this.y = parent.y; this.size = 8; this.angle = 0; this.orbitRadius = 50; this.shootCooldown = 60; this.color = '#a78bfa'; }
    update(index) {
        this.angle += 0.03; const orbitAngle = this.angle + (index * (Math.PI * 2 / this.parent.minions.length)); this.x = this.parent.x + Math.cos(orbitAngle) * this.orbitRadius; this.y = this.parent.y + Math.sin(orbitAngle) * this.orbitRadius;
        if (gameState.player && gameState.player.abilityState.name === 'destroyer' && gameState.player.abilityState.active) { if(this.shootCooldown <= 0) { gameState.playerBullets.push(new HomingBullet(this.x, this.y, 0, -6, this.color, 0.5)); this.shootCooldown = 45; }}
        else if (this.shootCooldown <= 0) { gameState.playerBullets.push(new Bullet(this.x, this.y, 0, -6, this.color, 1)); this.shootCooldown = 75; } this.shootCooldown--;
    }
    draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(-this.angle); ctx.strokeStyle = this.color; ctx.lineWidth = 2; ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size); ctx.restore(); }
}