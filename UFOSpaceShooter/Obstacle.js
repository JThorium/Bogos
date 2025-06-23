import { gameState, ASTEROID_MODEL, ctx, sfx } from './game.js';
import { projectAndDrawWireframe } from './utils.js';

export class Obstacle {
    constructor(type) { this.type = type; this.x = Math.random() * gameState.screenWidth; this.y = -50; this.speedY = Math.random() * 1 + 0.5; this.size = Math.random() * 20 + 15; this.angleX = Math.random()*Math.PI*2; this.angleY = Math.random()*Math.PI*2; this.angleZ = 0; this.rotationSpeed = (Math.random() - 0.5) * 0.02; if(type === 'asteroid') { this.health = this.size / 10; this.color = '#a1a1aa'; this.model = ASTEROID_MODEL; } else if (type === 'blackhole') { this.color = '#000'; this.size = Math.random() * 30 + 40; this.gravityWell = this.size * 4; this.lifespan = 600; this.y = Math.random() * gameState.screenHeight * 0.6; sfx.blackhole.triggerAttack(); } }
    update() {
        this.angleY += this.rotationSpeed;
        if(this.type === 'asteroid') { this.y += this.speedY; }
        else if(this.type === 'blackhole') { if(gameState.player) { const dx = this.x-gameState.player.x; const dy = this.y-gameState.player.y; const dist = Math.hypot(dx,dy); if(dist < this.gravityWell) { const pull = (1 - dist / this.gravityWell) * 0.2; gameState.player.x += dx/dist * pull; gameState.player.y += dy/dist * pull; if(dist < this.size) gameState.player.hit(); }} this.lifespan--; if(this.lifespan <= 0) sfx.blackhole.triggerRelease(); }
    }
    draw() { if(this.type === 'asteroid') { projectAndDrawWireframe(this.model, this.x, this.y, this.size, {x:this.angleX, y:this.angleY, z:this.angleZ}, this.color, 1.5); } else if(this.type === 'blackhole') { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(200, 50, 255, ${0.5 + Math.sin(gameState.gameFrame*0.1)*0.2})`; ctx.lineWidth = 3; ctx.stroke(); } }
    takeDamage(amount) { if(this.type !== 'asteroid') return false; this.health -= amount; return this.health <= 0; }
}