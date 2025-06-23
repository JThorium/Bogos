import { gameState, ctx } from './game.js';

export class Star {
    constructor() { this.x = Math.random() * gameState.screenWidth; this.y = Math.random() * gameState.screenHeight; this.size = Math.random() * 2 + 1; this.speed = this.size * 0.5; }
    update() { let timeMod = 1; if (gameState.player && gameState.player.abilityState.name === 'chronomancer' && gameState.player.abilityState.active && Math.hypot(this.x-gameState.player.x, this.y-gameState.player.y) < 200) { timeMod = 0.2; } this.y += this.speed * timeMod; if (this.y > gameState.screenHeight) { this.y = -this.size; this.x = Math.random() * gameState.screenWidth; } }
    draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.size / 3})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}