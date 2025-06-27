document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    // Populate ufos array from global ufos (from ufoData.js)
    ufos.push(...window.ufos);

    // --- Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.getElementById('game-wrapper');

    // --- Three.js Setup ---
    const threeJsContainer = document.getElementById('threeJsContainer');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    threeJsContainer.appendChild(renderer.domElement);
    const enemyMeshes = new THREE.Group();
    const bossMeshes = new THREE.Group();
    const obstacleMeshes = new THREE.Group();
    scene.add(enemyMeshes);
    scene.add(bossMeshes);
    scene.add(obstacleMeshes);
    camera.position.z = 5;

    // --- UI Elements ---

    const scoreEl = document.getElementById('score'), highScoreEl = document.getElementById('highScore'), healthEl = document.getElementById('health'), shieldEl = document.getElementById('shield'), creditsEl = document.getElementById('credits'), bombsEl = document.getElementById('bombs');
    const abilityChargeUI = document.getElementById('abilityChargeUI'), abilityChargeEl = document.getElementById('abilityCharge');
    const modalContainer = document.getElementById('modalContainer'), startScreen = document.getElementById('startScreen'), pauseScreen = document.getElementById('pauseScreen'), gameOverScreen = document.getElementById('gameOverScreen'), hangarScreen = document.getElementById('hangarScreen'), inGameShop = document.getElementById('inGameShop'), devScreen = document('devScreen');
    const pauseButton = document.getElementById('pauseButton'), startButton = document.getElementById('startButton'), resumeButton = document.getElementById('resumeButton'), restartButton = document.getElementById('restartButton'), hangarButton = document.getElementById('hangarButton'), hangarBackButton = document.getElementById('hangarBackButton'), quitButton = document.getElementById('quitButton'), continueButton = document.getElementById('continueButton'), devButton = document.getElementById('devButton'), resetProgressButton = document.getElementById('resetProgressButton'), gameTitle = document.getElementById('gameTitle');
    const finalScoreEl = document.getElementById('finalScore'), creditsEarnedEl = document.getElementById('creditsEarned'), materialsFoundEl = document.getElementById('materialsFound'), shopCreditsEl = document.getElementById('shopCredits'), shopItemsEl = document.getElementById('shopItems');
    const bossHealthBarContainer = document.getElementById('bossHealthBarContainer'), bossHealthEl = document.getElementById('bossHealth'), bossNameEl = document.getElementById('bossName');
    const bottomUiContainer = document.getElementById('bottomUiContainer');
    const audioStatusEl = document.getElementById('audio-status');
    const hangarView = document.getElementById('hangarView'), hangarViewHeader = document.getElementById('hangarViewHeader'), hangarCreditsEl = document.getElementById('hangarCredits'), hangarMaterialsEl = document.getElementById('hangarMaterials'), sellMaterialButton = document.getElementById('sellMaterialButton'), metaGrid = document.getElementById('metaGrid'), upgradeGrid = document.getElementById('upgradeGrid'), hangarShipSelector = document.getElementById('hangarShipSelector'), toFusionLabButton = document.getElementById('toFusionLabButton');
    const fusionLabView = document.getElementById('fusionLabView'), fusionLabViewHeader = document.getElementById('fusionLabViewHeader'), fusionCreditsEl = document.getElementById('fusionCredits'), fusionSlotsAvailableEl = document.getElementById('fusionSlotsAvailable'), fusionSlotsContainer = document.getElementById('fusionSlotsContainer'), fusionShipSource = document.getElementById('fusionShipSource'), toHangarButton = document.getElementById('toHangarButton'), clearFusionButton = document.getElementById('clearFusionButton'), combineAllButton = document.getElementById('combineAllButton'), gameModeInfoEl = document.getElementById('gameModeInfo');
    const pauseStarCreditsEl = document.getElementById('pauseStarCredits'), pauseShipSelectorEl = document.getElementById('pauseShipSelector'), pauseUpgradeGridEl = document.getElementById('pauseUpgradeGrid'), pauseBuyGridEl = document.getElementById('pauseBuyGrid');
    const devScoreInput = document.getElementById('devScoreInput'), devSetScoreButton = document.getElementById('devSetScoreButton'), devCreditsInput = document.getElementById('devCreditsInput'), devSetCreditsButton = document.getElementById('devSetCreditsButton'), devMaterialsInput = document.getElementById('devMaterialsInput'), devSetMaterialsButton = document.getElementById('devSetMaterialsButton'), devUnlockAllButton = document.getElementById('devUnlockAllButton'), devBackButton = document.getElementById('devBackButton');
    
    // --- Game State ---
    const MOUSE_Y_OFFSET = 80; // Player ship vertical offset
    let screenWidth, screenHeight, player, stars, powerups, obstacles;
    let playerBullets = [], enemyBullets = [], enemies = [], particles = [], turrets = [];
    let score = 0, highScore = parseInt(localStorage.getItem('highScore') || '0');
    let starCredits = parseInt(localStorage.getItem('starCredits') || '0');
    let rawMaterials = parseInt(localStorage.getItem('rawMaterials') || '0');
    let materialsThisRun = 0;
    let hasPurchasedScoreBoost = JSON.parse(localStorage.getItem('hasPurchasedScoreBoost') || 'false');
    let spawnMultiplier = parseInt(localStorage.getItem('spawnMultiplier') || '1');
    let isPaused = true, isGameOver = false, gameFrame = 0, waveCount = 0;
    let waveCredits = 0, bombPurchaseCost = 500, healthPurchaseCost = 500, shieldPurchaseCost = 750;
    let mouse = { x: 0, y: 0 }, currentBoss = null;
    let scoreMultiplier = 1, ghostTimer = 0, spectreTimer = 0;
    let isAbilityHeld = false;
    let screenShake = { intensity: 0, duration: 0 };
    let uiState = { score: -1, health: -1, shield: -1, credits: -1, bombs: -1, highScore: -1, ability: -1 };
    let gameMode = localStorage.getItem('gameMode') || 'classic';
    let fusionConfig = JSON.parse(localStorage.getItem('fusionConfig') || '[]');
    let isCombineAllActive = JSON.parse(localStorage.getItem('isCombineAllActive') || 'false');
    let shopCosts;
    let musicInitialized = false;
    let normalMusicLoop, bossMusicLoop;
    let titleClickCount = 0;
    
    // --- SFX & Music (lazy initialized) ---
    const sfx = {};
    function initAudio() {
        if(musicInitialized) return;
        const reverb = new Tone.Reverb(1.5).toDestination();
        sfx.shoot = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 }, volume: -22 }).toDestination();
        sfx.laser = new Tone.Synth({ oscillator: { type: 'sawtooth' }, filter: { type: 'lowpass', frequency: 3000 }, envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.2 }, volume: -15 }).toDestination();
        sfx.enemyShoot = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }, volume: -27 }).toDestination();
        sfx.explosion = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 }, volume: -17 }).toDestination();
        sfx.bigExplosion = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0 }, volume: -12 }).toDestination();
        sfx.playerHit = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 5, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 1 }, volume: -10 }).toDestination();
        sfx.powerup = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 }, volume: -12 }).toDestination();
        sfx.unlock = new Tone.PolySynth(Tone.Synth, { volume: -8 }).toDestination();
        sfx.buy = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 }, volume: -12 }).toDestination();
        sfx.charge = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 0.2 }, volume: -20 }).toDestination();
        sfx.blackhole = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 2, decay: 1, sustain: 1, release: 2 }, volume: -15 }).connect(reverb);
        const normalMusicSynth = new Tone.FMSynth({ modulationIndex: 10, harmonicity: 3, envelope: { attack: 2, decay: 1, sustain: 0.5, release: 4 }, volume: -25 }).connect(reverb);
        const bossMusicSynth = new Tone.AMSynth({ harmonicity: 1.5, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }, volume: -20 }).toDestination();
        normalMusicLoop = new Tone.Sequence((time, note) => { normalMusicSynth.triggerAttackRelease(note, '2n', time); }, ['C2', 'G2', 'Eb2', 'Bb2'], '1m').start(0);
        bossMusicLoop = new Tone.Sequence((time, note) => { bossMusicSynth.triggerAttackRelease(note, '16n', time); }, ['C3', null, 'C#3', 'C3', 'G2', null, 'G#2', null], '4n').start(0);
        normalMusicLoop.humanize = bossMusicLoop.humanize = true;
        musicInitialized = true;
    }
    
    // --- Persistent Upgrades ---
    const defaultUpgrades = { startShield: { level: 0, maxLevel: 10, cost: 100, costIncrease: 150, matCost: 1, matIncrease: 1, name: "Start Shield" }, startMinion: { level: 0, maxLevel: 10, cost: 500, costIncrease: 500, matCost: 5, matIncrease: 2, name: "Start Minion" }, fireRate: { level: 0, maxLevel: 10, cost: 250, costIncrease: 250, matCost: 2, matIncrease: 2, name: "Fire Rate" }, startBomb: { level: 0, maxLevel: 10, cost: 750, costIncrease: 750, matCost: 3, matIncrease: 1, name: "Start Bomb" }, powerupDuration: { level: 0, maxLevel: 10, cost: 400, costIncrease: 400, matCost: 2, matIncrease: 1, name: "Powerup Duration" }, creditBonus: { level: 0, maxLevel: 10, cost: 1000, costIncrease: 1000, matCost: 10, matIncrease: 5, name: "Credit Bonus" } };
    let upgrades = JSON.parse(localStorage.getItem('upgrades')) || JSON.parse(JSON.stringify(defaultUpgrades));

    // --- Game Data ---
    // SHIP_MODELS, ENEMY_MODELS, BOSS_MODEL_1, BOSS_MODEL_2, ASTEROID_MODEL are no longer used for rendering directly
    // They are replaced by geometries from ufoData.js
    const UFO_TYPES = {
        interceptor: { name: 'Interceptor', color: '#34d399', fireRate: 10, ability: 'Hold for Rapid Fire burst.', model: 'scout' },
        destroyer:   { name: 'Destroyer', unlockMethod: 'score', unlockScore: 5000, color: '#f59e0b', fireRate: 8, ability: 'Starts with 1 Minion. Hold for homing minion fire.', model: 'destroyer' },
        sentinel:    { name: 'Sentinel', unlockMethod: 'score', unlockScore: 15000, color: '#60a5fa', fireRate: 10, ability: 'Starts with +1 Shield. Hold to consume a shield for a defensive nova.', model: 'ufo7' }, // Dodeca Defender
        ghost:       { name: 'Ghost', unlockMethod: 'score', unlockScore: 30000, color: '#f0f9ff', fireRate: 10, ability: 'Brief invincibility after hit. Hold to manually phase out.', model: 'ufo6' }, // Tetra Blitz
        warlock:     { name: 'Warlock', unlockMethod: 'score', unlockScore: 50000, color: '#c084fc', fireRate: 10, ability: 'Fires homing shots. Hold to charge a powerful homing missile swarm.', model: 'ufo17' }, // Spiral Phantom
        juggernaut:  { name: 'Juggernaut', unlockMethod: 'score', unlockScore: 75000, color: '#fca5a5', fireRate: 10, ability: 'Starts with 6 HP. Hold for a brief, invincible ramming charge.', model: 'ufo13' }, // Astral Fortress
        vortex:      { name: 'Vortex', unlockMethod: 'score', unlockScore: 100000, color: '#2dd4bf', fireRate: 10, ability: 'Pulls in powerups. Hold to create a bullet-sucking singularity.', model: 'ufo40' }, // Tracker Nebula
        reaper:      { name: 'Reaper', unlockMethod: 'score', unlockScore: 150000, color: '#9ca3af', fireRate: 9, ability: 'Hold to create a field that converts enemies and bullets into Raw Materials.', model: 'ufo28' }, // Spiral Wraith
        paladin:     { name: 'Paladin', unlockMethod: 'credits', cost: 2500, color: '#fde047', fireRate: 10, ability: 'Absorbs shots to charge laser. Hold to fire continuous laser beam.', model: 'ufo23' }, // Laser Sentinel
        spectre:     { name: 'Spectre', unlockMethod: 'credits', cost: 4000, color: '#a5f3fc', fireRate: 10, ability: 'Periodically intangible. Hold to charge a short-range teleport.', model: 'ufo11' }, // Wave Rider
        alchemist:   { name: 'Alchemist', unlockMethod: 'credits', cost: 5000, color: '#d946ef', fireRate: 10, ability: 'Hold to transmute nearby bullets to credits & give kills a chance to drop powerups.', model: 'ufo43' }, // Triad Monarch
        engineer:    { name: 'Engineer', unlockMethod: 'credits', cost: 7500, color: '#f97316', fireRate: 10, ability: 'Hold to deploy a temporary, mobile Sentry that follows you.', model: 'ufo32' }, // Triad Vanguard
        chronomancer:{ name: 'Chronomancer', unlockMethod: 'credits', cost: 10000, color: '#818cf8', fireRate: 10, ability: 'Shots can slow enemies. Hold to create a large time-slowing field.', model: 'ufo35' }, // Ripple Enigma
        berserker:   { name: 'Berserker', unlockMethod: 'credits', cost: 6000, color: '#ef4444', fireRate: 10, ability: 'Fire rate increases as health drops. Hold to sacrifice health for a massive damage boost.', model: 'ufo27' }, // Arc Predator
        phoenix:     { name: 'Phoenix', unlockMethod: 'credits', cost: 12000, color: '#fdba74', fireRate: 10, ability: 'Revives once. Hold to consume revive for a screen-clearing nova, full heal, & invincibility.', model: 'ufo12' }, // Nova Bomber
        omega:       { name: 'Omega', unlockMethod: 'credits', cost: 999999999999, color: '#ffffff', fireRate: 5, ability: 'The ultimate form. All abilities, double health & fire rate. Hold to cycle abilities.', model: 'mothership' }
    };
    let selectedUFO = localStorage.getItem('selectedUFO') || 'interceptor';
    let unlockedUFOs = new Set(JSON.parse(localStorage.getItem('unlockedUFOs')) || ['interceptor']);

    const ENEMY_UFO_MAP = {
        grunt: 'ufo4', dasher: 'ufo5', tank: 'ufo8', weaver: 'ufo9', dodger: 'ufo10',
        splitter: 'ufo14', sniper: 'ufo15', kamikaze: 'ufo16', orbiter: 'ufo18', stealth: 'ufo19'
    };

    const BOSS_UFO_MAP = {
        GOLIATH: 'ufo49', // Crimson Halo
        BEHEMOTH: 'ufo50' // Vortex Emperor
    };

    const ASTEROID_UFO_MODEL = 'ufo48'; // Swift Nebula
    
    // --- Entity Classes ---
    class Player {
        constructor() { this.x = 0; this.y = 0; this.reset(); }
        reset() {
            this.x = screenWidth / 2; this.y = screenHeight - 100 - MOUSE_Y_OFFSET;
            this.size = 20; this.angleX = 0; this.angleY = 0; this.angleZ = 0; this.velocityX = 0; this.velocityY = 0;
            this.shootCooldown = 0; this.minions = []; turrets = []; this.reaperBoost = 0; this.phoenixUsed = false;
            this.abilities = {}; this.models = [];
            this.abilityState = { name: null, active: false, charge: 0, duration: 0, cooldown: 0, cycleIndex: 0 };
            
            if (selectedUFO === 'omega') { this.setupOmegaShip(); }
            else if (gameMode === 'fusion' && (fusionConfig.length > 0 || isCombineAllAllActive)) { this.setupFusedShip(); }
            else { this.setupClassicShip(); }

            this.shield += upgrades.startShield.level; this.bombs = upgrades.startBomb.level;
            for (let i = 0; i < upgrades.startMinion.level; i++) this.addMinion();
        }
        setupClassicShip() {
            this.ufo = UFO_TYPES[selectedUFO];
            this.models = [this.ufo.model];
            this.abilities[selectedUFO] = true;
            this.baseHealth = this.ufo.name === 'Juggernaut' ? 6 : 3; this.health = this.baseHealth;
            this.shield = this.ufo.name === 'Sentinel' ? 1 : 0; this.baseFireRate = this.ufo.fireRate;
            if (this.ufo.name === 'Destroyer') this.addMinion();
            if (this.ufo.name === 'Paladin') this.abilityState.charge = 0;
            const ufoData = ufos.find(u => u.id === this.ufo.model);
            this.mesh = new THREE.Mesh(ufoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...ufoData.colors) }));
            scene.add(this.mesh);
        }
        setupFusedShip() {
            this.ufo = { name: "Fusion", color: '#ff00ff' };
            this.models = fusionConfig.map(key => UFO_TYPES[key].model);
            fusionConfig.forEach(key => this.abilities[key] = true);
            if (isCombineAllActive) {
                Object.keys(UFO_TYPES).forEach(key => this.abilities[key] = true);
                this.ufo.name = "Chimera";
                this.models = ['interceptor']; // Default model for Chimera
            }
            let totalHealth = 0, totalFireRate = 0, minionCount = 0, shieldCount = 0;
            const sources = isCombineAllActive ? Object.keys(UFO_TYPES).filter(k => k !== 'omega') : fusionConfig;
            sources.forEach(key => {
                const ufo = UFO_TYPES[key];
                totalHealth += ufo.name === 'Juggernaut' ? 6 : 3;
                totalFireRate += ufo.fireRate;
                if (ufo.name === 'Destroyer') minionCount++;
                if (ufo.name === 'Sentinel') shieldCount++;
            });
            this.baseHealth = Math.max(1, Math.round(totalHealth / sources.length));
            this.health = this.baseHealth;
            this.baseFireRate = totalFireRate / sources.length;
            this.shield = shieldCount;
            for(let i=0; i < minionCount; i++) this.addMinion();
            if (this.abilities.paladin) this.abilityState.charge = 0;

            const baseUfoData = ufos.find(u => u.id === (isCombineAllActive ? 'scout' : UFO_TYPES[fusionConfig[0]].model));
            this.mesh = new THREE.Mesh(baseUfoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...baseUfoData.colors) }));
            scene.add(this.mesh);
        }
        setupOmegaShip() {
            this.ufo = UFO_TYPES.omega;
            this.models = [UFO_TYPES.omega.model]; // Use the model defined for omega
            Object.keys(UFO_TYPES).forEach(key => this.abilities[key] = true);
            this.baseHealth = 6 * 2; this.health = this.baseHealth; this.baseFireRate = UFO_TYPES.omega.fireRate;
            this.shield = 1; this.addMinion(); this.abilityState.charge = 0;
            const ufoData = ufos.find(u => u.id === this.ufo.model);
            this.mesh = new THREE.Mesh(ufoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...ufoData.colors) }));
            scene.add(this.mesh);
        }
        update() {
            if (this.abilityState.cooldown > 0) this.abilityState.cooldown--;
            if (this.abilities.spectre) spectreTimer = (spectreTimer + 1) % 600; else spectreTimer = 0;
            if ((selectedUFO === 'omega' || isCombineAllActive) && gameFrame % 60 === 0) {
                // For Omega or Combined, cycle through all available UFO models for visual effect
                const allUfoModels = ufos.map(u => u.id);
                this.models = [allUfoModels[Math.floor(Math.random() * allUfoModels.length)]];
                // Update mesh if model changes
                if (this.mesh) {
                    scene.remove(this.mesh);
                    const newUfoData = ufos.find(u => u.id === this.models[0]);
                    this.mesh = new THREE.Mesh(newUfoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...newUfoData.colors) }));
                    scene.add(this.mesh);
                }
            }

            const targetX = mouse.x; const targetY = mouse.y - MOUSE_Y_OFFSET;
            this.velocityX = (targetX - this.x) * (this.abilityState.name === 'juggernaut' ? 0.3 : 0.1);
            this.velocityY = (targetY - this.y) * (this.abilityState.name === 'juggernaut' ? 0.3 : 0.1);
            this.x += this.velocityX; this.y += this.velocityY;

            const areaPadding = 5; if (this.x < areaPadding) this.x = areaPadding; if (this.x > screenWidth - areaPadding) this.x = screenWidth - areaPadding; if (this.y < areaPadding) this.y = areaPadding; if (this.y > screenHeight - areaPadding) this.y = screenHeight - areaPadding;
            this.angleY += 0.02;

            this.shootCooldown--;
            const berserkerBonus = this.abilities.berserker ? (this.baseHealth - this.health) : 0;
            const bloodRageBonus = (this.abilityState.name === 'berserker' && this.abilityState.active) ? 5 : 0;
            let finalFireRate = this.baseFireRate - (upgrades.fireRate.level * 0.5) - berserkerBonus - bloodRageBonus;
            if (this.abilityState.name === 'interceptor' && this.abilityState.active) finalFireRate /= 3;
            if (this.shootCooldown <= 0) { this.shoot(); this.shootCooldown = Math.max(2, finalFireRate); }
            
            this.minions.forEach((m, i) => m.update(i)); turrets.forEach(t => t.update());
            if (this.abilities.vortex && !this.abilityState.active) { powerups.forEach(p => { const dx = this.x - p.x; const dy = p.y; const dist = Math.hypot(dx, dy); if (dist < 100) { p.x += dx/dist * 2; p.y += dy/dist * 2; }}); }

            if (isAbilityHeld) { this.handleAbility(); } else { this.releaseAbility(); }
            this.updateAbility();
        }
        draw() {
            this.drawAbility(); this.minions.forEach(m => m.draw()); turrets.forEach(t => t.draw());
            // Player UFO rendering (moved to Player class for better encapsulation)
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0); // Convert screen coords to Three.js coords
            this.mesh.rotation.x = this.angleX;
            this.mesh.rotation.y = this.angleY;
            this.mesh.rotation.z = this.angleZ;

            let isIntangible = ghostTimer > 0 || (this.abilities.spectre && spectreTimer > 480) || (this.abilityState.name === 'ghost' && this.abilityState.active) || (this.abilityState.name === 'juggernaut' && this.abilityState.active);
            if (this.shield > 0 && !isIntangible) {
                if (!this.shieldMesh) {
                    const geometry = new THREE.SphereGeometry(this.size * 1.5, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.5 });
                    this.shieldMesh = new THREE.Mesh(geometry, material);
                    scene.add(this.shieldMesh);
                }
                this.shieldMesh.position.copy(this.mesh.position);
                this.shieldMesh.scale.setScalar(1 + Math.min(this.shield, 5) * 0.1);
                this.shieldMesh.material.opacity = 0.5 + Math.min(this.shield, 5) * 0.1;
                this.shieldMesh.visible = true;
            } else {
                if (this.shieldMesh) {
                    this.shieldMesh.visible = false;
                }
            }
        }
        shoot() {
            sfx.shoot.triggerAttackRelease('C6', '32n');
            let damage = 1; if (this.reaperBoost > 0) damage += 1; if (this.abilityState.name === 'berserker' && this.abilityState.active) damage += 2;
            const newBullets = [];
            newBullets.push(new Bullet(this.x, this.y, 0, -8, this.ufo.color, damage));
            if (this.abilities.warlock) newBullets.push(new HomingBullet(this.x, this.y, 0, -5, UFO_TYPES.warlock.color, damage, 450));
            if (this.abilities.chronomancer) newBullets.forEach(b => { if (Math.random() < 0.2) b.canSlow = true; });
            playerBullets.push(...newBullets);
        }
        hit() {
            let isIntangible = ghostTimer > 0 || (this.abilities.spectre && spectreTimer > 480) || (this.abilityState.name === 'ghost' && this.abilityState.active) || (this.abilityState.name === 'juggernaut' && this.abilityState.active);
            if (isIntangible) return;
            if (this.abilities.paladin && this.abilityState.charge < 10) { this.abilityState.charge = Math.min(10, this.abilityState.charge + 1); sfx.powerup.triggerAttackRelease("A5", "32n"); return; }
            sfx.playerHit.triggerAttackRelease("A3", "8n"); triggerScreenShake(8, 20);
            if (this.abilities.ghost) ghostTimer = 120;
            if (this.shield > 0) { this.shield--; return; }
            this.health--;
        }
        useBomb() {
            if (this.bombs > 0) {
                this.bombs--;
                sfx.bigExplosion.triggerAttackRelease(0.5);
                triggerScreenShake(30, 60);
                enemyBullets = [];
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const enemy = enemies[i];
                    if (enemy.takeDamage(10000)) {
                        createExplosion(enemy.x, enemy.y, enemy.color, 10);
                        let creditDrop = 5;
                        if (this.abilities.alchemist && Math.random() < 0.25) creditDrop = 25;
                        addScore(100);
                        waveCredits += creditDrop;
                        if (this.abilities.reaper) this.reaperBoost = 120;
                        enemies.splice(i, 1);
                    }
                }
                if (currentBoss) {
                    if (currentBoss.takeDamage(25)) { // Use the modified takeDamage for boss
                        createExplosion(currentBoss.x, currentBoss.y, currentBoss.color, 80);
                        addScore(5000);
                        waveCredits += 250;
                        materialsThisRun += 10;
                        currentBoss = null;
                        bossHealthBarContainer.style.display = 'none';
                        startMusic(false);
                        showInGameShop();
                    }
                }
            }
        }
        addMinion() { this.minions.push(new Minion(this)); }
        handleAbility() {
            if (this.abilityState.active || this.abilityState.cooldown > 0) return;
            let abilityToUse = selectedUFO;
            if (selectedUFO === 'omega' || isCombineAllActive) { abilityToUse = this.models[0]; } 
            else if (gameMode === 'fusion' && fusionConfig.length > 0) { const fusedAbilities = Object.keys(this.abilities); if (fusedAbilities.length > 0) { this.abilityState.cycleIndex = (this.abilityState.cycleIndex + 1) % fusedAbilities.length; abilityToUse = fusedAbilities[this.abilityState.cycleIndex]; } }
            if (this.abilities[abilityToUse]) {
                if ((abilityToUse === 'paladin' && this.abilityState.charge < 10) || (abilityToUse === 'sentinel' && this.shield <= 0) || (abilityToUse === 'phoenix' && this.phoenixUsed)) return;
                this.abilityState.name = abilityToUse; this.abilityState.active = true; this.abilityState.duration = 0;
            }
        }
        releaseAbility() {
            if (this.abilityState.name === 'warlock' && this.abilityState.active) {
                const chargeLevel = Math.min(10, Math.floor(this.abilityState.duration / 15));
                for(let i=0; i < chargeLevel; i++) {
                    const angle = (i / chargeLevel) * Math.PI*2;
                    playerBullets.push(new HomingBullet(this.x, this.y, Math.cos(angle)*4, Math.sin(angle)*4, UFO_TYPES.warlock.color, 2, 600));
                }
            }
            this.abilityState.active = false;
        }
        updateAbility() {
            if (!this.abilityState.active) {
                abilityChargeUI.style.display = 'none';
                return;
            }
            const state = this.abilityState;
            state.duration++;
            abilityChargeUI.style.display = 'block';
            abilityChargeEl.textContent = state.name;
            switch(state.name) {
                case 'paladin': sfx.laser.triggerAttack(); playerBullets.push(new Bullet(this.x, this.y - 20, 0, -20, UFO_TYPES.paladin.color, 0.5)); if(state.duration > 300) {this.releaseAbility(); this.abilityState.charge = 0;} break;
                case 'sentinel': if(state.duration === 1) { createExplosion(this.x, this.y, UFO_TYPES.sentinel.color, 25); this.shield--; enemyBullets.forEach(b => {if(isColliding(this,b)) b.y = -999;});} if(state.duration > 10) this.releaseAbility(); break;
                case 'juggernaut': if(state.duration % 5 === 0) { playerBullets.push(new Bullet(this.x, this.y, -8, 0, UFO_TYPES.juggernaut.color, 2)); playerBullets.push(new Bullet(this.x, this.y, 8, 0, UFO_TYPES.juggernaut.color, 2)); } if(state.duration > 90) this.releaseAbility(); break;
                case 'vortex': enemyBullets.forEach(b => {const dx=this.x-b.x, dy=this.y-b.y, dist=Math.hypot(dx,dy); if(dist < 150){b.x+=dx/dist*4; b.y+=dy/dist*4; if(dist < 20) b.y = -999;}}); if(state.duration > 300) this.releaseAbility(); break;
                case 'alchemist': enemyBullets.forEach(b => {const dx=this.x-b.x, dy=this.y-b.y, dist=Math.hypot(dx,dy); if(dist < 80){ b.y=-999; waveCredits++;}}); if(state.duration > 300) this.releaseAbility(); break;
                case 'berserker': if(gameFrame % 30 == 0 && this.health > 1) {this.health--; createExplosion(this.x, this.y, UFO_TYPES.berserker.color, 2);} if(this.health <= 1 || state.duration > 180) this.releaseAbility(); break;
                case 'phoenix': if(state.duration === 1 && !this.phoenixUsed) {this.phoenixUsed=true; this.health = this.baseHealth; ghostTimer = 360; createExplosion(this.x, this.y, UFO_TYPES.phoenix.color, 30); sfx.unlock.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n');} this.releaseAbility(); break;
                case 'engineer': if(state.duration === 1) turrets.push(new Sentry(this)); this.releaseAbility(); break;
                case 'reaper': for (let i = enemies.length - 1; i >= 0; i--) { const e = enemies[i]; if (Math.hypot(this.x - e.x, this.y - e.y) < 200) { powerups.push(new RawMaterialPickup(e.x, e.y)); enemies.splice(i, 1); } } for (let i = enemyBullets.length - 1; i >= 0; i--) { const b = enemyBullets[i]; if (Math.hypot(this.x - b.x, this.y - b.y) < 200) { powerups.push(new RawMaterialPickup(b.x, b.y)); enemyBullets.splice(i, 1); }} if(state.duration > 180) this.releaseAbility(); break;
                default: if(state.duration > 120 && state.name !== 'warlock') this.releaseAbility(); break;
            }
        }
        drawAbility() { if(!this.abilityState.active) return; const {name, duration} = this.abilityState; if(name === 'chronomancer' || name === 'reaper') { const radius = name === 'reaper' ? 200 : 200; const color = name === 'reaper' ? `rgba(156, 163, 175, ${0.2 - (duration/180)*0.2})` : `rgba(129, 140, 248, ${0.2 - (duration/300)*0.2})`; ctx.beginPath(); ctx.arc(this.x, this.y, radius, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill(); } }
    }
    class Sentry {
        constructor(parent) {
            this.parent = parent;
            this.x = parent.x;
            this.y = parent.y;
            this.size = 12;
            this.shootCooldown = 20;
            this.lifespan = 300;
            this.color = UFO_TYPES.engineer.color;

            const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
            const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.color) });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);
        }
        update() {
            this.lifespan--;
            this.x += (this.parent.x - this.x) * 0.05;
            this.y += (this.parent.y - 20 - this.y) * 0.05;
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                playerBullets.push(new Bullet(this.x, this.y, 0, -8, this.color, 1));
                this.shootCooldown = 20;
            }
            if(this.lifespan <= 0) {
                scene.remove(this.mesh); // Remove mesh from scene
                turrets.splice(turrets.indexOf(this), 1);
            }
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
        }
        draw() {
            // No drawing needed, handled by Three.js in update
        }
    }
    class Minion {
        constructor(parent) {
            this.parent = parent;
            this.x = parent.x;
            this.y = parent.y;
            this.size = 8;
            this.angle = 0;
            this.orbitRadius = 50;
            this.shootCooldown = 60;
            this.color = '#a78bfa';

            const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
            const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.color) });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);
        }
        update(index) {
            this.angle += 0.03;
            const orbitAngle = this.angle + (index * (Math.PI * 2 / this.parent.minions.length));
            this.x = this.parent.x + Math.cos(orbitAngle) * this.orbitRadius;
            this.y = this.parent.y + Math.sin(orbitAngle) * this.orbitRadius;
            if (player && player.abilityState.name === 'destroyer' && player.abilityState.active) {
                if(this.shootCooldown <= 0) { playerBullets.push(new HomingBullet(this.x, this.y, 0, -6, this.color, 0.5)); this.shootCooldown = 45; }}
            else if (this.shootCooldown <= 0) {
                playerBullets.push(new Bullet(this.x, this.y, 0, -6, this.color, 1));
                this.shootCooldown = 75;
            }
            this.shootCooldown--;

            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
            this.mesh.rotation.z = -this.angle;
        }
        draw() {
            // No drawing needed, handled by Three.js in update
        }
    }
    class Bullet {
        constructor(x, y, speedX, speedY, color, damage = 1) {
            this.x = x; this.y = y; this.speedX = speedX; this.speedY = speedY; this.size = 5; this.color = color; this.damage = damage; this.canSlow = false;
            const geometry = new THREE.SphereGeometry(this.size / 2, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.color) });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);
        }
        update() {
            let timeMod = 1;
            if (player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200) { timeMod = 0.2; }
            this.x += this.speedX * timeMod;
            this.y += this.speedY * timeMod;
            if (gameFrame % 3 === 0) particles.push(new Particle(this.x, this.y, 0, this.speedY * 0.2, this.color, 2, 8));
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
        }
        draw() {
            // No drawing needed, handled by Three.js in update
        }
    }
    class HomingBullet extends Bullet {
        constructor(x, y, speedX, speedY, color, damage, range = 400) {
            super(x, y, speedX, speedY, color, damage);
            this.turnSpeed = 0.05; this.target = null; this.range = range;
        }
        update() {
            if (!this.target || enemies.indexOf(this.target) === -1) this.findTarget();
            if(this.target) {
                const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                const currentAngle = Math.atan2(this.speedY, this.speedX);
                let angleDiff = targetAngle - currentAngle;
                while (angleDiff > Math.PI) angleDiff -= 2*Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2*Math.PI;
                const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(this.turnSpeed, Math.abs(angleDiff));
                const speed = Math.hypot(this.speedX, this.speedY) + 0.1;
                this.speedX = Math.cos(newAngle) * speed;
                this.speedY = Math.sin(newAngle) * speed;
            }
            super.update();
        }
        findTarget() {
            let closestDist = Infinity;
            this.target = null;
            for(const enemy of enemies) {
                const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
                if (dist < closestDist && dist < this.range) {
                    closestDist = dist;
                    this.target = enemy;
                }
            }
        }
    }
    class Enemy { constructor(type = 'grunt', x = Math.random() * screenWidth, y = -30) {
        this.type = type;
        this.ufoData = ufos.find(u => u.id === ENEMY_UFO_MAP[type]);
        this.x = x; this.y = y; this.angleX = 0; this.angleY = 0; this.angleZ = 0; this.slowTimer = 0; this.phase = 0;
        const difficulty = Math.min(5, 1 + score/20000);
        switch(type) {
            case 'grunt': this.size = 20; this.color = '#f87171'; this.speedY = (Math.random()*1+1)*difficulty; this.speedX = (Math.random()-0.5)*4; this.health = 1 * difficulty; this.shootCooldown = Math.random()*100+50; break;
            case 'tank': this.size = 25; this.color = '#a1a1aa'; this.speedY = 1*difficulty; this.speedX = 0; this.health = 5 * difficulty; this.shootCooldown = 180; break;
            case 'dasher': this.size=15; this.color='#facc15'; this.speedY = 5*difficulty; this.speedX=0; this.health = 0.5 * difficulty; this.shootCooldown=999; break;
            case 'weaver': this.size=18; this.color='#a78bfa'; this.speedY = 2*difficulty; this.speedX=5; this.health = 1 * difficulty; this.shootCooldown=120; break;
            case 'dodger': this.size=18; this.color='#6ee7b7'; this.speedY = 1.5*difficulty; this.speedX=0; this.health = 2 * difficulty; this.shootCooldown=200; break;
            case 'orbiter': this.size=22; this.color='#fb923c'; this.speedY = 2*difficulty; this.speedX=0; this.health = 3 * difficulty; this.shootCooldown=30; this.targetY = Math.random()*screenHeight*0.4+50; break;
            case 'kamikaze': this.size=20; this.color='#fca5a5'; this.speedY = 2*difficulty; this.speedX=0; this.health = 1 * difficulty; this.shootCooldown=999; break;
            case 'sniper': this.size=15; this.color='#818cf8'; this.speedY = 1*difficulty; this.speedX=(Math.random()-0.5)*2; this.health = 2*difficulty; this.shootCooldown=150; break;
            case 'splitter': this.size=25; this.color='#f472b6'; this.speedY=1*difficulty; this.speedX=0; this.health=4*difficulty; this.shootCooldown=200; break;
            case 'stealth': this.size=16; this.color='#94a3b8'; this.speedY = 1.5*difficulty; this.speedX=Math.random()*2-1; this.health=2*difficulty; this.shootCooldown=100; break;
        }
        this.mesh = new THREE.Mesh(this.ufoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...this.ufoData.colors) }));
        enemyMeshes.add(this.mesh);
    }
        update() { let isSlowed = this.slowTimer > 0 || (player && player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200); if(isSlowed) this.slowTimer--; const speedMod = isSlowed ? 0.2 : 1; this.angleX += 0.01; this.angleY += 0.02; this.phase++; this.y += this.speedY * speedMod; switch(this.type){ case 'grunt': this.x += this.speedX * speedMod; if(this.x<0||this.x>screenWidth) this.speedX*=-1; break; case 'weaver': this.x += Math.sin(this.phase * 0.1) * this.speedX * speedMod; break; case 'dodger': const dx=mouse.x-this.x; if(Math.abs(dx)<100) this.x -= Math.sign(dx)*2*speedMod; break; case 'orbiter': if(this.y > this.targetY) { this.y = this.targetY; this.speedY=0; this.x += Math.cos(this.phase * 0.05) * 2 * speedMod; } break; case 'kamikaze': const angle = Math.atan2(player.y-this.y, player.x-this.x); this.x += Math.cos(angle)*this.speedY*speedMod; this.y += Math.sin(angle)*this.speedY*speedMod; break; case 'sniper': this.x += this.speedX * speedMod; if(this.x<0||this.x>screenWidth) this.speedX*=-1; break; case 'stealth': this.x += this.speedX * speedMod; if(this.x<0||this.x>screenWidth) this.speedX*=-1; break; } this.shootCooldown--; if(this.shootCooldown <= 0 && player) { switch(this.type) { case 'grunt': enemyBullets.push(new Bullet(this.x,this.y,0,5,this.color)); this.shootCooldown=120; break; case 'tank': for(let i=-1; i<=1; i++) enemyBullets.push(new Bullet(this.x,this.y, i*1.5, 5, this.color, 2)); this.shootCooldown=180; break; case 'orbiter': if(this.speedY === 0) {for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+this.phase*0.1; enemyBullets.push(new Bullet(this.x,this.y,Math.cos(a)*3,Math.sin(a)*3,this.color));} this.shootCooldown=60;} break; case 'sniper': const angle=Math.atan2(player.y-this.y, player.x-this.x); enemyBullets.push(new Bullet(this.x,this.y,Math.cos(angle)*8,Math.sin(angle)*8, this.color)); this.shootCooldown=150; break; default: enemyBullets.push(new Bullet(this.x,this.y,0,5,this.color)); this.shootCooldown=150; break;}}}
        draw() {
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
            this.mesh.rotation.x = this.angleX;
            this.mesh.rotation.y = this.angleY;
            this.mesh.rotation.z = this.angleZ;
            // Handle stealth enemy visibility
            if (this.type === 'stealth') {
                this.mesh.material.opacity = Math.sin(this.phase * 0.1) > 0 ? 0.2 : 1;
                this.mesh.material.transparent = true;
            } else {
                this.mesh.material.opacity = 1;
                this.mesh.material.transparent = false;
            }
        }
        takeDamage(amount) {
            this.health -= amount;
            if (this.health <= 0) {
                enemyMeshes.remove(this.mesh); // Remove mesh from scene
                return true;
            }
            return false;
        }
        onDeath(){ if(this.type==='splitter'){for(let i=0; i<3; i++) enemies.push(new Enemy('grunt', this.x, this.y));} if(player.abilities.alchemist && player.abilityState.active && Math.random() < 0.2) { powerups.push(new PowerUp(this.x, this.y)); }}
    }
    class Boss { constructor(bossType) {
        this.type = bossType;
        this.ufoData = ufos.find(u => u.id === BOSS_UFO_MAP[bossType]);
        this.name = this.ufoData.name;
        this.size = 60; this.x = screenWidth / 2; this.y = -this.size; this.targetY = 150;
        this.health = (80 + Math.floor(score / 1000)) * (waveCount > 1 ? 1.5 : 1); this.maxHealth = this.health;
        this.color = this.ufoData.color; this.shootCooldown = 0; this.phase = 'entering';
        this.angleX = 0; this.angleY = 0; this.angleZ = 0; this.speedX = 2;
        this.mesh = new THREE.Mesh(this.ufoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...this.ufoData.colors) }));
        bossMeshes.add(this.mesh);
    }
        update() { let isSlowed = player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200; const speedMod = isSlowed ? 0.2 : 1; this.angleX += 0.005 * speedMod; this.angleY += 0.01 * speedMod; if (this.phase === 'entering') { this.y += (this.targetY - this.y) * 0.05 * speedMod; if (Math.abs(this.y - this.targetY) < 1) this.phase = 'fighting'; } else if (this.phase === 'fighting') { this.x += this.speedX * speedMod; if (this.x < this.size || this.x > screenWidth - this.size) this.speedX *= -1; this.shootCooldown--; if (this.shootCooldown <= 0) { this.shoot(); this.shootCooldown = this.health < this.maxHealth / 2 ? 30 : 50; } } }
        draw() {
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
            this.mesh.rotation.x = this.angleX;
            this.mesh.rotation.y = this.angleY;
            this.mesh.rotation.z = this.angleZ;
        }
        shoot() { const patterns = [ () => { for (let i = 0; i < 6; i++) { const angle = (i / 6) * Math.PI * 2 + this.angleY * 2; enemyBullets.push(new Bullet(this.x, this.y, Math.sin(angle) * 2.5, Math.cos(angle) * 2.5, this.color)); } }, () => { enemyBullets.push(new Bullet(this.x, this.y, 0, 5, this.color)); enemyBullets.push(new Bullet(this.x, this.y, -1.5, 5, this.color)); enemyBullets.push(new Bullet(this.x, this.y, 1.5, 5, this.color)); } ]; if (this.name === "BEHEMOTH") { patterns.push(() => { const angle = Math.atan2(player.y - this.y, player.x - this.x); for(let i=-1; i<=1; i++) {enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle + i*0.2) * 4, Math.sin(angle + i*0.2) * 4, this.color));}}) } patterns[Math.floor(Math.random() * patterns.length)](); } takeDamage(amount) {
            this.health -= amount;
            // Ensure health does not go below 0
            if (this.health < 0) {
                this.health = 0;
            }
            if (this.health <= 0) {
                bossMeshes.remove(this.mesh); // Remove mesh from scene
                return true;
            }
            return false;
        }
    }
    class Star {
        constructor() {
            this.x = Math.random() * screenWidth;
            this.y = Math.random() * screenHeight;
            this.size = Math.random() * 2 + 1;
            this.speed = this.size * 0.5;

            const geometry = new THREE.SphereGeometry(this.size / 2, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: this.size / 3 });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);
        }
        update() {
            let timeMod = 1;
            if (player && player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200) { timeMod = 0.2; }
            this.y += this.speed * timeMod;
            if (this.y > screenHeight) {
                this.y = -this.size;
                this.x = Math.random() * screenWidth;
            }
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, -10); // Z-index to be behind other objects
        }
        draw() {
            // No drawing needed, handled by Three.js in update
        }
    }
    class Particle {
        constructor(x, y, speedX, speedY, color, size, lifespan) {
            this.x = x; this.y = y; this.speedX = speedX + (Math.random() - 0.5) * 2; this.speedY = speedY + (Math.random() - 0.5) * 2;
            this.color = color; this.size = size; this.lifespan = lifespan; this.maxLifespan = lifespan;

            const geometry = new THREE.SphereGeometry(this.size / 2, 8, 8);
            const rgb = new THREE.Color(this.color);
            const material = new THREE.MeshBasicMaterial({ color: rgb, transparent: true, opacity: this.lifespan / this.maxLifespan });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.lifespan--;
            this.size *= 0.95;
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
            this.mesh.scale.setScalar(this.size / (this.maxLifespan / 2)); // Scale with size
            this.mesh.material.opacity = this.lifespan / this.maxLifespan;
        }
        draw() {
            // No drawing needed, handled by Three.js in update
        }
    }
    class PowerUp {
        constructor(x, y) {
            this.x = x; this.y = y; this.size = 10; this.speedY = 2;
            const types = ['shield', 'minion', 'ghost', 'bomb'];
            this.type = types[Math.floor(Math.random() * types.length)];
            this.color = { shield: '#60a5fa', minion: '#a78bfa', ghost: '#e5e7eb', bomb: '#ffffff'}[this.type];

            // Create a 3D mesh for the power-up
            const geometry = new THREE.BoxGeometry(this.size, this.size, this.size); // Or other appropriate geometry
            const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.color) });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);
        }
        update() {
            this.y += this.speedY;
            this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
            this.mesh.rotation.x += 0.05;
            this.mesh.rotation.y += 0.05;
        }
        draw() {
            // No 2D drawing needed, handled by Three.js
        }
    }
    class RawMaterialPickup extends PowerUp {
        constructor(x, y) {
            super(x, y);
            this.type = 'material';
            this.color = '#94a3b8';
            // Update the mesh material for raw material
            this.mesh.material.color.set(new THREE.Color(this.color));
            this.mesh.geometry = new THREE.BoxGeometry(this.size, this.size, this.size); // Square shape
        }
        draw() {
            // No 2D drawing needed, handled by Three.js
        }
    }
    class Obstacle { constructor(type) {
        this.type = type;
        this.x = Math.random() * screenWidth; this.y = -50;
        this.speedY = Math.random() * 1 + 0.5; this.size = Math.random() * 20 + 15;
        this.angleX = Math.random()*Math.PI*2; this.angleY = Math.random()*Math.PI*2; this.angleZ = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        if(type === 'asteroid') {
            this.health = this.size / 10;
            this.ufoData = ufos.find(u => u.id === ASTEROID_UFO_MODEL);
            this.color = '#a1a1aa';
            this.mesh = new THREE.Mesh(this.ufoData.geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...this.ufoData.colors) }));
            obstacleMeshes.add(this.mesh);
        } else if (type === 'blackhole') {
            this.color = '#000'; this.size = Math.random() * 30 + 40; this.gravityWell = this.size * 4;
            this.lifespan = 600; this.y = Math.random() * screenHeight * 0.6;
            sfx.blackhole.triggerAttack();
        }
    }
        update() {
            this.angleY += this.rotationSpeed;
            if(this.type === 'asteroid') {
                this.y += this.speedY;
                this.mesh.position.set(this.x - screenWidth / 2, -this.y + screenHeight / 2, 0);
                this.mesh.rotation.x = this.angleX;
                this.mesh.rotation.y = this.angleY;
                this.mesh.rotation.z = this.angleZ;
            } else if(this.type === 'blackhole') {
                if(player) {
                    const dx = this.x-player.x; const dy = this.y-player.y; const dist = Math.hypot(dx,dy);
                    if(dist < this.gravityWell) {
                        const pull = (1 - dist / this.gravityWell) * 0.2;
                        player.x += dx/dist * pull;
                        player.y += dy/dist * pull;
                        if(dist < this.size) player.hit();
                    }
                }
                this.lifespan--;
                if(this.lifespan <= 0) sfx.blackhole.triggerRelease();
            }
        }
        draw() {
            // No drawing needed for 3D objects, handled by Three.js
            // Only 2D drawing for blackhole remains
            if(this.type === 'blackhole') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = `rgba(200, 50, 255, ${0.5 + Math.sin(gameFrame*0.1)*0.2})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
        takeDamage(amount) {
            if(this.type !== 'asteroid') return false;
            this.health -= amount;
            if (this.health <= 0) {
                obstacleMeshes.remove(this.mesh); // Remove mesh from scene
                return true;
            }
            return false;
        }
    }
    
    // --- Game Management ---
    async function init() {
        // Populate ufos array from global ufos (from ufoData.js)
        ufos.push(...window.ufos);

        if (!musicInitialized) { await Tone.start(); initAudio(); audioStatusEl.textContent = 'Audio Ready!'; setTimeout(() => { audioStatusEl.textContent = ''; }, 2000); }
        setGameSize();
        score = 0; waveCount = 0; waveCredits = 0; materialsThisRun = 0;
        shopCosts = { shield: 75, bomb: 125, minion: 200, health: 150 };
        isPaused = false; isGameOver = false; gameFrame = 0; isAbilityHeld = false;
        if (hasPurchasedScoreBoost) { score = Math.floor(highScore / 3); hasPurchasedScoreBoost = false; localStorage.setItem('hasPurchasedScoreBoost', 'false'); }
        player = new Player();
        stars = Array.from({ length: 150 }, () => new Star());
        particles = []; powerups = []; enemies = []; playerBullets = []; enemyBullets = []; turrets = []; obstacles = [];
        currentBoss = null; ghostTimer = 0; spectreTimer = 0;
        updateUI(true); hideAllModals(); bottomUiContainer.style.display = 'flex';
        startMusic(false); gameLoop();
    }
    function gameLoop() {
        if (isGameOver) return;
        if (player && player.health <= 0) {
            if (player.abilities.phoenix && !player.phoenixUsed) {
                player.phoenixUsed = true; player.health = Math.ceil(player.baseHealth / 2); player.shield = 0; ghostTimer = 180;
                createExplosion(player.x, player.y, UFO_TYPES.phoenix.color, 30); sfx.unlock.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n');
            } else {
                isGameOver = true; createExplosion(player.x, player.y, player.ufo.color, 40); handleGameOver(); return;
            }
        }
        if (isPaused) return; 
        requestAnimationFrame(gameLoop);
        ctx.save();
        try {
            if (screenShake.duration > 0) { const dx = (Math.random()-0.5)*screenShake.intensity; const dy = (Math.random()-0.5)*screenShake.intensity; ctx.translate(dx, dy); screenShake.duration--; }
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, screenWidth, screenHeight);
            gameFrame++; if (ghostTimer > 0) ghostTimer--;
            stars.forEach(s => { s.update(); s.draw(); });
            handleObstacles();
            handleBullets(playerBullets, enemies.concat(currentBoss ? [currentBoss] : []).concat(obstacles));
            handleBullets(enemyBullets, [player].concat(turrets));
            handleEnemies(); handlePowerups();
            if (currentBoss) handleBoss();
            particles.forEach((p, i) => { p.update(); p.draw(); if (p.lifespan <= 0 || p.size < 0.5) particles.splice(i, 1); });
            if(player) { player.update(); player.draw(); }
            if (!isPaused) { ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2); ctx.fill(); }
            WaveManager.update(); updateUI();
        } finally {
            ctx.restore();
        }
        renderer.render(scene, camera);
    }
    const enemySpawnTable = [ { score: 0, types: ['grunt'] }, { score: 2000, types: ['dasher'] }, { score: 5000, types: ['tank'] }, { score: 8000, types: ['weaver'] }, { score: 12000, types: ['dodger'] }, { score: 18000, types: ['splitter'] }, { score: 25000, types: ['sniper'] }, { score: 35000, types: ['kamikaze'] }, { score: 50000, types: ['orbiter'] }, { score: 75000, types: ['stealth'] } ];
    const WaveManager = { nextBossScore: 7500, update: function () { if (currentBoss || isPaused) return; if (score >= this.nextBossScore) { this.spawnBoss(); this.nextBossScore += 10000 + this.nextBossScore * 0.2; } else if (gameFrame % 100 === 0 && enemies.length < 15 * spawnMultiplier) { const availableTypes = enemySpawnTable.filter(e => score >= e.score).flatMap(e => e.types); const waveSize = Math.min(5, 1 + Math.floor(score / 4000)) * spawnMultiplier; for (let i = 0; i < waveSize; i++) { const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]; enemies.push(new Enemy(type)); } } if(gameFrame % (120 - Math.min(100, score/1000)) === 0 && obstacles.filter(o=>o.type==='asteroid').length < 20) { obstacles.push(new Obstacle('asteroid')); } if(score > 50000 && gameFrame % 900 === 0 && !obstacles.some(o=>o.type === 'blackhole')) { obstacles.push(new Obstacle('blackhole')); }}, spawnBoss: function () { enemies = []; waveCount++; const bossModel = (waveCount % 2 !== 0) ? 'GOLIATH' : 'BEHEMOTH'; currentBoss = new Boss(bossModel); bossNameEl.textContent = currentBoss.name; bossHealthBarContainer.style.display = 'block'; startMusic(true); } };
    function handleBoss() { currentBoss.update(); currentBoss.draw(); }
    function handleEnemies() { for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) { const enemy = enemies[eIndex]; enemy.update(); enemy.draw(); if (enemy.y > screenHeight + enemy.size) { enemies.splice(eIndex, 1); continue; } if(enemy.type === 'kamikaze' && isColliding(enemy,player)) {player.hit(); enemy.health=0;} if (!isColliding(enemy, player)) continue; let isIntangible = ghostTimer > 0 || (player.abilities.spectre && spectreTimer > 480) || (player.abilityState.name === 'ghost' && player.abilityState.active) || (player.abilityState.name === 'juggernaut' && player.abilityState.active); if (!isIntangible) { player.hit(); createExplosion(enemy.x, enemy.y, enemy.color, 10); enemies.splice(eIndex, 1); } } }
    function handleObstacles() { for (let i = obstacles.length-1; i>=0; i--) { const o = obstacles[i]; o.update(); o.draw(); if (o.y > screenHeight + o.size || o.lifespan <= 0) obstacles.splice(i,1); } }
    function handleBullets(bullets, targets) {
        for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
            const bullet = bullets[bIndex];
            if(!bullet){bullets.splice(bIndex, 1); continue;}
            bullet.update();
            bullet.draw(); // This might be a no-op now, but keeping for consistency
            if (bullet.y < -30 || bullet.y > screenHeight + 10 || bullet.x < -10 || bullet.x > screenWidth + 10) {
                scene.remove(bullet.mesh); // Remove bullet mesh from scene
                bullets.splice(bIndex, 1);
                continue;
            }
            for (let tIndex = 0; tIndex < targets.length; tIndex++) {
                const target = targets[tIndex];
                if (!target) continue;
                if (target.health <= 0 && !(target instanceof Obstacle && target.type === 'blackhole')) continue;
                if (isColliding(bullet, target)) {
                    scene.remove(bullet.mesh); // Remove bullet mesh from scene
                    bullets.splice(bIndex, 1);
                    if (target instanceof Player) target.hit();
                    else if (target instanceof Sentry) {} // Sentry doesn't take damage from bullets
                    else if (target instanceof Obstacle && target.type === 'asteroid') {
                        if (target.takeDamage(bullet.damage)) {
                            createExplosion(target.x, target.y, target.color, 5);
                            if(Math.random() < 0.3) powerups.push(new RawMaterialPickup(target.x, target.y));
                            const obsIdx = obstacles.indexOf(target);
                            if (obsIdx > -1) obstacles.splice(obsIdx, 1);
                        }
                    }
                    else if (target instanceof Enemy) {
                        if (bullet.canSlow) target.slowTimer = 180;
                        if (target.takeDamage(bullet.damage)) {
                            target.onDeath();
                            createExplosion(target.x, target.y, target.color, 10);
                            let creditDrop = 5;
                            if (player.abilities.alchemist && Math.random() < 0.25) creditDrop = 25;
                            addScore(100 + (Object.keys(ENEMY_UFO_MAP).indexOf(target.type) * 10));
                            waveCredits += creditDrop;
                            if (player.abilities.reaper) player.reaperBoost = 120;
                            const enemyIndex = enemies.indexOf(target);
                            if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
                        }
                    } else if (target instanceof Boss) {
                        addScore(50);
                        if (target.takeDamage(bullet.damage)) {
                            createExplosion(target.x, target.y, target.color, 80);
                            addScore(5000);
                            waveCredits += 250;
                            materialsThisRun += 10;
                            currentBoss = null;
                            bossHealthBarContainer.style.display = 'none';
                            startMusic(false);
                            showInGameShop();
                        }
                    }
                    break;
                }
            }
        }
    }
    function handlePowerups() {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            p.update();
            p.draw(); // This might be a no-op now, but keeping for consistency
            if (p.y > screenHeight + 10) {
                scene.remove(p.mesh); // Remove powerup mesh from scene
                powerups.splice(i, 1);
                continue;
            }
            if (isColliding(p, player)) {
                const collectedPowerup = powerups.splice(i, 1)[0];
                if(!collectedPowerup) continue;
                scene.remove(collectedPowerup.mesh); // Remove collected powerup mesh from scene
                sfx.powerup.triggerAttackRelease('C5', '4n');
                const powerupTime = 300 + (upgrades.powerupDuration.level * 60);
                if (collectedPowerup.type === 'shield') player.shield++;
                else if (collectedPowerup.type === 'minion') player.addMinion();
                else if (collectedPowerup.type === 'ghost') ghostTimer = powerupTime;
                else if (collectedPowerup.type === 'bomb') player.bombs++;
                else if (collectedPowerup.type === 'material') { materialsThisRun++; }
            }
        }
    }
    function addScore(amount) { score += amount * scoreMultiplier; checkUnlocks(); }
    function createExplosion(x,y,color,count) { sfx.explosion.triggerAttackRelease(0.15); triggerScreenShake(count/4, 10); for (let i=0; i<count; i++) particles.push(new Particle(x,y,(Math.random()-0.5)*4,(Math.random()-0.5)*4,color,Math.random()*2+1,25)); }
    function isColliding(a,b) { if(!a || !b) return false; const dx = a.x - b.x; const dy = a.y - b.y; return Math.hypot(dx, dy) < (a.size + b.size); }
    function triggerScreenShake(intensity, duration) { screenShake.intensity = Math.max(screenShake.intensity, intensity * 0.2); screenShake.duration = Math.max(screenShake.duration, duration); }
    function checkUnlocks() { let changed = false; for (const key in UFO_TYPES) { if(key === 'interceptor') continue; const ufo = UFO_TYPES[key]; if (ufo.unlockMethod === 'score' && score >= ufo.unlockScore && !unlockedUFOs.has(key)) { unlockedUFOs.add(key); sfx.unlock.triggerAttackRelease(['C5','E5','G5'],'4n'); changed = true; } } if(changed) localStorage.setItem('unlockedUFOs', JSON.stringify([...unlockedUFOs])); }
    // Removed projectAndDrawWireframe as it's no longer used for 3D rendering
    
    // --- UI & Menu Management ---
    function hideAllModals() { [startScreen, pauseScreen, gameOverScreen, hangarScreen, inGameShop, devScreen].forEach(m => m.style.display = 'none'); modalContainer.style.pointerEvents = 'none'; }
    function showModal(modalElement) { hideAllModals(); modalElement.style.display = modalElement.id === 'pauseScreen' || modalElement.id === 'hangarScreen' ? 'flex' : 'block'; modalContainer.style.pointerEvents = 'all'; }
    function handleGameOver() { stopMusic(); if (score > highScore) { highScore = score; localStorage.setItem('highScore', highScore); } const scoreCredits = Math.floor(score / 250); const bonusCredits = Math.floor(scoreCredits * (upgrades.creditBonus.level * 0.05)); const totalCreditsEarned = scoreCredits + waveCredits + bonusCredits; starCredits += totalCreditsEarned; rawMaterials += materialsThisRun; localStorage.setItem('starCredits', starCredits); localStorage.setItem('rawMaterials', rawMaterials); finalScoreEl.textContent = score.toLocaleString(); creditsEarnedEl.textContent = `${totalCreditsEarned.toLocaleString()} (${scoreCredits.toLocaleString()} + ${waveCredits.toLocaleString()} + ${bonusCredits.toLocaleString()} bonus)`; materialsFoundEl.textContent = materialsThisRun.toLocaleString(); showModal(gameOverScreen); bottomUiContainer.style.display = 'none'; }
    function quitToMainMenu() { isPaused = true; isGameOver = false; player = null; enemies = []; playerBullets = []; enemyBullets = []; powerups = []; turrets = []; obstacles = []; currentBoss = null; bottomUiContainer.style.display = 'none'; hideAllModals(); showModal(startScreen); updateStartScreenInfo(); score = 0; waveCredits = 0; updateUI(true); stopMusic(); }
    function togglePause() { isPaused = !isPaused; if (isPaused) { updatePauseMenuUI(); showModal(pauseScreen); Tone.Transport.pause(); } else { hideAllModals(); Tone.Transport.start(); gameLoop(); } }
    function updateShipSelector(container, isHangarView) { container.innerHTML = ''; const refreshCallback = isHangarView ? updateHangarUI : updatePauseMenuUI; Object.keys(UFO_TYPES).forEach(key => { if(isHangarView && UFO_TYPES[key].unlockMethod === 'score') return; const ufo = UFO_TYPES[key], isUnlocked = unlockedUFOs.has(key); const card = document.createElement('div'); card.className = `ship-select-card p-2 rounded-lg text-left flex flex-col justify-between h-full ${isUnlocked ? '' : 'locked'} ${selectedUFO === key && gameMode === 'classic' ? 'selected' : ''}`; let statusText = isUnlocked ? 'Unlocked' : (ufo.unlockMethod === 'score' ? `Unlock at ${ufo.unlockScore.toLocaleString()} pts` : `Cost: ${ufo.cost.toLocaleString()} CR`); card.innerHTML = `<div><h4 class="text-sm sm:text-base font-bold leading-tight" style="color:${ufo.color}">${ufo.name}</h4><p class="text-[10px] sm:text-xs text-gray-300 mt-1 leading-snug">${ufo.ability}</p></div><p class="text-[10px] sm:text-xs text-gray-400 mt-2 leading-snug">${statusText}</p>`; if (!isUnlocked && ufo.unlockMethod === 'credits' && starCredits >= ufo.cost) { const buyButton = document.createElement('button'); buyButton.className = 'menu-button bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-xs w-full mt-2'; buyButton.textContent = 'BUY SHIP'; buyButton.onclick = (e) => { e.stopPropagation(); buyUFO(key, refreshCallback); }; card.appendChild(buyButton); } if (isUnlocked && !isGameOver) card.addEventListener('click', () => { selectedUFO = key; gameMode = 'classic'; isCombineAllActive = false; localStorage.setItem('selectedUFO', key); localStorage.setItem('gameMode', 'classic'); localStorage.setItem('isCombineAllActive', 'false'); if(player && isPaused) player.reset(); if(isHangarView) { updateHangarUI(); updateStartScreenInfo(); } else { refreshCallback(); } }); container.appendChild(card); }); }
    function buyUFO(key, refreshCallback) { const ufo = UFO_TYPES[key]; if (starCredits >= ufo.cost && !unlockedUFOs.has(key)) { starCredits -= ufo.cost; unlockedUFOs.add(key); localStorage.setItem('starCredits', starCredits); localStorage.setItem('unlockedUFOs', JSON.stringify([...unlockedUFOs])); sfx.buy.triggerAttackRelease("E5", "8n"); if (refreshCallback) refreshCallback(); } }
    function updateHangarUI() { updateHangarLikeUI(hangarCreditsEl, hangarShipSelector, upgradeGrid, true); hangarMaterialsEl.textContent = rawMaterials.toLocaleString(); updateFusionLabUI(); }
    function updatePauseMenuUI() { updateHangarLikeUI(pauseStarCreditsEl, pauseShipSelectorEl, pauseUpgradeGridEl, false); }
    function updateHangarLikeUI(creditsElement, shipSelectorElement, upgradeGridElement, isHangarView) { creditsElement.textContent = starCredits.toLocaleString(); if(shipSelectorElement) updateShipSelector(shipSelectorElement, isHangarView); if(isHangarView) { metaGrid.innerHTML = ''; const boostCost = 1000; const boostCard = document.createElement('div'); boostCard.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center'; boostCard.innerHTML = `<h4 class="text-lg font-bold text-amber-400">Score Boost</h4><p class="text-sm my-2">Start with 1/3 high score.<br/>(${Math.floor(highScore / 3).toLocaleString()} score)</p><button id="buy-score-boost" class="menu-button bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">${hasPurchasedScoreBoost ? 'ACTIVE' : `BUY (${boostCost.toLocaleString()} CR)`}</button>`; const boostButton = boostCard.querySelector('#buy-score-boost'); if (hasPurchasedScoreBoost || starCredits < boostCost || highScore < 1000) boostButton.disabled = true; boostButton.addEventListener('click', () => { if (starCredits >= boostCost) { starCredits -= boostCost; hasPurchasedScoreBoost = true; localStorage.setItem('starCredits', starCredits); localStorage.setItem('hasPurchasedScoreBoost', 'true'); sfx.buy.triggerAttackRelease("A4", "8n"); updateHangarUI(); } }); metaGrid.appendChild(boostCard); const challengeCard = document.createElement('div'); challengeCard.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center'; let challengeBtnHtml; if(spawnMultiplier >= 4) { challengeBtnHtml = `<button class="menu-button w-full" disabled>MAXIMUM CARNAGE</button>`; } else if (spawnMultiplier >= 2) { challengeBtnHtml = `<button id="buy-challenge-2" class="menu-button bg-red-800 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">REALLY BRING IT ON!!</button>`; } else { challengeBtnHtml = `<button id="buy-challenge-1" class="menu-button bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">Bring It On!</button>`; } challengeCard.innerHTML = `<h4 class="text-lg font-bold text-red-400">Challenge Mode</h4><p class="text-sm my-2">Spawn Rate: x${spawnMultiplier}</p>${challengeBtnHtml}`; metaGrid.appendChild(challengeCard); const challengeBtn1 = challengeCard.querySelector('#buy-challenge-1'); const challengeBtn2 = challengeCard.querySelector('#buy-challenge-2'); if(challengeBtn1) { const cost = 100000; if(starCredits < cost) challengeBtn1.disabled = true; challengeBtn1.textContent += ` (${cost.toLocaleString()} CR)`; challengeBtn1.addEventListener('click', () => {if(starCredits >= cost){starCredits -= cost; spawnMultiplier = 2; localStorage.setItem('starCredits', starCredits); localStorage.setItem('spawnMultiplier', spawnMultiplier); sfx.unlock.triggerAttackRelease(['C3', 'E3', 'G3'], '2n'); updateHangarUI();}}); } if(challengeBtn2) { const cost = 1000000; if(starCredits < cost) challengeBtn2.disabled = true; challengeBtn2.textContent += ` (${cost.toLocaleString()} CR)`; challengeBtn2.addEventListener('click', () => {if(starCredits >= cost){starCredits -= cost; spawnMultiplier = 4; localStorage.setItem('starCredits', starCredits); localStorage.setItem('spawnMultiplier', spawnMultiplier); sfx.unlock.triggerAttackRelease(['C2', 'E2', 'G2'], '1n'); updateHangarUI();}}); } } upgradeGridElement.innerHTML = ''; const refreshCallback = isHangarView ? updateHangarUI : updatePauseMenuUI; Object.keys(upgrades).forEach(key => { const upg = upgrades[key]; const currentCost = upg.cost + upg.costIncrease * upg.level; const matCost = upg.matCost + upg.matIncrease * upg.level; const isMaxed = upg.level >= upg.maxLevel; const card = document.createElement('div'); card.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center'; card.innerHTML = `<h4 class="text-lg font-bold text-amber-400">${upg.name}</h4><p class="text-sm my-2">Level: ${upg.level} / ${upg.maxLevel}</p><button id="buy-${key}-${isHangarView ? 'h' : 'p'}" class="menu-button bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">${isMaxed ? 'MAX LEVEL' : `UPGRADE (${currentCost.toLocaleString()} CR + ${matCost} [M])`}</button>`; const buyButton = card.querySelector(`#buy-${key}-${isHangarView ? 'h' : 'p'}`); if (isMaxed || starCredits < currentCost || rawMaterials < matCost) buyButton.disabled = true; buyButton.addEventListener('click', () => { if (buyUpgrade(key)) refreshCallback(); }); upgradeGridElement.appendChild(card); }); if (!isHangarView) { pauseBuyGridEl.innerHTML = ''; const items = [{name: 'Buy Health', cost: healthPurchaseCost, action: () => { player.health++; healthPurchaseCost = Math.floor(healthPurchaseCost * 1.5); }}, {name: 'Buy Shield', cost: shieldPurchaseCost, action: () => { player.shield++; shieldPurchaseCost = Math.floor(shieldPurchaseCost * 1.5); }}, {name: 'Buy Bomb', cost: bombPurchaseCost, action: () => { player.bombs++; bombPurchaseCost = Math.floor(bombPurchaseCost * 1.5); }}]; items.forEach(item => { const card = document.createElement('div'); card.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center'; card.innerHTML = `<h4 class="text-lg font-bold text-amber-400">${item.name}</h4><button class="menu-button bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full mt-2">BUY (${item.cost.toLocaleString()} CR)</button>`; const btn = card.querySelector('button'); if (starCredits < item.cost) btn.disabled = true; btn.addEventListener('click', () => { if(starCredits >= item.cost) { starCredits -= item.cost; item.action(); localStorage.setItem('starCredits', starCredits); sfx.buy.triggerAttackRelease("C4", "8n"); refreshCallback(); }}); pauseBuyGridEl.appendChild(card);}); } }
    function buyUpgrade(key) { const upg = upgrades[key]; const creditCost = upg.cost + upg.costIncrease * upg.level; const matCost = upg.matCost + upg.matIncrease * upg.level; if (starCredits >= creditCost && rawMaterials >= matCost && upg.level < upg.maxLevel) { starCredits -= creditCost; rawMaterials -= matCost; upg.level++; localStorage.setItem('starCredits', starCredits); localStorage.setItem('rawMaterials', rawMaterials); localStorage.setItem('upgrades', JSON.stringify(upgrades)); sfx.buy.triggerAttackRelease("E4", "8n"); return true; } return false; }
    function showInGameShop() { isPaused = true; Tone.Transport.pause(); shopCreditsEl.textContent = waveCredits; shopItemsEl.innerHTML = ''; const items = [ { name: 'Repair Hull', cost: shopCosts.health, action: () => { player.health++; shopCosts.health = Math.floor(shopCosts.health * 1.8); } }, { name: 'Add Shield', cost: shopCosts.shield, action: () => { player.shield++; shopCosts.shield = Math.floor(shopCosts.shield * 1.5); } }, { name: 'Add Bomb', cost: shopCosts.bomb, action: () => { player.bombs++; shopCosts.bomb = Math.floor(shopCosts.bomb * 1.6); } }, { name: 'Add Minion', cost: shopCosts.minion, action: () => { player.addMinion(); shopCosts.minion = Math.floor(shopCosts.minion * 2); } } ]; items.forEach(item => { const itemEl = document.createElement('div'); itemEl.className = 'upgrade-card p-3 rounded-lg text-center flex flex-col justify-between'; itemEl.innerHTML = `<h4 class="text-base text-amber-400">${item.name}</h4>`; const buyButton = document.createElement('button'); buyButton.className = 'menu-button bg-blue-600 text-white font-bold py-1 px-3 mt-2 rounded-lg text-sm w-full'; buyButton.textContent = `BUY (${item.cost} CR)`; if (waveCredits < item.cost) buyButton.disabled = true; buyButton.onclick = () => { if(waveCredits >= item.cost) { waveCredits -= item.cost; item.action(); sfx.buy.triggerAttackRelease("C4", "8n"); showInGameShop(); } }; itemEl.appendChild(buyButton); shopItemsEl.appendChild(itemEl); }); showModal(inGameShop); }
    function updateFusionLabUI() { fusionCreditsEl.textContent = starCredits.toLocaleString(); const slotsUnlocked = (highScore >= 50000 ? 5 : highScore >= 40000 ? 4 : highScore >= 30000 ? 3 : highScore >= 20000 ? 2 : 1); fusionSlotsAvailableEl.textContent = `${fusionConfig.length} / ${slotsUnlocked}`; fusionSlotsContainer.innerHTML = ''; for (let i = 0; i < 5; i++) { const slot = document.createElement('div'); slot.className = 'fusion-slot rounded-lg p-2 flex items-center justify-center text-center'; if (i < slotsUnlocked) { const ufoKey = fusionConfig[i]; if (ufoKey) { const ufo = UFO_TYPES[ufoKey]; slot.classList.add('filled'); slot.innerHTML = `<div class="text-sm"><h4 style="color:${ufo.color}">${ufo.name}</h4></div>`; } else { slot.innerHTML = `<p class="text-xs text-gray-500">SLOT ${i+1}</p>`; } } else { slot.classList.add('locked'); slot.innerHTML = `<p class="text-xs text-gray-600">LOCKED<br/>(Score > ${(i)*10000+10000})</p>`; } fusionSlotsContainer.appendChild(slot); } fusionShipSource.innerHTML = ''; Object.keys(UFO_TYPES).forEach(key => { if(key === 'omega') return; const ufo = UFO_TYPES[key]; if (!unlockedUFOs.has(key)) return; const card = document.createElement('div'); const isFused = fusionConfig.includes(key); card.className = `ship-select-card p-2 rounded-lg text-center fusion-source-ship ${isFused ? 'fused' : ''}`; card.innerHTML = `<h4 class="text-sm font-bold" style="color:${ufo.color}">${ufo.name}</h4>`; if (!isFused) { card.addEventListener('click', () => addShipToFusion(key)); } fusionShipSource.appendChild(card); }); combineAllButton.style.display = highScore >= 100000 ? 'inline-flex' : 'none'; }
    function addShipToFusion(ufoKey) { const slotsUnlocked = (highScore >= 50000 ? 5 : highScore >= 40000 ? 4 : highScore >= 30000 ? 3 : highScore >= 20000 ? 2 : 1); if (fusionConfig.length < slotsUnlocked) { fusionConfig.push(ufoKey); gameMode = 'fusion'; isCombineAllActive = false; localStorage.setItem('fusionConfig', JSON.stringify(fusionConfig)); localStorage.setItem('gameMode', 'fusion'); localStorage.setItem('isCombineAllActive', 'false'); updateFusionLabUI(); updateStartScreenInfo(); } }
    function clearFusion() { fusionConfig = []; isCombineAllActive = false; gameMode = 'classic'; localStorage.setItem('fusionConfig', '[]'); localStorage.setItem('gameMode', 'classic'); localStorage.setItem('isCombineAllActive', 'false'); updateFusionLabUI(); updateStartScreenInfo(); }
    function activateCombineAll() { isCombineAllActive = true; gameMode = 'fusion'; fusionConfig = []; localStorage.setItem('isCombineAllActive', 'true'); localStorage.setItem('gameMode', 'fusion'); localStorage.setItem('fusionConfig', '[]'); selectedUFO = 'interceptor'; localStorage.setItem('selectedUFO', 'interceptor'); updateFusionLabUI(); updateStartScreenInfo(); alert('CHIMERA MODE ACTIVATED!'); }
    function updateStartScreenInfo() { if(selectedUFO === 'omega') { gameModeInfoEl.textContent = `MODE: OMEGA`; } else if(gameMode === 'fusion' && (fusionConfig.length > 0 || isCombineAllActive)) { const shipName = isCombineAllActive ? 'CHIMERA' : 'FUSION SHIP'; gameModeInfoEl.textContent = `MODE: FUSION (${shipName})`; } else { gameModeInfoEl.textContent = `MODE: CLASSIC (${UFO_TYPES[selectedUFO].name})`; } }
    function updateUI(force = false) { if(force || uiState.score !== score) {uiState.score = score; scoreEl.textContent = score.toLocaleString();} if(force || uiState.highScore !== highScore) {uiState.highScore = highScore; highScoreEl.textContent = highScore.toLocaleString();} if(player) { if(force || uiState.health !== player.health) {uiState.health = player.health; healthEl.textContent = player.health;} if(force || uiState.shield !== player.shield) {uiState.shield = player.shield; shieldEl.textContent = player.shield;} if(force || uiState.bombs !== player.bombs) {uiState.bombs = player.bombs; bombsEl.textContent = player.bombs;} if(player.abilityState && player.abilities.paladin && (force || uiState.ability !== player.abilityState.charge)) {uiState.ability = player.abilityState.charge; abilityChargeEl.textContent = player.abilityState.charge; abilityChargeUI.style.display='block'} else if (!player.abilities.paladin && !player.abilityState.active) {abilityChargeUI.style.display='none'}} if(force || uiState.credits !== waveCredits) {uiState.credits = waveCredits; creditsEl.textContent = waveCredits.toLocaleString();} if (currentBoss) { bossHealthEl.textContent = `${Math.ceil(currentBoss.health).toLocaleString()}/${currentBoss.maxHealth.toLocaleString()}`; } }
    function startMusic(isBoss) { if(!musicInitialized) return; Tone.Transport.bpm.value = isBoss ? 160 : 80; if (isBoss) { normalMusicLoop.stop(); bossMusicLoop.start(0); } else { bossMusicLoop.stop(); normalMusicLoop.start(0); } if(Tone.Transport.state !== 'started') Tone.Transport.start(); }
    function stopMusic() { if(!musicInitialized) return; if (Tone.Transport.state !== 'stopped') { normalMusicLoop.stop(); bossMusicLoop.stop(); Tone.Transport.stop(); } }
    function resizeCanvas() { screenWidth = wrapper.clientWidth; screenHeight = wrapper.clientHeight; canvas.width = screenWidth; canvas.height = screenHeight; if (player) player.y = screenHeight - 100 - MOUSE_Y_OFFSET; }
    function setGameSize() {
        wrapper.style.height = `${window.innerHeight}px`;
        resizeCanvas();
        // Update Three.js camera aspect ratio and renderer size on resize
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', setGameSize);
    canvas.addEventListener('mousemove', e => { const rect = canvas.getBoundingClientRect(); mouse.x = (e.clientX-rect.left)*(canvas.width/rect.width); mouse.y = (e.clientY-rect.top)*(canvas.height/rect.height); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const rect = canvas.getBoundingClientRect(); const touch = e.touches[0]; mouse.x = (touch.clientX-rect.left)*(canvas.width/rect.width); mouse.y = (touch.clientY-rect.top)*(canvas.height/rect.height); }, { passive: false });
    function useBombAction() { if (!isPaused && player) player.useBomb(); }
    startButton.addEventListener('click', () => {
        console.log('Start Button clicked');
        init();
    });
    resumeButton.addEventListener('click', () => {
        console.log('Resume Button clicked');
        togglePause();
    });
    restartButton.addEventListener('click', () => {
        console.log('Restart Button clicked');
        init();
    });
    pauseButton.addEventListener('click', () => {
        console.log('Pause Button clicked');
        togglePause();
    });
    hangarButton.addEventListener('click', () => {
        console.log('Hangar Button clicked');
        updateHangarUI();
        showModal(hangarScreen);
    });
    hangarBackButton.addEventListener('click', () => {
        console.log('Hangar Back Button clicked');
        showModal(startScreen);
        updateStartScreenInfo();
    });
    continueButton.addEventListener('click', () => {
        console.log('Continue Button clicked');
        isPaused = false;
        hideAllModals();
        Tone.Transport.start();
        gameLoop();
        player.ghostTimer = 180;
    });
    quitButton.addEventListener('click', () => {
        console.log('Quit Button clicked');
        quitToMainMenu();
    });
    // Track active touches
    const activeTouches = {};
    let lastClickTime = 0;
    const DOUBLE_CLICK_TIME = 300; // ms

    canvas.addEventListener('mousedown', e => {
        if (e.button === 0) { // Left click
            if (Date.now() - lastClickTime < DOUBLE_CLICK_TIME) {
                useBombAction();
                lastClickTime = 0; // Reset to prevent triple click
            } else {
                isAbilityHeld = true;
                lastClickTime = Date.now();
            }
        }
    });

    canvas.addEventListener('mouseup', e => {
        if (e.button === 0) { // Left click
            isAbilityHeld = false;
            if (player) player.releaseAbility();
        }
    });

    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); // Prevent default touch behavior (like scrolling)
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            activeTouches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                lastTap: Date.now() // Track last tap time for double tap
            };
        }
        handleMultiTouch();
    });

    canvas.addEventListener('touchend', e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            delete activeTouches[touch.identifier];
        }
        handleMultiTouch();
    });

    canvas.addEventListener('touchcancel', e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            delete activeTouches[touch.identifier];
        }
        handleMultiTouch();
    });

    function handleMultiTouch() {
        const touchIds = Object.keys(activeTouches);
        if (touchIds.length === 0) {
            isAbilityHeld = false;
            if (player) player.releaseAbility();
        } else if (touchIds.length === 2) {
            // Two fingers for ability and UFO movement
            isAbilityHeld = true;
            const touch1 = activeTouches[touchIds[0]];
            const touch2 = activeTouches[touchIds[1]];
            mouse.x = (touch1.x + touch2.x) / 2;
            mouse.y = (touch1.y + touch2.y) / 2;
        } else if (touchIds.length === 3) {
            // Three fingers for bomb - double tap detection
            const now = Date.now();
            const allTouchesTappedRecently = touchIds.every(id => now - activeTouches[id].lastTap < DOUBLE_CLICK_TIME);

            if (allTouchesTappedRecently) {
                useBombAction();
                // Reset lastTap for all touches to prevent continuous bombing
                touchIds.forEach(id => activeTouches[id].lastTap = 0);
            } else {
                // Update lastTap for all touches for next double tap detection
                touchIds.forEach(id => activeTouches[id].lastTap = now);
            }
        }
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !isGameOver && player) togglePause();
    });
    toFusionLabButton.addEventListener('click', () => { hangarView.style.display = 'none'; hangarViewHeader.style.display = 'none'; fusionLabView.style.display = 'block'; fusionLabViewHeader.style.display = 'block'; });
    toHangarButton.addEventListener('click', () => { fusionLabView.style.display = 'none'; fusionLabViewHeader.style.display = 'none'; hangarView.style.display = 'block'; hangarViewHeader.style.display = 'block'; });
    clearFusionButton.addEventListener('click', clearFusion);
    combineAllButton.addEventListener('click', activateCombineAll);
    sellMaterialButton.addEventListener('click', () => { if(rawMaterials > 0) { rawMaterials--; starCredits += 25; localStorage.setItem('rawMaterials', rawMaterials); localStorage.setItem('starCredits', starCredits); updateHangarUI(); } });
    devButton.addEventListener('click', () => showModal(devScreen));
    devBackButton.addEventListener('click', () => showModal(startScreen));
    devSetScoreButton.addEventListener('click', () => { const newScore = parseInt(devScoreInput.value); if (!isNaN(newScore)) { score = newScore; if(newScore > highScore) { highScore = newScore; localStorage.setItem('highScore', highScore); } updateUI(true); } devScoreInput.value = ''; });
    devSetCreditsButton.addEventListener('click', () => { const newCredits = parseInt(devCreditsInput.value); if(!isNaN(newCredits)) { starCredits = newCredits; localStorage.setItem('starCredits', starCredits); } devCreditsInput.value = ''; });
    devSetMaterialsButton.addEventListener('click', () => { const newMaterials = parseInt(devMaterialsInput.value); if(!isNaN(newMaterials)) { rawMaterials = newMaterials; localStorage.setItem('rawMaterials', rawMaterials); } devMaterialsInput.value = ''; });
    devUnlockAllButton.addEventListener('click', () => { starCredits = 9999999; rawMaterials = 99999; highScore = 100000; localStorage.setItem('highScore', highScore); Object.keys(UFO_TYPES).forEach(key => unlockedUFOs.add(key)); Object.keys(upgrades).forEach(key => upgrades[key].level = upgrades[key].maxLevel); localStorage.setItem('starCredits', starCredits); localStorage.setItem('rawMaterials', rawMaterials); localStorage.setItem('unlockedUFOs', JSON.stringify([...unlockedUFOs])); localStorage.setItem('upgrades', JSON.stringify(upgrades)); if(musicInitialized) sfx.unlock.triggerAttackRelease(['C5', 'E5', 'G5', 'C6'], '2n'); alert('All ships and upgrades unlocked/maxed! High score set to 100k.'); updateHangarUI(); });
    gameTitle.addEventListener('click', () => { titleClickCount++; if(titleClickCount >= 10) { devButton.style.display = 'block'; alert('Developer Menu Unlocked!'); } });
    resetProgressButton.addEventListener('click', () => {
        if (confirm('ARE YOU ABSOLUTELY SURE?\n\nThis will reset ALL progress, unlocks, and stats.\n\nThis action cannot be undone.')) {
            const keysToRemove = [ 'highScore', 'starCredits', 'rawMaterials', 'hasPurchasedScoreBoost', 'spawnMultiplier', 'upgrades', 'selectedUFO', 'unlockedUFOs', 'fusionConfig', 'isCombineAllActive', 'gameMode' ];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            alert('All progress has been reset. The page will now reload.');
            location.reload();
        }
    });
    console.log('Initial setup complete, showing start screen.');
    setGameSize();
    updateUI(true);
    showModal(startScreen);
    updateStartScreenInfo();
});
