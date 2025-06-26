import * as THREE from 'three';
import { gameToThreeJS, resizeCanvas } from './gameUtils.js';
import { Player, setPlayerDependencies } from './player.js';
import { LaserProjectile, PlasmaProjectile, EnemyProjectile, setProjectileDependencies } from './projectiles.js';
import { FlyingEnemy, GroundEnemy, SpitterEnemy, setEnemyDependencies } from './enemies.js';
import { Particle, createParticles, setParticleDependencies } from './particles.js';
import { DnaDrop, setDnaDropDependencies } from './dnaDrop.js';
import { ParallaxLayer, setParallaxLayerDependencies } from './parallaxLayer.js';
import { PLATFORM_CHUNK_WIDTH, lastPlatformX, platformPatterns, generateNewPlatforms, addPlatformMesh, checkPlatformCollisions, setPlatformDependencies } from './platforms.js';
import { upgradeData } from './upgradeData.js';
import { setUIManagerDependencies } from './uiManager.js';

document.addEventListener('DOMContentLoaded', () => {
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
    const enemySpawnInterval = 240; // Spawn an enemy every 4 seconds at 60fps for more deliberate encounters
    let runState = { score: 0, dnaCollected: 0 };

    let killedEnemies = new Set(); // Stores IDs of enemies that have been killed

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
    // handlePurchase is now imported from uiManager.js

    // --- GAME LOGIC ---
    const canvas = document.getElementById('gameCanvas');
    let scene, camera, renderer;

    // Three.js setup
    function setupThreeJS() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0c0a14); // Dark space background

        // Add more prominent lighting
        const ambientLight = new THREE.AmbientLight(0x606060); // Softer ambient light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Brighter directional light
        directionalLight.position.set(50, 100, 100).normalize(); // Positioned to cast light from front-top-right
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5, 500); // Additional point light
        pointLight.position.set(0, 50, 50);
        scene.add(pointLight);

        // Set initial camera position
        camera.position.z = 300; // Closer to the action
        camera.position.y = 50; // Slightly above the center
        camera.position.x = 0; // Start centered horizontally
    }

    // Helper to convert 2D game coordinates to 3D Three.js coordinates
    // Assuming game coordinates (0,0) is top-left and canvas.height is max Y
    // Three.js (0,0,0) is center, Y-up, Z-out

    function handleEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.x < cameraX + window.innerWidth && enemy.x + enemy.width > cameraX) {
                enemy.update(cameraX); // Pass cameraX to enemy update
            } else if (enemy.x + enemy.width < cameraX) {
                enemy.remove(); // Remove mesh from scene
                enemies.splice(i, 1);
            }
        }
    }

    function handlePlatforms() {
        for (const platform of platforms) {
            // No drawing logic here, as platforms are Three.js meshes added to the scene
        }
    }


    function checkCollisions() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const p = projectiles[i];
                const e = enemies[j];
                // Simple AABB collision
                if (p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
                    p.remove(); // Remove mesh from scene
                    projectiles.splice(i, 1);

                    e.health--;
                    if (e.health <= 0) {
                        createParticles(e.x + e.width / 2, e.y + e.height / 2, e.mesh.material.color.getHex(), 15);
                        dnaDrops.push(new DnaDrop(e.x + e.width / 2, e.y + e.height / 2));
                        runState.score += e.scoreValue;
                        if (e.id) {
                            killedEnemies.add(e.id);
                        }
                        e.remove(); // Remove mesh from scene
                        enemies.splice(j, 1);
                    }

                    break;
                }
            }
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (player.x < e.x + e.width && player.x + player.width > e.x && player.y < e.y + e.height && player.y + player.height > e.y) {
                createParticles(e.x + e.width / 2, e.y + e.height / 2, e.mesh.material.color.getHex(), 15);
                player.hit(20);
            }
        }

        for (let i = dnaDrops.length - 1; i >= 0; i--) {
            const d = dnaDrops[i];
            const dnaMagnetLevel = playerState.upgrades.dnaMagnet || 0;
            const collectionRadius = (player.width / 2 + d.size) + (dnaMagnetLevel * 15);
            const dist = Math.hypot(player.x + player.width / 2 - d.x, player.y + player.height / 2 - d.y);

            if (dist < collectionRadius) {
                runState.dnaCollected += d.value;
                d.remove(); // Remove mesh from scene
                dnaDrops.splice(i, 1);
                continue;
            }

            for (const platform of platforms) {
                if (d.x < platform.x + platform.width && d.x + d.size > platform.x &&
                    d.y < platform.y + platform.height && d.y + d.size > platform.y &&
                    d.speedY > 0 && (d.y + d.size - d.speedY) <= platform.y + 1) {
                    d.y = platform.y - d.size;
                    d.speedY = 0;
                    break;
                }
            }
        }

        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const p = enemyProjectiles[i];
            if (p.x < player.x + player.width && p.x + p.width > player.x && p.y < player.y + player.height && p.y + p.height > player.y) {
                p.remove(); // Remove mesh from scene
                enemyProjectiles.splice(i, 1);
                player.hit(10);
            }
        }
    }

        function startGame() {
            gameActive = true;
            player = new Player(); // Instantiate Player without arguments
            enemies = [];
            projectiles = [];
            particles = [];
            enemyProjectiles = [];
            dnaDrops = [];
            cameraX = 0;
            enemySpawnTimer = 0;
            killedEnemies.clear();

            // Clear existing meshes from scene, but keep lights
            const objectsToRemove = scene.children.filter(child => !(child instanceof THREE.Light));
            objectsToRemove.forEach(child => {
                scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            // Re-add lights (already done in setupThreeJS, no need to call again)
            // setupThreeJS(); // Removed this line as it re-adds lights and clears scene

            platforms = []; // Clear platforms
            const initialPlatform = { x: 0, y: window.innerHeight - 40, width: 500, height: 40 };
            platforms.push(initialPlatform);
            addPlatformMesh(initialPlatform);
            lastPlatformX = initialPlatform.x + initialPlatform.width;

            if (playerState.upgrades.unlockPlasmaBlaster > 0) {
                player.availableWeapons.push('plasma');
            }
            player.currentWeapon = 'laser';

            // Add laser sight to player
            player.addLaserSight();

            parallaxLayers = [
                new ParallaxLayer(0x1e1b34, 0.05, 1), // Farthest, slowest
                new ParallaxLayer(0x3b0764, 0.1, 1.5),
                new ParallaxLayer(0x4a044e, 0.2, 2)  // Closest, fastest
            ];
            runState = { score: 0, dnaCollected: 0 };
            updateHud();
            gameLoop();
        }


    function gameOver() {
        gameActive = false;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, player.mesh.material.color.getHex(), 50);

        playerState.dna += runState.dnaCollected;
        saveState();

        setTimeout(() => {
            gameContainer.style.display = 'none';
            mainMenu.style.display = 'block';
            // Clean up Three.js objects from the scene
            scene.children.forEach(child => {
                if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
                    scene.remove(child);
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                }
            });
        }, 2000);
    }

    function updateHud() {
        healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
        shieldBar.style.width = player.maxShield > 0 ? `${(player.shield / player.maxShield) * 100}%` : '0%';
        runDnaCounter.textContent = runState.dnaCollected;
        scoreCounter.textContent = runState.score;
        currentWeaponDisplay.textContent = player.currentWeapon.toUpperCase();
    }

    function init() {
        loadState();
        setupThreeJS(); // Initialize Three.js here

        // Set dependencies for imported modules
        // gameUtils does not need dependencies set, it exports functions directly
        setPlayerDependencies({ gameToThreeJS, playerState, projectiles, createParticles, gameOver, updateHud, scene });
        setEnemyDependencies({ gameToThreeJS, scene, player, enemyProjectiles, createParticles, dnaDrops, runState, killedEnemies });
        setProjectileDependencies({ gameToThreeJS, scene });
        setParticleDependencies({ gameToThreeJS, scene, particlesArray: particles });
        setDnaDropDependencies({ gameToThreeJS, scene });
        setParallaxLayerDependencies({ scene });
        setPlatformDependencies({ gameToThreeJS, scene, cameraX, platforms });
        setUIManagerDependencies({ playerState, upgradeData, saveState, dnaCounter, outfitGrid, weaponGrid });

        startGameButton.addEventListener('click', () => {
            mainMenu.style.display = 'none';
            evolutionChamberContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            startGame();
        });

        openBtn.addEventListener('click', () => {
            renderAll();
            evolutionChamberContainer.style.display = 'flex';
        });
        closeBtn.addEventListener('click', () => { evolutionChamberContainer.style.display = 'none'; });

        outfitTab.addEventListener('click', () => {
            outfitTab.classList.add('active'); weaponTab.classList.remove('active');
            outfitSection.style.display = 'block'; weaponSection.style.display = 'none';
        });
        weaponTab.addEventListener('click', () => {
            weaponTab.classList.add('active'); outfitTab.classList.remove('active');
            weaponSection.style.display = 'block'; outfitSection.style.display = 'none';
        });

        evolutionChamberContainer.addEventListener('click', handlePurchase);

        window.addEventListener('keydown', (e) => { keys[e.key] = true; });
        window.addEventListener('keyup', (e) => keys[e.key] = false);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    function gameLoop() {
        if (!gameActive) return;

        // Update camera position to follow player
        camera.position.x = player.mesh.position.x;
        camera.position.y = player.mesh.position.y + 100; // Keep camera slightly above player

        // Update parallax layers
        for (const layer of parallaxLayers) { layer.update(player.x); }

        // Enemy spawning logic
        enemySpawnTimer++;
        if (enemySpawnTimer >= enemySpawnInterval) {
            const enemyType = Math.random();
            let newEnemy;
            if (enemyType < 0.4) { // 40% flying
                newEnemy = new FlyingEnemy();
            } else { // 60% ground or spitter
                // Find a suitable platform to spawn on
                const suitablePlatforms = platforms.filter(p =>
                    p.x + p.width > cameraX + window.innerWidth / 2 && // Platform is ahead of player
                    p.y > window.innerHeight / 2 // Platform is not too high
                );
                if (suitablePlatforms.length > 0) {
                    const platform = suitablePlatforms[Math.floor(Math.random() * suitablePlatforms.length)];
                    if (enemyType < 0.7) { // 30% ground
                        newEnemy = new GroundEnemy(platform);
                    } else { // 30% spitter
                        newEnemy = new SpitterEnemy(platform);
                    }
                }
            }
            if (newEnemy) {
                enemies.push(newEnemy);
            }
            enemySpawnTimer = 0;
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            if (p.lifespan <= 0) {
                p.remove();
                particles.splice(i, 1);
            }
        }

        for (let i = dnaDrops.length - 1; i >= 0; i--) {
            const d = dnaDrops[i];
            d.update();
            if (d.y > window.innerHeight + 50) { // Remove if off-screen
                d.remove();
                dnaDrops.splice(i, 1);
            }
        }

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update();
            if (Math.abs(p.x - player.x) > window.innerWidth / 2 + 100) { // Remove if far off-screen
                p.remove();
                projectiles.splice(i, 1);
            }
        }

        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const p = enemyProjectiles[i];
            p.update();
            if (Math.abs(p.x - player.x) > window.innerWidth / 2 + 100 || p.y > window.innerHeight + 50 || p.y < -50) {
                p.remove();
                enemyProjectiles.splice(i, 1);
            }
        }

        generateNewPlatforms();
        handlePlatforms(); // No drawing, just managing platform objects
        handleEnemies();
        player.update(keys);
        checkPlatformCollisions(player); // Pass player only
        checkCollisions();
        updateHud();

        renderer.render(scene, camera); // Render the Three.js scene

        requestAnimationFrame(gameLoop);
    }

    init();
});
