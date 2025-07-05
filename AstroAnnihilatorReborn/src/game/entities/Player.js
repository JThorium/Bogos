class Minion {
  constructor() {
    this.angle = Math.random() * Math.PI * 2;
    this.orbitRadius = 3;
    this.shootCooldown = 75;
    this.x = 0;
    this.y = 0;
  }
  update(player, index, gameFrame, bullets) {
    this.angle += 0.03;
    // Orbit logic
    this.x = player.x + Math.cos(this.angle + index * (Math.PI * 2 / player.minions.length)) * this.orbitRadius;
    this.y = player.y + Math.sin(this.angle + index * (Math.PI * 2 / player.minions.length)) * this.orbitRadius;
    // Shooting logic
    this.shootCooldown--;
    if (this.shootCooldown <= 0) {
      bullets.push({
        position: [this.x, this.y, 0],
        firedByPlayer: true,
        speed: 8,
        color: '#a78bfa',
        damage: 1,
      });
      this.shootCooldown = 75;
    }
  }
}

class Player {
  constructor({ x = 0, y = 0, ufo, upgrades, gameMode, fusionConfig, isCombineAllActive }) {
    this.x = x;
    this.y = y;
    this.size = 1.5; // For collision, rendering
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.shootCooldown = 0;
    this.minions = [];
    this.turrets = [];
    this.reaperBoost = 0;
    this.phoenixUsed = false;
    this.abilities = {};
    this.abilityState = { name: null, active: false, charge: 0, duration: 0, cooldown: 0, cycleIndex: 0 };
    this.models = [];
    this.gameMode = gameMode;
    this.fusionConfig = fusionConfig;
    this.isCombineAllActive = isCombineAllActive;
    this.init(ufo, upgrades);
  }

  init(ufo, upgrades) {
    // Set up ship stats and abilities
    this.ufo = ufo;
    this.models = [ufo.id];
    this.abilities[ufo.id] = true;
    this.baseHealth = ufo.id === 'juggernaut' ? 6 : 3;
    this.health = this.baseHealth;
    this.shield = ufo.id === 'sentinel' ? 1 : 0;
    this.baseFireRate = ufo.stats?.shotCooldown || 0.25;
    this.bombs = 0;
    if (upgrades) {
      this.shield += upgrades.startShield?.level || 0;
      this.bombs += upgrades.startBomb?.level || 0;
      for (let i = 0; i < (upgrades.startMinion?.level || 0); i++) this.addMinion();
    }
    if (ufo.id === 'destroyer') this.addMinion();
    if (ufo.id === 'paladin') this.abilityState.charge = 0;
  }

  update(targetX, targetY, isAbilityHeld, upgrades, gameFrame, bullets) {
    // Movement smoothing
    this.velocityX = (targetX - this.x) * 0.1;
    this.velocityY = (targetY - this.y) * 0.1;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.angle += 0.02;
    // Clamp to play area (assume -W/2..W/2, -H/2..H/2)
    // (Clamping will be handled in GameScene with viewport info)

    // Ability logic
    if (isAbilityHeld && !this.abilityState.active && this.abilityState.cooldown <= 0) {
      this.abilityState.active = true;
      this.abilityState.duration = 0;
    }
    if (this.abilityState.active) {
      this.abilityState.duration++;
      // TODO: Per-ability effects
    }
    if (!isAbilityHeld && this.abilityState.active) {
      this.abilityState.active = false;
      this.abilityState.cooldown = 60;
      // TODO: Per-ability release effects
    }
    if (this.abilityState.cooldown > 0) this.abilityState.cooldown--;

    // Minion update
    this.minions.forEach((m, i) => m.update(this, i, gameFrame, bullets));
    this.turrets.forEach(t => t.update(this));
  }

  canShoot() {
    return this.shootCooldown <= 0;
  }

  shoot(bullets) {
    this.shootCooldown = Math.max(2, this.baseFireRate);
    bullets.push({
      position: [this.x, this.y - this.size, 0],
      firedByPlayer: true,
      speed: 10,
      color: this.ufo.color || 'yellow',
      damage: 1,
    });
  }

  tickCooldown() {
    if (this.shootCooldown > 0) this.shootCooldown--;
  }

  addMinion() {
    this.minions.push(new Minion());
  }

  hit() {
    if (this.shield > 0) {
      this.shield--;
      return false;
    }
    this.health--;
    return this.health <= 0;
  }
}

export default Player; 