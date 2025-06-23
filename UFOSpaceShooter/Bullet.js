import { gameState, ctx } from './game.js';
import { Particle } from './Particle.js';

export class Bullet {
    constructor(x, y, speedX, speedY, color, damage = 1) { this.x = x; this.y = y; this.speedX = speedX; this.speedY = speedY; this.size = 5; this.color = color; this.damage = damage; this.canSlow = false; }
    update() { let timeMod = 1; if (gameState.player.abilityState.name === 'chronomancer' && gameState.player.abilityState.active && Math.hypot(this.x-gameState.player.x, this.y-gameState.player.y) < 200) { timeMod = 0.2; } this.x += this.speedX * timeMod; this.y += this.speedY * timeMod; if (gameState.gameFrame % 3 === 0) gameState.particles.push(new Particle(this.x, this.y, 0, this.speedY * 0.2, this.color, 2, 8)); }
    draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}