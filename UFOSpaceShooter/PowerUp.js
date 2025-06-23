import { ctx } from './game.js';

export class PowerUp {
    constructor(x, y) { this.x = x; this.y = y; this.size = 10; this.speedY = 2; const types = ['shield', 'minion', 'ghost', 'bomb']; this.type = types[Math.floor(Math.random() * types.length)]; this.color = { shield: '#60a5fa', minion: '#a78bfa', ghost: '#e5e7eb', bomb: '#ffffff'}[this.type]; }
    update() { this.y += this.speedY; }
    draw() { ctx.fillStyle = this.color; ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2); ctx.fillStyle = "black"; ctx.font = "12px 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const label = { shield: 'S', minion: 'M', ghost: 'G', bomb: 'B'}[this.type]; ctx.fillText(label, this.x, this.y); }
}