import { gameState, UFO_TYPES, SHIP_MODELS, sfx, ui, ctx } from './game.js';
import { Minion } from './Minion.js';
import { Sentry } from './Sentry.js';
import { Bullet } from './Bullet.js';
import { HomingBullet } from './HomingBullet.js';
import { projectAndDrawWireframe, createExplosion, addScore, triggerScreenShake, isColliding } from './utils.js';

export class Player {
    constructor() { this.x = 0; this.y = 0; this.reset(); }
    reset() {
        const MOUSE_Y_OFFSET = 80; // Player ship vertical offset
        this.x = gameState.screenWidth / 2; this.y = gameState.screenHeight - 100 - MOUSE_Y_OFFSET;
        this.size = 20; this.angleX = 0; this.angleY = 0; this.angleZ = 0; this.velocityX = 0; this.velocityY = 0;
        this.shootCooldown = 0; this.minions = []; gameState.turrets = []; this.reaperBoost = 0; this.phoenixUsed = false;
        this.abilities = {}; this.models = [];
        this.abilityState = { name: null, active: false, charge: 0, duration: 0, cooldown: 0, cycleIndex: 0 };
        
        if (gameState.selectedUFO === 'omega') { this.setupOmegaShip(); }
        else if (gameState.gameMode === 'fusion' && (gameState.fusionConfig.length > 0 || gameState.isCombineAllActive)) { this.setupFusedShip(); }
        else { this.setupClassicShip(); }

        this.shield += gameState.upgrades.startShield.level; this.bombs = gameState.upgrades.startBomb.level;
        for (let i = 0; i < gameState.upgrades.startMinion.level; i++) this.addMinion();
    }
    setupClassicShip() {
        this.ufo = UFO_TYPES[gameState.selectedUFO]; this.models = [gameState.selectedUFO]; this.abilities[gameState.selectedUFO] = true;
        this.baseHealth = this.ufo.name === 'Juggernaut' ? 6 : 3; this.health = this.baseHealth;
        this.shield = this.ufo.name === 'Sentinel' ? 1 : 0; this.baseFireRate = this.ufo.fireRate;
        if (this.ufo.name === 'Destroyer') this.addMinion();
        if (this.ufo.name === 'Paladin') this.abilityState.charge = 0;
    }
    setupFusedShip() { this.ufo = { name: "Fusion", color: '#ff00ff' }; this.models = gameState.fusionConfig; gameState.fusionConfig.forEach(key => this.abilities[key] = true); if (gameState.isCombineAllActive) { Object.keys(UFO_TYPES).forEach(key => this.abilities[key] = true); this.ufo.name = "Chimera"; this.models = ['interceptor']; } let totalHealth = 0, totalFireRate = 0, minionCount = 0, shieldCount = 0; const sources = gameState.isCombineAllActive ? Object.keys(UFO_TYPES).filter(k => k !== 'omega') : gameState.fusionConfig; sources.forEach(key => { const ufo = UFO_TYPES[key]; totalHealth += ufo.name === 'Juggernaut' ? 6 : 3; totalFireRate += ufo.fireRate; if (ufo.name === 'Destroyer') minionCount++; if (ufo.name === 'Sentinel') shieldCount++; }); this.baseHealth = Math.max(1, Math.round(totalHealth / sources.length)); this.health = this.baseHealth; this.baseFireRate = totalFireRate / sources.length; this.shield = shieldCount; for(let i=0; i < minionCount; i++) this.addMinion(); if (this.abilities.paladin) this.abilityState.charge = 0; }
    setupOmegaShip() {
        this.ufo = UFO_TYPES.omega; this.models = ['interceptor']; Object.keys(UFO_TYPES).forEach(key => this.abilities[key] = true);
        this.baseHealth = 6 * 2; this.health = this.baseHealth; this.baseFireRate = UFO_TYPES.omega.fireRate;
        this.shield = 1; this.addMinion(); this.abilityState.charge = 0;
    }
    update() {
        if (this.abilityState.cooldown > 0) this.abilityState.cooldown--;
        if (this.abilities.spectre) gameState.spectreTimer = (gameState.spectreTimer + 1) % 600; else gameState.spectreTimer = 0;
        if ((gameState.selectedUFO === 'omega' || gameState.isCombineAllActive) && gameState.gameFrame % 60 === 0) { const allModels = Object.keys(SHIP_MODELS); this.models = [allModels[Math.floor(Math.random() * allModels.length)]]; }
        
        const MOUSE_Y_OFFSET = 80; // Player ship vertical offset
        const targetX = gameState.mouse.x; const targetY = gameState.mouse.y - MOUSE_Y_OFFSET;
        this.velocityX = (targetX - this.x) * (this.abilityState.name === 'juggernaut' ? 0.3 : 0.1);
        this.velocityY = (targetY - this.y) * (this.abilityState.name === 'juggernaut' ? 0.3 : 0.1);
        this.x += this.velocityX; this.y += this.velocityY;

        const areaPadding = 5; if (this.x < areaPadding) this.x = areaPadding; if (this.x > gameState.screenWidth - areaPadding) this.x = gameState.screenWidth - areaPadding; if (this.y < areaPadding) this.y = areaPadding; if (this.y > gameState.screenHeight - areaPadding) this.y = gameState.screenHeight - areaPadding;
        this.angleY += 0.02;

        this.shootCooldown--;
        const berserkerBonus = this.abilities.berserker ? (this.baseHealth - this.health) : 0;
        const bloodRageBonus = (this.abilityState.name === 'berserker' && this.abilityState.active) ? 5 : 0;
        let finalFireRate = this.baseFireRate - (gameState.upgrades.fireRate.level * 0.5) - berserkerBonus - bloodRageBonus;
        if (this.abilityState.name === 'interceptor' && this.abilityState.active) finalFireRate /= 3;
        if (this.shootCooldown <= 0) { this.shoot(); this.shootCooldown = Math.max(2, finalFireRate); }
        
        this.minions.forEach((m, i) => m.update(i)); gameState.turrets.forEach(t => t.update());
        if (this.abilities.vortex && !this.abilityState.active) { gameState.powerups.forEach(p => { const dx = this.x - p.x; const dy = this.y - p.y; const dist = Math.hypot(dx, dy); if (dist < 100) { p.x += dx/dist * 2; p.y += dy/dist * 2; }}); }

        if (gameState.isAbilityHeld) { this.handleAbility(); } else { this.releaseAbility(); }
        this.updateAbility();
    }
    draw() {
        this.drawAbility(); this.minions.forEach(m => m.draw()); gameState.turrets.forEach(t => t.draw());
        const baseModelKey = this.models[0]; const baseModel = SHIP_MODELS[baseModelKey]; let baseColor = (UFO_TYPES[baseModelKey] || this.ufo).color;
        if (gameState.selectedUFO === 'omega' || gameState.isCombineAllActive) { const r = Math.round(128 + Math.sin(gameState.gameFrame * 0.05) * 127); const g = Math.round(128 + Math.sin(gameState.gameFrame * 0.05 + 2) * 127); const b = Math.round(128 + Math.sin(gameState.gameFrame * 0.05 + 4) * 127); baseColor = `rgb(${r},${g},${b})`; }
        let isIntangible = gameState.ghostTimer > 0 || (this.abilities.spectre && gameState.spectreTimer > 480) || (this.abilityState.name === 'ghost' && this.abilityState.active) || (this.abilityState.name === 'juggernaut' && this.abilityState.active);
        if (isIntangible) baseColor = `rgba(240, 249, 255, 0.5)`;
        for(let i = 1; i < this.models.length; i++) { const ghostModelKey = this.models[i], ghostModel = SHIP_MODELS[ghostModelKey], ghostColor = UFO_TYPES[ghostModelKey].color; projectAndDrawWireframe(ghostModel, this.x, this.y, this.size, {x:this.angleX, y:this.angleY + i*0.5, z:this.angleZ}, `rgba(${parseInt(ghostColor.slice(1,3),16)},${parseInt(ghostColor.slice(3,5),16)},${parseInt(ghostColor.slice(5,7),16)},0.3)`, 1); }
        projectAndDrawWireframe(baseModel, this.x, this.y, this.size, {x:this.angleX, y:this.angleY, z:this.angleZ}, baseColor, 2);
        if (this.shield > 0 && !isIntangible) { ctx.beginPath(); ctx.arc(this.x, this.y, this.size + 10, 0, Math.PI * 2); ctx.strokeStyle = `rgba(96, 165, 250, ${0.5 + Math.min(this.shield, 5) * 0.1})`; ctx.lineWidth = 1 + Math.min(this.shield, 4); ctx.stroke(); }
    }
    shoot() {
        sfx.shoot.triggerAttackRelease('C6', '32n');
        let damage = 1; if (this.reaperBoost > 0) damage += 1; if (this.abilityState.name === 'berserker' && this.abilityState.active) damage += 2;
        const newBullets = [];
        newBullets.push(new Bullet(this.x, this.y, 0, -8, this.ufo.color, damage));
        if (this.abilities.warlock) newBullets.push(new HomingBullet(this.x, this.y, 0, -5, UFO_TYPES.warlock.color, damage, 450));
        if (this.abilities.chronomancer) newBullets.forEach(b => { if (Math.random() < 0.2) b.canSlow = true; });
        gameState.playerBullets.push(...newBullets);
    }
    hit() {
        let isIntangible = gameState.ghostTimer > 0 || (this.abilities.spectre && gameState.spectreTimer > 480) || (this.abilityState.name === 'ghost' && this.abilityState.active) || (this.abilityState.name === 'juggernaut' && this.abilityState.active);
        if (isIntangible) return;
        if (this.abilities.paladin && this.abilityState.charge < 10) { this.abilityState.charge = Math.min(10, this.abilityState.charge + 1); sfx.powerup.triggerAttackRelease('A5', '32n'); return; }
        sfx.playerHit.triggerAttackRelease("A3", "8n"); triggerScreenShake(8, 20);
        if (this.abilities.ghost) gameState.ghostTimer = 120;
        if (this.shield > 0) { this.shield--; return; }
        this.health--;
    }
    useBomb() { if (this.bombs > 0) { this.bombs--; sfx.bigExplosion.triggerAttackRelease(0.5); triggerScreenShake(30, 60); gameState.enemyBullets = []; for (let i = gameState.enemies.length - 1; i >= 0; i--) { const enemy = gameState.enemies[i]; if (enemy.takeDamage(10000)) { createExplosion(enemy.x, enemy.y, enemy.color, 10); let creditDrop = 5; if (this.abilities.alchemist && Math.random() < 0.25) creditDrop = 25; addScore(100); gameState.waveCredits += creditDrop; if (this.abilities.reaper) this.reaperBoost = 120; gameState.enemies.splice(i, 1); } } if (gameState.currentBoss) gameState.currentBoss.takeDamage(25); } }
    addMinion() { this.minions.push(new Minion(this)); }
    handleAbility() {
        if (this.abilityState.active || this.abilityState.cooldown > 0) return;
        let abilityToUse = gameState.selectedUFO;
        if (gameState.selectedUFO === 'omega' || gameState.isCombineAllActive) { abilityToUse = this.models[0]; } 
        else if (gameState.gameMode === 'fusion' && gameState.fusionConfig.length > 0) { const fusedAbilities = Object.keys(this.abilities); if (fusedAbilities.length > 0) { this.abilityState.cycleIndex = (this.abilityState.cycleIndex + 1) % fusedAbilities.length; abilityToUse = fusedAbilities[this.abilityState.cycleIndex]; } }
        if (this.abilities[abilityToUse]) {
            if ((abilityToUse === 'paladin' && this.abilityState.charge < 10) || (abilityToUse === 'sentinel' && this.shield <= 0) || (abilityToUse === 'phoenix' && this.phoenixUsed)) return;
            this.abilityState.name = abilityToUse; this.abilityState.active = true; this.abilityState.duration = 0; ui.abilityButton.classList.add('active');
        }
    }
    releaseAbility() { if (this.abilityState.name === 'warlock' && this.abilityState.active) { const chargeLevel = Math.min(10, Math.floor(this.abilityState.duration / 15)); for(let i=0; i < chargeLevel; i++) { const angle = (i / chargeLevel) * Math.PI*2; gameState.playerBullets.push(new HomingBullet(this.x, this.y, Math.cos(angle)*4, Math.sin(angle)*4, UFO_TYPES.warlock.color, 2, 600));}} this.abilityState.active = false; ui.abilityButton.classList.remove('active'); }
    updateAbility() { if (!this.abilityState.active) { ui.abilityChargeUI.style.display = 'none'; return; } const state = this.abilityState; state.duration++; ui.abilityChargeUI.style.display = 'block'; ui.abilityChargeEl.textContent = state.name; switch(state.name) { case 'paladin': sfx.laser.triggerAttack(); gameState.playerBullets.push(new Bullet(this.x, this.y - 20, 0, -20, UFO_TYPES.paladin.color, 0.5)); if(state.duration > 300) {this.releaseAbility(); this.abilityState.charge = 0;} break; case 'sentinel': if(state.duration ===