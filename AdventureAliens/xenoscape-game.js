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

    class Player {
        constructor() {
            this.width = 40;
            this.height = 30;
            this.x = 100;
            this.y = canvas.height / 2 - this.height / 2;
            this.speed = 5;
            this.color = '#9333ea'; // A distinct purple for Xylar
        }

        update(keys) {
            let vy = 0;
            if (keys['w'] || keys['ArrowUp']) {
                vy = -this.speed;
            }
            if (keys['s'] || keys['ArrowDown']) {
                vy = this.speed;
            }
            this.y += vy;

            // Boundary checks
            if (this.y < 0) this.y = 0;
            if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
        }

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    function startGame() {
        gameActive = true;
        player = new Player();
        // Reset run-specific stats here in the future
        gameLoop();
    }

    function gameLoop() {
        if (!gameActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.update(keys);
        player.draw(ctx);

        requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

    init();
});