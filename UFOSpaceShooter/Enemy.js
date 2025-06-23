import { gameState, ENEMY_MODELS, UFO_TYPES, ctx } from './game.js';
import { Bullet } from './Bullet.js';
import { projectAndDrawWireframe } from './utils.js';
import { PowerUp } from './PowerUp.js';

export class Enemy {
    constructor(type = 'grunt', x = Math.random() * gameState.screenWidth, y = -30) { this.type = type; this.model = ENEMY_MODELS[type]; this.x = x; this.y = y; this.angleX = 0; this.angleY = 0; this.angleZ = 0; this.slowTimer = 0; this.phase = 0; const difficulty = Math.min(5, 1 + gameState.score/20000); switch(type) { case 'grunt': this.size = 20; this.color = '#f87171'; this.speedY = (Math.random()*1+1)*difficulty; this.speedX = (Math.random()-0.5)*4; this.health = 1 * difficulty; this.shootCooldown = Math.random()*100+50; break; case 'tank': this.size = 25; this.color = '#a1a1aa'; this.speedY = 1*difficulty; this.speedX = 0; this.health = 5 * difficulty; this.shootCooldown = 180; break; case 'dasher': this.size=15; this.color='#facc15'; this.speedY = 5*difficulty; this.speedX=0; this.health = 0.5 * difficulty; this.shootCooldown=999; break; case 'weaver': this.size=18; this.color='#a78bfa'; this.speedY = 2*difficulty; this.speedX=5; this.health = 1 * difficulty; this.shootCooldown=120; break; case 'dodger': this.size=18; this.color='#6ee7b7'; this.speedY = 1.5*difficulty; this.speedX=0; this.health = 2 * difficulty; this.shootCooldown=200; break; case 'orbiter': this.size=22; this.color='#fb923c'; this.speedY = 2*difficulty; this.speedX=0; this.health = 3 * difficulty; this.shootCooldown=30; this.targetY = Math.random()*gameState.screenHeight*0.4+50; break; case 'kamikaze': this.size=20; this.color='#fca5a5'; this.speedY = 2*difficulty; this.speedX=0; this.health = 1 * difficulty; this.shootCooldown=999; break; case 'sniper': this.size=15; this.color='#818cf8'; this.speedY = 1*difficulty; this.speedX=(Math.random()-0.5)*2; this.health = 2*difficulty; this.shootCooldown=150; break; case 'splitter': this.size=25; this.color='#f472b6'; this.speedY=1*difficulty; this.speedX=0; this.health=4*difficulty; this.shootCooldown=200; break; case 'stealth': this.size=16; this.color='#94a3b8'; this.speedY=1.5*difficulty; this.speedX=Math.random()*2-1; this.health=2*difficulty; this.shootCooldown=100; break;} }
    update() {
        let isSlowed = this.slowTimer > 0 || (gameState.player && gameState.player.abilityState.name === 'chronomancer' && gameState.player.abilityState.active && Math.hypot(this.x-gameState.player.x, this.y-gameState.player.y) < 200);
        if(isSlowed) this.slowTimer--;
        const speedMod = isSlowed ? 0.2 : 1;
        this.angleX += 0.01; this.angleY += 0.02; this.phase++; this.y += this.speedY * speedMod;
        switch(this.type){
            case 'grunt': this.x += this.speedX * speedMod; if(this.x<0||this.x>gameState.screenWidth) this.speedX*=-1; break;
            case 'weaver': this.x += Math.sin(this.phase * 0.1) * this.speedX * speedMod; break;
            case 'dodger': const dx=gameState.mouse.x-this.x; if(Math.abs(dx)<100) this.x -= Math.sign(dx)*2*speedMod; break;
            case 'orbiter': if(this.y > this.targetY) { this.y = this.targetY; this.speedY=0; this.x += Math.cos(this.phase * 0.05) * 2 * speedMod; } break;
            case 'kamikaze': const angle = Math.atan2(gameState.player.y-this.y, gameState.player.x-this.x); this.x += Math.cos(angle)*this.speedY*speedMod; this.y += Math.sin(angle)*this.speedY*speedMod; break;
            case 'sniper': this.x += this.speedX * speedMod; if(this.x<0||this.x>gameState.screenWidth) this.speedX*=-1; break;
            case 'stealth': this.x += this.speedX * speedMod; if(this.x<0||this.x>gameState.screenWidth) this.speedX*=-1; break;
        }
        this.shootCooldown--;
        if(this.shootCooldown <= 0 && gameState.player) {
            switch(this.type) {
                case 'grunt': gameState.enemyBullets.push(new Bullet(this.x,this.y,0,5,this.color)); this.shootCooldown=120; break;
                case 'tank': for(let i=-1; i<=1; i++) gameState.enemyBullets.push(new Bullet(this.x,this.y, i*1.5, 5, this.color, 2)); this.shootCooldown=180; break;
                case 'orbiter': if(this.speedY === 0) {for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+this.phase*0.1; gameState.enemyBullets.push(new Bullet(this.x,this.y,Math.cos(a)*3,Math.sin(a)*3,this.color));} this.shootCooldown=60;} break;
                case 'sniper': const angle=Math.atan2(gameState.player.y-this.y, gameState.player.x-this.x); gameState.enemyBullets.push(new Bullet(this.x,this.y,Math.cos(angle)*8,Math.sin(angle)*8, this.color)); this.shootCooldown=150; break;
                default: gameState.enemyBullets.push(new Bullet(this.x,this.y,0,5,this.color)); this.shootCooldown=150; break;
            }
        }
    }
    draw() { let color = this.color; if(this.type === 'stealth' && Math.sin(this.phase * 0.1) > 0) color = 'transparent'; projectAndDrawWireframe(this.model, this.x, this.y, this.size * 0.8, {x:this.angleX, y:this.angleY, z:this.angleZ}, color, 2); if (this.health > 1) { ctx.fillStyle = '#fff'; ctx.font = '10px monospace'; ctx.fillText(Math.ceil(this.health), this.x-4, this.y - 20); } }
    takeDamage(amount) { this.health -= amount; return this.health <= 0; }
    onDeath(){ if(this.type==='splitter'){for(let i=0; i<3; i++) gameState.enemies.push(new Enemy('grunt', this.x, this.y));} if(gameState.player.abilities.alchemist && gameState.player.abilityState.active && Math.random() < 0.2) { gameState.powerups.push(new PowerUp(this.x, this.y)); }}
}