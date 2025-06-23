import { ctx } from './game.js';
import { PowerUp } from './PowerUp.js';

export class RawMaterialPickup extends PowerUp {
    constructor(x, y) { super(x, y); this.type = 'material'; this.color = '#94a3b8'; }
    draw() { ctx.fillStyle = this.color; ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Math.PI / 4); ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2); ctx.restore(); ctx.fillStyle = "black"; ctx.font = "12px 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('[M]', this.x, this.y); }
}