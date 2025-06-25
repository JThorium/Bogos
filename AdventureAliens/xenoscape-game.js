document.addEventListener('DOMContentLoaded', () => {
    // --- DATA DEFINITIONS ---

    // Defines all possible upgrades in the game
    const upgradeData = {
        // OUTFIT UPGRADES
        exoskeletonPlating: {
            name: "Exoskeleton Plating",
            description: "Reinforces Xylar's suit, increasing maximum health.",
            maxLevel: 10,
            baseCost: 100,
            costMultiplier: 1.5,
            getEffect: (level) => `+${level * 10} Max Health`,
            getNextEffect: (level) => `+${(level + 1) * 10} Max Health`,
            category: 'outfit'
        },
        jetpackEfficiency: {
            name: "Jetpack Efficiency",
            description: "Improves fuel consumption for longer flight time.",
            maxLevel: 5,
            baseCost: 500,
            costMultiplier: 2,
            getEffect: (level) => `+${level * 10}% Efficiency`,
            getNextEffect: (level) => `+${(level + 1) * 10}% Efficiency`,
            category: 'outfit'
        },
        dnaMagnet: {
            name: "DNA Magnet",
            description: "Increases the collection radius for DNA drops.",
            maxLevel: 5,
            baseCost: 250,
            costMultiplier: 1.8,
            getEffect: (level) => `+${level * 20}% Radius`,
            getNextEffect: (level) => `+${(level + 1) * 20}% Radius`,
            category: 'outfit'
        },
        shieldEmitter: {
            name: "Shield Emitter",
            description: "Grants a regenerating shield that absorbs damage.",
            maxLevel: 8,
            baseCost: 400,
            costMultiplier: 1.7,
            getEffect: (level) => `+${level * 5} Shield HP`,
            getNextEffect: (level) => `+${(level + 1) * 5} Shield HP`,
            category: 'outfit'
        },
        emergencyWarp: {
            name: "Emergency Warp",
            description: "Unlocks a short-range dash to evade attacks. Upgrades reduce cooldown.",
            maxLevel: 5,
            baseCost: 1000,
            costMultiplier: 2.5,
            getEffect: (level) => `Cooldown: ${10 - level * 1.5}s`,
            getNextEffect: (level) => `Cooldown: ${10 - (level + 1) * 1.5}s`,
            category: 'outfit'
        },
        // WEAPON UPGRADES
        laserCoreOvercharge: {
            name: "Laser Core Overcharge",
            description: "Increases base laser damage.",
            maxLevel: 10,
            baseCost: 150,
            costMultiplier: 1.6,
            getEffect: (level) => `+${level * 5}% Damage`,
            getNextEffect: (level) => `+${(level + 1) * 5}% Damage`,
            category: 'weapon'
        },
        rapidFireModule: {
            name: "Rapid Fire Module",
            description: "Increases the weapon's rate of fire.",
            maxLevel: 7,
            baseCost: 300,
            costMultiplier: 1.9,
            getEffect: (level) => `+${level * 7}% Fire Rate`,
            getNextEffect: (level) => `+${(level + 1) * 7}% Fire Rate`,
            category: 'weapon'
        },
        unlockPlasmaBlaster: {
            name: "Unlock: Plasma Blaster",
            description: "Unlocks the Plasma Blaster. Slower, high-damage explosive shots.",
            maxLevel: 1,
            baseCost: 2500,
            costMultiplier: 1,
            getEffect: (level) => level > 0 ? 'Unlocked' : 'Locked',
            getNextEffect: (level) => 'Unlock Weapon',
            category: 'weapon'
        },
    };

    // --- PLAYER STATE ---
    let playerState = {
        dna: 1250,
        upgrades: {} // e.g., { exoskeletonPlating: 2, dnaMagnet: 5 }
    };

    // --- DOM ELEMENTS ---
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const startGameButton = document.getElementById('startGameButton');

    const evolutionChamberContainer = document.getElementById('evolutionChamberContainer');
    const openBtn = document.getElementById('openEvolutionChamberButton');
    const closeBtn = document.getElementById('closeEvolutionChamberButton');
    const dnaCounter = document.getElementById('dnaCounter');
    
    // HUD elements
    const healthBar = document.getElementById('healthBar');
    const shieldBar = document.getElementById('shieldBar');
    const scoreCounter = document.getElementById('scoreCounter');
    const runDnaCounter = document.getElementById('runDnaCounter');
    const currentWeaponDisplay = document.getElementById('currentWeaponDisplay');

    const outfitTab = document.getElementById('outfitUpgradesTab');
    const weaponTab = document.getElementById('weaponUpgradesTab');
    const outfitSection = document.getElementById('outfitUpgradesSection');
    const weaponSection = document.getElementById('weaponUpgradesSection');
    const outfitGrid = document.getElementById('outfitUpgradeGrid');
    const weaponGrid = document.getElementById('weaponUpgradeGrid');

    // --- STATE MANAGEMENT ---
    // Global camera offset
    let cameraX = 0;
    let gameActive = false, player, keys = {}, projectiles = [], enemyProjectiles = [], enemies = [], particles = [], dnaDrops = [], platforms = [], parallaxLayers = [];
    let enemySpawnTimer = 0;
    const enemySpawnInterval = 120; // Spawn an enemy every 2 seconds at 60fps
    let runState = { score: 0, dnaCollected: 0 };

    function saveState() {
        localStorage.setItem('xenoscapePlayerState', JSON.stringify(playerState));
    }

    function loadState() {
        const savedState = localStorage.getItem('xenoscapePlayerState');
        if (savedState) {
            playerState = JSON.parse(savedState);
        }
        // Ensure all upgrades have an entry in the player state, even if it's 0
        Object.keys(upgradeData).forEach(id => {
            if (playerState.upgrades[id] === undefined) {
                playerState.upgrades[id] = 0;
            }
        });
    }

    // --- UI RENDERING ---
    function renderAll() {
        dnaCounter.textContent = playerState.dna;
        outfitGrid.innerHTML = '';
        weaponGrid.innerHTML = '';

        Object.keys(upgradeData).forEach(id => {
            const upgrade = upgradeData[id];
            const card = createUpgradeCard(id, upgrade);
            if (upgrade.category === 'outfit') {
                outfitGrid.appendChild(card);
            } else if (upgrade.category === 'weapon') {
                weaponGrid.appendChild(card);
            }
        });
    }

    function createUpgradeCard(id, upgrade) {
        const level = playerState.upgrades[id] || 0;
        const isMaxed = level >= upgrade.maxLevel;
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
        const canAfford = playerState.dna >= cost;

        const card = document.createElement('div');
        card.className = 'upgrade-card p-3 rounded-lg flex flex-col justify-between';
        const currentEffect = level > 0 ? upgrade.getEffect(level) : 'None';
        const nextEffect = !isMaxed ? upgrade.getNextEffect(level) : '---';
        const costColor = canAfford ? 'text-green-400' : 'text-red-400';

        card.innerHTML = `
            <div>
                <h4 class="text-md md:text-lg text-yellow-300 mb-1">${upgrade.name}</h4>
                <p class="text-xs text-gray-400 mb-2">${upgrade.description}</p>
                <p class="text-sm text-cyan-300">Level: <span>${level}</span>/<span>${upgrade.maxLevel}</span></p>
                <p class="text-sm text-white">Current Effect: <span>${currentEffect}</span></p>
                <p class="text-sm text-gray-300">Next: <span>${nextEffect}</span></p>
            </div>
            <div class="mt-3 flex justify-between items-center">
                <span class="text-sm ${costColor} font-bold">Cost: <span>${isMaxed ? '---' : cost}</span> DNA</span>
                <button class="menu-button bg-green-600 text-white px-4 py-1 rounded-md text-sm upgrade-button" data-upgrade-id="${id}" ${isMaxed || !canAfford ? 'disabled' : ''}>
                    ${isMaxed ? 'MAXED' : 'UPGRADE'}
                </button>
            </div>`;
        return card;
    }

    // --- EVENT HANDLING ---
    function handlePurchase(event) {
        const button = event.target.closest('.upgrade-button');
        if (!button || button.disabled) return;
        
        const upgradeId = button.dataset.upgradeId;
        const upgrade = upgradeData[upgradeId];
        const level = playerState.upgrades[upgradeId] || 0;
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));

        if (playerState.dna >= cost && level < upgrade.maxLevel) {
            playerState.dna -= cost;
            playerState.upgrades[upgradeId]++;
            saveState();
            renderAll();
        }
    }

    // --- GAME LOGIC ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    class ParallaxLayer {
        constructor(color, speedFactor, size) {
            this.color = color;
            this.speedFactor = speedFactor;
            this.size = size;
            this.stars = [];
            // Pre-populate stars for a couple of screen widths
            for (let i = 0; i < 200; i++) {
                this.stars.push({
                    x: Math.random() * canvas.width * 2,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * this.size
                });
            }
        }

        draw(context, cameraX) {
            context.fillStyle = this.color;
            for (const star of this.stars) {
                const x = (star.x - cameraX * this.speedFactor) % (canvas.width * 2);
                context.beginPath();
                context.arc(x < 0 ? x + canvas.width * 2 : x, star.y, star.radius, 0, Math.PI * 2);
                context.fill();
            }
        }
    }

    class Particle {
        constructor(x, y, color, size, lifespan) {
            this.x = x;
            this.y = y;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.color = color;
            this.size = Math.random() * size + 2;
            this.lifespan = lifespan;
            this.maxLifespan = lifespan;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.lifespan--;
        }

        draw(context) {
            // Draw relative to cameraX
            context.save(); 
            context.globalAlpha = this.lifespan / this.maxLifespan;
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }

    class DnaDrop {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 8;
            this.color = '#10b981'; // Emerald-500
            this.value = Math.floor(Math.random() * 5 + 5); // 5-9 DNA
            this.speedY = 0.5;
        }

        update() {
            this.y += this.speedY;
        }

        draw(context) {
            // Draw relative to cameraX
            context.fillStyle = this.color; 
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fill();
            context.strokeStyle = '#a7f3d0'; // Emerald-200
            context.lineWidth = 2;
            context.stroke();
        }
    }

    class LaserProjectile { // Renamed from PlayerProjectile
        constructor(x, y, direction) {
            this.x = x;
            this.y = y;
            this.width = 15;
            this.height = 5;
            this.speed = 12 * direction;
            this.color = '#34d399'; // Emerald-400
        }

        update() {
            this.x += this.speed;
        }

        draw(context) {
            // Draw relative to cameraX
            context.fillStyle = this.color; 
            context.fillRect(this.x - cameraX, this.y, this.width, this.height); // Draw relative to camera
        }
    }

    class PlasmaProjectile {
        constructor(x, y, direction) {
            this.x = x;
            this.y = y;
            this.width = 25; // Larger projectile
            this.height = 10;
            this.speed = 8 * direction; // Slower than laser
            this.color = '#f0abfc'; // Fuchsia-300
        }

        update() {
            this.x += this.speed;
        }

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x - cameraX, this.y, this.width, this.height); // Draw relative to camera
        }
    }

    class EnemyProjectile {
        constructor(x, y, targetX, targetY) {
            this.x = x;
            this.y = y;
            this.width = 8;
            this.height = 8;
            this.color = '#f97316'; // Orange-500
            const angle = Math.atan2(targetY - y, targetX - x);
            const speed = 5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
        }

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x - cameraX, this.y, this.width, this.height);
        }
    }

    class Player {
        constructor() {
            this.width = 40;
            this.height = 30;
            this.x = 100; // Player's initial x is an absolute world position
            this.y = canvas.height / 2 - this.height / 2;
            this.vx = 0;
            this.vy = 0;
            this.maxSpeed = 7;
            this.friction = 0.85;
            this.gravity = 0.6;
            this.jumpStrength = -14;
            this.isOnGround = false;
            this.facingDirection = 1; // 1 for right, -1 for left

            this.color = '#9333ea'; // A distinct purple for Xylar
            this.shootCooldown = 0;

            // Apply upgrades
            const fireRateLevel = playerState.upgrades.rapidFireModule || 0;
            this.fireRate = 15 - fireRateLevel; // Each level reduces cooldown

            this.maxHealth = 100 + (playerState.upgrades.exoskeletonPlating || 0) * 10;
            this.health = this.maxHealth;
            this.maxShield = (playerState.upgrades.shieldEmitter || 0) * 5;
            this.shield = this.maxShield;

            // Emergency Warp ability
            this.warpUnlocked = (playerState.upgrades.emergencyWarp || 0) > 0;
            this.warpCooldown = 0;
            const warpLevel = playerState.upgrades.emergencyWarp || 0;
            this.warpMaxCooldown = (10 - warpLevel * 1.5) * 60; // Cooldown in frames
            this.isWarping = false;
        }

        // Weapon management (moved inside constructor)
        this.availableWeapons = ['laser']; 
        this.currentWeapon = 'laser'; 

        update(keys) {
            // --- Horizontal Movement ---
            if (keys['a'] || keys['ArrowLeft']) {
                this.vx -= 1.2;
                this.facingDirection = -1;
            }
            if (keys['d'] || keys['ArrowRight']) {
                this.vx += 1.2;
                this.facingDirection = 1;
            }

            // --- Jumping ---
            if ((keys['w'] || keys['ArrowUp']) && this.isOnGround) {
                this.vy = this.jumpStrength;
                this.isOnGround = false;
            }

            // --- Emergency Warp (Dash) ---
            if (this.warpCooldown > 0) this.warpCooldown--;
            if ((keys['Shift']) && this.warpUnlocked && this.warpCooldown <= 0) {
                this.warp();
            }

            // --- Apply Physics ---
            this.vx *= this.friction;
            if (Math.abs(this.vx) > this.maxSpeed) this.vx = Math.sign(this.vx) * this.maxSpeed;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;

            this.vy += this.gravity; // Apply gravity

            this.x += this.vx;
            this.y += this.vy;

            // Clamp player's absolute X to prevent going left of world start
            if (this.x < 0) {
                this.x = 0;
            }

            this.isOnGround = false; // Assume not on ground until collision check

            // Shooting
            if (this.shootCooldown > 0) this.shootCooldown--;
            if (keys[' '] && this.shootCooldown <= 0) { // Spacebar to shoot
                this.shoot();
                keys[' '] = false; // Consume key press only if shot
            }

            // Weapon switching
            if (keys['q']) {
                this.switchWeapon();
                keys['q'] = false; // Consume key press only if switched
            }

            if (this.y > canvas.height) gameOver(); // Fell off the world
        }

        switchWeapon() {
            const currentIndex = this.availableWeapons.indexOf(this.currentWeapon);
            const nextIndex = (currentIndex + 1) % this.availableWeapons.length;
            this.currentWeapon = this.availableWeapons[nextIndex];
            // Reset cooldown to prevent immediate firing after switch
            this.shootCooldown = this.fireRate; 
            updateHud(); // Update HUD to show new weapon
        }

        shoot() {
            const projectileY = this.y + this.height / 2 - 2.5;
            const projectileX = this.facingDirection > 0 ? this.x + this.width : this.x;
            
            if (this.currentWeapon === 'laser') {
                projectiles.push(new LaserProjectile(projectileX, projectileY, this.facingDirection));
            } else if (this.currentWeapon === 'plasma') {
                projectiles.push(new PlasmaProjectile(projectileX, projectileY, this.facingDirection));
            }
            this.shootCooldown = this.fireRate;
        }

        warp() {
            // Warp in the direction the player is facing, not necessarily moving
            const warpDirection = this.facingDirection;
            this.vx = 25 * warpDirection; // Powerful burst of speed
            this.vy = -2; // Slight upward lift
            this.warpCooldown = this.warpMaxCooldown;
            this.isWarping = true;
            createParticles(this.x, this.y, '#f0abfc', 20); // Warp effect
            setTimeout(() => this.isWarping = false, 200); // Warp effect duration
        }

        hit(damage) {
            // Cannot be hit while warping
            if (this.isWarping) {
                return;
            }

            if (this.shield > 0) {
                this.shield -= damage;
                if (this.shield < 0) {
                    // If damage exceeds shield, carry over to health
                    this.health += this.shield;
                    this.shield = 0;
                }
            } else {
                this.health -= damage;
            }

            createParticles(this.x + this.width / 2, this.y + this.height / 2, '#facc15', 10); // Yellow hit spark

            if (this.health <= 0) {
                this.health = 0;
                gameOver();
            }
        }

        draw(context) {
            // Draw relative to cameraX
            const drawX = this.x - cameraX;
            if (this.isWarping) { 
                context.fillStyle = '#f0abfc'; // Fuchsia-300
                context.globalAlpha = 0.5;
                context.fillRect(drawX, this.y, this.width, this.height);
                context.globalAlpha = 1.0;
            }
            context.fillStyle = this.color; 
            context.fillRect(drawX, this.y, this.width, this.height);
        }
    }

    class FlyingEnemy {
        constructor() {
            this.width = 30;
            this.height = 30;
            this.x = cameraX + canvas.width; // Spawn at right edge of visible screen
            this.y = Math.random() * (canvas.height - this.height);
            this.speed = Math.random() * 2 + 1; // Random speed
            this.color = '#ef4444'; // Red-500
            this.health = 1;
            this.dnaValue = 10;
            this.scoreValue = 100;
        }

        update() {
            this.x -= this.speed;
        }

        draw(context) {
            // Draw relative to cameraX
            context.fillStyle = this.color; 
            context.fillRect(this.x - cameraX, this.y, this.width, this.height);
        }
    }

    class GroundEnemy { // Base class for walking enemies
        constructor(platform) {
            // Spawns on a given platform, patrolling its width
            this.width = 40;
            this.height = 40;
            // Spawn randomly on the given platform
            this.x = platform.x; // Placeholder, will be set in handleEnemies
            this.y = platform.y - this.height; // Position on top of the platform
            this.speed = 1.5;
            this.direction = Math.random() < 0.5 ? 1 : -1; // 1 for right, -1 for left
            this.color = '#8b5cf6'; // Violet-500
            this.health = 2; // A bit tougher than flying enemies
            this.dnaValue = 15;
            this.scoreValue = 150;
            this.platform = platform; // Keep a reference to the platform it's on
        }

        update() {
            this.x += this.speed * this.direction;

            // Reverse direction if hitting platform edges
            if (this.x <= this.platform.x || this.x + this.width >= this.platform.x + this.platform.width) {
                this.direction *= -1;
                // Nudge back to prevent sticking at the edge
                this.x = Math.max(this.platform.x, Math.min(this.x, this.platform.x + this.platform.width - this.width));
            }
        }

        draw(context) {
            // Draw relative to cameraX
            context.fillStyle = this.color; 
            context.fillRect(this.x - cameraX, this.y, this.width, this.height);
        }
    }

    class SpitterEnemy extends GroundEnemy { // Ranged ground enemy
        constructor(platform) {
            super(platform);
            this.color = '#f59e0b'; // Amber-500
            this.health = 3;
            this.dnaValue = 25;
            this.scoreValue = 200;
            this.shootCooldown = 0;
            this.fireRate = 180; // Shoots every 3 seconds
            this.detectionRange = 500;
        }

        update() {
            super.update(); // Call parent update for movement

            if (this.shootCooldown > 0) {
                this.shootCooldown--;
            } else {
                // Check if player is in range and on screen
                const playerScreenX = player.x - cameraX;
                const selfScreenX = this.x - cameraX;
                const distanceToPlayer = Math.abs(player.x - this.x);

                if (distanceToPlayer < this.detectionRange && playerScreenX > 0 && playerScreenX < canvas.width && selfScreenX > 0 && selfScreenX < canvas.width) {
                    this.shoot();
                }
            }
        }

        shoot() {
            // Shoots a projectile towards the player's current position
            enemyProjectiles.push(new EnemyProjectile(
                this.x + this.width / 2,
                this.y + this.height / 2,
                player.x + player.width / 2,
                player.y + player.height / 2
            ));
            this.shootCooldown = this.fireRate + Math.random() * 60; // Add some randomness to firing
        }
    }

    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, color, 5, 30));
        }
    }

    function handleEnemies(context) {
        // Spawning
        enemySpawnTimer++;
        if (enemySpawnTimer > enemySpawnInterval) {
            // Introduce a chance to spawn different enemy types
            const spawnRoll = Math.random();
            if (spawnRoll < 0.15) { // 15% chance for flying enemy
                enemies.push(new FlyingEnemy());
            } else { // 85% chance for ground enemy
                // Filter for platforms that are currently on screen and wide enough
                const suitablePlatforms = platforms.filter(p => 
                    p.width >= 40 &&
                    p.x < cameraX + canvas.width &&
                    p.x + p.width > cameraX
                );
                if (suitablePlatforms.length > 0) {
                    const targetPlatform = suitablePlatforms[Math.floor(Math.random() * suitablePlatforms.length)];
                    
                    let newEnemy;
                    if (Math.random() < 0.3) { // 30% of ground enemies are Spitters (can be adjusted)
                        newEnemy = new SpitterEnemy(targetPlatform);
                    } else {
                        newEnemy = new GroundEnemy(targetPlatform);
                    }

                    // Calculate a valid spawn position on the platform that is on-screen
                    const minSpawnX = Math.max(targetPlatform.x, cameraX);
                    const maxSpawnX = Math.min(targetPlatform.x + targetPlatform.width - newEnemy.width, cameraX + canvas.width - newEnemy.width);
                    
                    if (maxSpawnX > minSpawnX) {
                        newEnemy.x = minSpawnX + Math.random() * (maxSpawnX - minSpawnX);
                        enemies.push(newEnemy);
                    }
                }
            }
            enemySpawnTimer = 0;
        }

        // Update and draw enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update();
            enemy.draw(context); // Draw relative to cameraX
            // Remove if completely off-screen to the left of the camera
            if (enemy.x + enemy.width < cameraX) { 
                enemies.splice(i, 1);
            }
        }
    }

    function handlePlatforms(context) {
        for (const platform of platforms) { // Draw relative to cameraX
            context.fillStyle = '#4a044e'; 
            context.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
        }
    }

    // Dynamic level generation (simple version)
    const PLATFORM_CHUNK_WIDTH = 800; // How wide each "chunk" of platforms is
    let lastPlatformX = 0; // Tracks the absolute X of the last generated platform

    function generateNewPlatforms() {
        // Only generate if cameraX has moved significantly past the last generated chunk
        // Generate when the right edge of the camera view is within one chunk width of the last generated platform
        if (cameraX + canvas.width > lastPlatformX - PLATFORM_CHUNK_WIDTH / 2) { 
            const currentChunkStart = lastPlatformX;

            // Add a new ground segment to ensure continuous ground
            const groundSegmentWidth = Math.random() * 300 + 200; // 200 to 500 width
            platforms.push({ x: currentChunkStart, y: canvas.height - 20, width: groundSegmentWidth, height: 20 });
            lastPlatformX = currentChunkStart + groundSegmentWidth;

            // Generate a few random floating platforms within this new chunk
            const numNewPlatforms = Math.floor(Math.random() * 3) + 1; // 1 to 3 new platforms
            for (let i = 0; i < numNewPlatforms; i++) {
                const newPlatformWidth = Math.random() * 250 + 100; // 100 to 350 width
                // Ensure platform is within the current chunk and doesn't overlap too much
                const newPlatformX = currentChunkStart + Math.random() * (PLATFORM_CHUNK_WIDTH - newPlatformWidth) + 50; 
                
                const newPlatformY = canvas.height - (Math.random() * 200 + 80); // Random height above ground
                platforms.push({ x: newPlatformX, y: newPlatformY, width: newPlatformWidth, height: 20 });
            }
        }
    }

    function checkPlatformCollisions() {
        for (const platform of platforms) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y < platform.y + platform.height && player.y + player.height > platform.y && player.vy >= 0 && (player.y + player.height - player.vy) <= platform.y + 1) { // Check for collision from above
                player.y = platform.y - player.height; player.vy = 0; player.isOnGround = true;
            }
        }
    }

    function checkCollisions() {
        // Player projectiles vs Enemies
        for (let i = projectiles.length - 1; i >= 0; i--) { 
            for (let j = enemies.length - 1; j >= 0; j--) {
                const p = projectiles[i];
                const e = enemies[j];
                if (p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
                    projectiles.splice(i, 1); 

                    e.health--;
                    if (e.health <= 0) {
                        createParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 15);
                        dnaDrops.push(new DnaDrop(e.x + e.width / 2, e.y + e.height / 2));
                        runState.score += e.scoreValue;
                        enemies.splice(j, 1);
                    }

                    break; // Projectile can only hit one enemy
                }
            }
        }

        // Player vs Enemy
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (player.x < e.x + e.width && player.x + player.width > e.x && player.y < e.y + e.height && player.y + player.height > e.y) {
                createParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 15);
                player.hit(20); // Player takes 20 damage on collision
            }
        }

        // Player vs DnaDrop
        for (let i = dnaDrops.length - 1; i >= 0; i--) {
            const d = dnaDrops[i];
            const dnaMagnetLevel = playerState.upgrades.dnaMagnet || 0;
            const collectionRadius = (player.width / 2 + d.size) + (dnaMagnetLevel * 15); const dist = Math.hypot(player.x + player.width / 2 - d.x, player.y + player.height / 2 - d.y); if (dist < collectionRadius) {
                runState.dnaCollected += d.value;
                dnaDrops.splice(i, 1);
            }
        }

        // Enemy projectiles vs Player
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const p = enemyProjectiles[i];
            if (p.x < player.x + player.width && p.x + p.width > player.x && p.y < player.y + player.height && p.y + p.height > player.y) {
                enemyProjectiles.splice(i, 1);
                player.hit(10); // Enemy projectiles do 10 damage
            }
        }
    }

    function startGame() {
        gameActive = true;
        player = new Player();
        enemies = [];
        projectiles = [];
        particles = [];
        enemyProjectiles = [];
        dnaDrops = [];
        cameraX = 0; // Reset camera position
        enemySpawnTimer = 0;
        platforms = [
            // Ground
            { x: 0, y: canvas.height - 20, width: canvas.width * 1.5, height: 20 }, // Initial long ground
            // Floating platforms
            { x: 200, y: canvas.height - 150, width: 150, height: 20 },
            { x: 450, y: canvas.height - 250, width: 200, height: 20 },
        ];
        // Check if Plasma Blaster is unlocked and add to available weapons
        if (playerState.upgrades.unlockPlasmaBlaster > 0) {
            player.availableWeapons.push('plasma');
        }
        player.currentWeapon = 'laser'; // Start with laser
        // Set lastPlatformX to the end of the initial ground platform
        lastPlatformX = platforms[0].x + platforms[0].width; 
        parallaxLayers = [
            new ParallaxLayer('#1e1b34', 0.2, 1), // Farthest, slowest
            new ParallaxLayer('#3b0764', 0.5, 1.5),
            new ParallaxLayer('#4a044e', 0.8, 2)  // Closest, fastest
        ];
        runState = { score: 0, dnaCollected: 0 };
        updateHud();
        gameLoop();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function gameOver() {
        gameActive = false;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, player.color, 50); // Player explosion

        // Add collected DNA to total and save
        playerState.dna += runState.dnaCollected;
        saveState();

        // Return to main menu after a delay
        setTimeout(() => {
            gameContainer.style.display = 'none';
            mainMenu.style.display = 'block';
        }, 2000);
    }

    function updateHud() {
        healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
        shieldBar.style.width = player.maxShield > 0 ? `${(player.shield / player.maxShield) * 100}%` : '0%';
        runDnaCounter.textContent = runState.dnaCollected;
        scoreCounter.textContent = runState.score;
        currentWeaponDisplay.textContent = player.currentWeapon.toUpperCase();
    }

    // --- INITIALIZATION ---
    function init() {
        loadState();
        player = new Player(); // Initialize player here to get its initial x for camera setup

        // --- Main Menu & Screen Transitions ---
        startGameButton.addEventListener('click', () => {
            mainMenu.style.display = 'none';
            evolutionChamberContainer.style.display = 'none'; // Ensure it's hidden
            gameContainer.style.display = 'block'; 
            startGame();
        });

        openBtn.addEventListener('click', () => {
            renderAll();
            evolutionChamberContainer.style.display = 'flex';
        });
        closeBtn.addEventListener('click', () => { evolutionChamberContainer.style.display = 'none'; });

        // --- Tab Logic ---
        outfitTab.addEventListener('click', () => {
            outfitTab.classList.add('active'); weaponTab.classList.remove('active');
            outfitSection.style.display = 'block'; weaponSection.style.display = 'none';
        });
        weaponTab.addEventListener('click', () => {
            weaponTab.classList.add('active'); outfitTab.classList.remove('active');
            weaponSection.style.display = 'block'; outfitSection.style.display = 'none';
        });

        // --- Purchase Logic ---
        evolutionChamberContainer.addEventListener('click', handlePurchase);

        // --- Input Listeners ---
        window.addEventListener('keydown', (e) => { keys[e.key] = true; });
        window.addEventListener('keyup', (e) => keys[e.key] = false);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    function gameLoop() {
        if (!gameActive) return;

        // --- Camera Update ---
        // The camera tries to keep the player in the middle of the screen.
        cameraX = player.x - canvas.width / 2;
        // Clamp camera to prevent showing area left of the world's start
        cameraX = Math.max(0, cameraX);

        // --- Drawing ---
        ctx.fillStyle = '#0c0a14'; // Clear with solid dark space background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const layer of parallaxLayers) { layer.draw(ctx, cameraX); }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.lifespan <= 0) {
                particles.splice(i, 1);
            }
        }

        // Update and draw DNA drops
        for (let i = dnaDrops.length - 1; i >= 0; i--) {
            const d = dnaDrops[i];
            d.update();
            d.draw(ctx);
            if (d.y > canvas.height) {
                dnaDrops.splice(i, 1);
            }
        }

        // Update and draw projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) { 
            const p = projectiles[i];
            p.update();
            p.draw(ctx);
            // Remove if off-screen relative to camera
            if (p.x > cameraX + canvas.width || p.x < cameraX) { 
                projectiles.splice(i, 1);
            }
        }

        // Update and draw enemy projectiles
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const p = enemyProjectiles[i];
            p.update();
            p.draw(ctx);
            if (p.x > cameraX + canvas.width || p.x < cameraX || p.y > canvas.height || p.y < 0) {
                enemyProjectiles.splice(i, 1);
            }
        }

        generateNewPlatforms(); // Call this before drawing platforms
        handlePlatforms(ctx);
        handleEnemies(ctx);
        player.update(keys);
        player.draw(ctx);
        checkPlatformCollisions();
        checkCollisions();
        updateHud();

        requestAnimationFrame(gameLoop);
    }

    init();
});