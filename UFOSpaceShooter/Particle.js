import { ctx } from './game.js';

export class Particle {
    constructor(x, y, speedX, speedY, color, size, lifespan) { this.x = x; this.y = y; this.speedX = speedX + (Math.random() - 0.5) * 2; this.speedY = speedY + (Math.random() - 0.5) * 2; this.color = color; this.size = size; this.lifespan = lifespan; this.maxLifespan = lifespan; }
    update() { this.x += this.speedX; this.y += this.speedY; this.lifespan--; this.size *= 0.95; }
    draw() { const rgb = `${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}`; ctx.fillStyle = `rgba(${rgb}, ${this.lifespan / this.maxLifespan})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}