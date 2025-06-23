import { gameState } from './game.js';
import { Bullet } from './Bullet.js';

export class HomingBullet extends Bullet {
    constructor(x, y, speedX, speedY, color, damage, range = 400) { super(x, y, speedX, speedY, color, damage); this.turnSpeed = 0.05; this.target = null; this.range = range; }
    update() {
        if (!this.target || gameState.enemies.indexOf(this.target) === -1) this.findTarget();
        if(this.target) { const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x); const currentAngle = Math.atan2(this.speedY, this.speedX); let angleDiff = targetAngle - currentAngle; while (angleDiff > Math.PI) angleDiff -= 2*Math.PI; while (angleDiff < -Math.PI) angleDiff += 2*Math.PI; const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(this.turnSpeed, Math.abs(angleDiff)); const speed = Math.hypot(this.speedX, this.speedY) + 0.1; this.speedX = Math.cos(newAngle) * speed; this.speedY = Math.sin(newAngle) * speed;}
        super.update();
    }
    findTarget() { let closestDist = Infinity; this.target = null; for(const enemy of gameState.enemies) { const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y); if (dist < closestDist && dist < this.range) { closestDist = dist; this.target = enemy; } } }
}