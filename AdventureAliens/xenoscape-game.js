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
    let gameActive = false;
    let player;
    let keys = {};
    let projectiles = [];
    let enemies = [];
    let particles = [];
    let dnaDrops = [];
    let platforms = [];
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
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fill();
            context.strokeStyle = '#a7f3d0'; // Emerald-200
            context.lineWidth = 2;
            context.stroke();
        }
    }

    class Projectile {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 15;
            this.height = 5;
            this.speed = 10;
            this.color = '#34d399'; // Emerald-400
        }

        update() {
            this.x += this.speed;
        }

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Player {
        constructor() {
            this.width = 40;
            this.height = 30;
            this.x = 100;
            this.y = canvas.height / 2 - this.height / 2;
            this.vx = 0;
            this.vy = 0;
            this.maxSpeed = 7;
            this.friction = 0.85;
            this.gravity = 0.6;
            this.jumpStrength = -14;
            this.isOnGround = false;

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

        update(keys) {
            // --- Horizontal Movement ---
            if (keys['a'] || keys['ArrowLeft']) this.vx -= 1.2;
            if (keys['d'] || keys['ArrowRight']) this.vx += 1.2;

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

            this.isOnGround = false; // Assume not on ground until collision check

            // Shooting
            if (this.shootCooldown > 0) this.shootCooldown--;
            if (keys[' '] && this.shootCooldown <= 0) { // Spacebar to shoot
                this.shoot();
            }

            if (this.y > canvas.height) gameOver(); // Fell off the world
        }

        shoot() {
            projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2 - 2.5));
            this.shootCooldown = this.fireRate;
        }

        warp() {
            const warpDirection = this.vx === 0 ? 1 : Math.sign(this.vx);
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
            if (this.isWarping) {
                context.fillStyle = '#f0abfc'; // Fuchsia-300
                context.globalAlpha = 0.5;
                context.fillRect(this.x, this.y, this.width, this.height);
                context.globalAlpha = 1.0;
            }
            context.fillStyle = this.color; context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class FlyingEnemy { // Renamed from Enemy for clarity
        constructor() {
            this.width = 30;
            this.height = 30;
            this.x = canvas.width;
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
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class GroundEnemy {
        constructor(platform) {
            this.width = 40;
            this.height = 40;
            // Spawn randomly on the given platform
            this.x = platform.x + Math.random() * (platform.width - this.width);
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
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
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
            if (Math.random() < 0.7) { // 70% chance for flying enemy
                enemies.push(new FlyingEnemy());
            } else { // 30% chance for ground enemy
                // Find the main ground platform to spawn on
                const groundPlatform = platforms.find(p => p.y === canvas.height - 20);
                if (groundPlatform) { enemies.push(new GroundEnemy(groundPlatform)); }
            }
            enemySpawnTimer = 0;
        }

        // Update and draw
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update();
            enemy.draw(context);
            if (enemy instanceof FlyingEnemy && enemy.x + enemy.width < 0) { // Only flying enemies go off-screen
                enemies.splice(i, 1);
            }
        }
    }

    function handlePlatforms(context) {
        for (const platform of platforms) {
            context.fillStyle = '#4a044e'; // Dark purple for platforms
            context.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    }

    function checkPlatformCollisions() {
        for (const platform of platforms) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y < platform.y + platform.height && player.y + player.height > platform.y && player.vy >= 0 && (player.y + player.height - player.vy) <= platform.y + 1) {
                player.y = platform.y - player.height; player.vy = 0; player.isOnGround = true;
            }
        }
    }

    function checkCollisions() {
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
                createParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 15); enemies.splice(i, 1);
                enemies.splice(i, 1);
                player.hit(20); // Player takes 20 damage on collision
            }
        }

        // Player vs DnaDrop
        for (let i = dnaDrops.length - 1; i >= 0; i--) {
            const d = dnaDrops[i];
            const dnaMagnetLevel = playerState.upgrades.dnaMagnet || 0;
            const collectionRadius = (player.width / 2 + d.size) + (dnaMagnetLevel * 15);
            const dist = Math.hypot(player.x + player.width / 2 - d.x, player.y + player.height / 2 - d.y); if (dist < collectionRadius) {
                runState.dnaCollected += d.value;
                dnaDrops.splice(i, 1);
            }
        }
    }

    function startGame() {
        gameActive = true;
        player = new Player();
        enemies = [];
        projectiles = [];
        particles = [];
        dnaDrops = [];
        enemySpawnTimer = 0;
        platforms = [
            // Ground
            { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 },
            // Floating platforms
            { x: 200, y: canvas.height - 150, width: 150, height: 20 },
            { x: 450, y: canvas.height - 250, width: 200, height: 20 },
            { x: 700, y: canvas.height - 100, width: 100, height: 20 },
            { x: 900, y: canvas.height - 200, width: 180, height: 20 },
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
    }

    // --- INITIALIZATION ---
    function init() {
        loadState();

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
        window.addEventListener('keydown', (e) => keys[e.key] = true);
        window.addEventListener('keyup', (e) => keys[e.key] = false);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    function gameLoop() {
        if (!gameActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            if (p.x > canvas.width) {
                projectiles.splice(i, 1);
            }
        }

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