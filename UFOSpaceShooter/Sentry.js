import { gameState, UFO_TYPES, ctx } from './game.js';
import { Bullet } from './Bullet.js';

export class Sentry {
    constructor(parent) { this.parent = parent; this.x = parent.x; this.y = parent.y; this.size = 12; this.shootCooldown = 20; this.lifespan = 300; this.color = UFO_TYPES.engineer.color; }
    update() {
        this.lifespan--; this.x += (this.parent.x - this.x) * 0.05; this.y += (this.parent.y - 20 - this.y) * 0.05; this.shootCooldown--;
        if (this.shootCooldown <= 0) { gameState.playerBullets.push(new Bullet(this.x, this.y, 0, -8, this.color, 1)); this.shootCooldown = 20; }
        if(this.lifespan <= 0) gameState.turrets.splice(gameState.turrets.indexOf(this), 1);
    }
    draw() { ctx.fillStyle = this.color; ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size); }
}