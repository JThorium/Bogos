import {
    MOUSE_Y_OFFSET, score, highScore, starCredits, rawMaterials, materialsThisRun,
    hasPurchasedScoreBoost, spawnMultiplier, isPaused, isGameOver, gameFrame,
    waveCount, waveCredits, bombPurchaseCost, healthPurchaseCost, shieldPurchaseCost,
    mouse, currentBoss, scoreMultiplier, ghostTimer, spectreTimer, isAbilityHeld,
    screenShake, uiState, gameMode, fusionConfig, isCombineAllActive, shopCosts,
    musicInitialized, normalMusicLoop, bossMusicLoop, titleClickCount,
    defaultUpgrades, upgrades, UFO_TYPES, selectedUFO, unlockedUFOs, enemySpawnTable,
    setScore, setHighScore, setStarCredits, setRawMaterials, setMaterialsThisRun,
    setHasPurchasedScoreBoost, setSpawnMultiplier, setIsPaused, setIsGameOver,
    setGameFrame, setWaveCount, setWaveCredits, setBombPurchaseCost,
    setHealthPurchaseCost, setShieldPurchaseCost, setMouse, setCurrentBoss,
    setScoreMultiplier, setGhostTimer, setSpectreTimer, setIsAbilityHeld,
    setScreenShake, setUiState, setGameMode, setFusionConfig, setIsCombineAllActive,
    setShopCosts, setMusicInitialized, setNormalMusicLoop, setBossMusicLoop,
    setTitleClickCount, setSelectedUFO, setUnlockedUFOs, setUpgrades
} from './gameData.js';
import { initAudio, startMusic, stopMusic, sfx } from './audio.js';
import { Player } from './player.js';
import { Enemy, Boss } from './enemies.js';
import { Star, Particle, PowerUp, RawMaterialPickup, Obstacle, Nebula } from './entities.js';
import {
    hideAllModals, showModal, handleGameOverUI,
    updateShipSelector, buyUFO, updateHangarUI, updatePauseMenuUI,
    updateHangarLikeUI, buyUpgrade, showInGameShopUI, updateFusionLabUI,
    addShipToFusion, clearFusion, activateCombineAll, updateStartScreenInfo,
    updateUI, resizeCanvas, setGameSize, setupEventListeners, initializeUIElements
} from './ui.js';

// Global game variables (will be initialized in init)
export let player;
export let stars;
export let powerups = [];
export let obstacles = [];
export let playerBullets = [];
export let enemyBullets = [];
export let enemies = [];
export let particles = [];
export let turrets = [];
export let nebulae = [];

export let canvas, ctx, wrapper;

export async function init() {
    console.log('init() function called in game.js');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    wrapper = document.getElementById('game-wrapper');

    // initializeUIElements() is now called in index.js

    if (!musicInitialized) {
        // Ensure Tone.js context is running. This requires a user gesture.
        // The start button click will trigger this.
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        initAudio();
        window.uiElements.audioStatusEl.textContent = 'Audio Ready!';
        setTimeout(() => { window.uiElements.audioStatusEl.textContent = ''; }, 2000);
    }

    setGameSize(wrapper, canvas);
    setScore(0);
    setWaveCount(0);
    setWaveCredits(0);
    setMaterialsThisRun(0);
    setShopCosts({ shield: 75, bomb: 125, minion: 200, health: 150 });
    setIsPaused(false);
    setIsGameOver(false);
    setGameFrame(0);
    setIsAbilityHeld(false);

    if (hasPurchasedScoreBoost) {
        setScore(Math.floor(highScore / 3));
        setHasPurchasedScoreBoost(false);
        localStorage.setItem('hasPurchasedScoreBoost', 'false');
    }

    player = new Player();
    stars = Array.from({ length: 150 }, () => new Star());
    nebulae = Array.from({ length: 3 }, () => new Nebula());
    particles.length = 0;
    powerups.length = 0;
    enemies.length = 0;
    playerBullets.length = 0;
    enemyBullets.length = 0;
    turrets.length = 0;
    obstacles.length = 0;
    setCurrentBoss(null);
    setGhostTimer(0);
    setSpectreTimer(0);

    updateUI(true);
    hideAllModals();
    window.uiElements.bottomUiContainer.style.display = 'flex';
    startMusic(false);
    gameLoop();
}

export function gameLoop() {
    if (isGameOver) return;
    if (player && player.health <= 0) {
        if (player.abilities.phoenix && !player.phoenixUsed) {
            player.phoenixUsed = true;
            player.health = Math.ceil(player.baseHealth / 2);
            player.shield = 0;
            setGhostTimer(180);
            createExplosion(player.x, player.y, UFO_TYPES.phoenix.color, 30);
            sfx.unlock.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n');
        } else {
            setIsGameOver(true);
            createExplosion(player.x, player.y, player.ufo.color, 40);
            handleGameOverUI();
            return;
        }
    }
    if (isPaused) return;
    requestAnimationFrame(gameLoop);

    ctx.save();
    try {
        if (screenShake.duration > 0) {
            const dx = (Math.random() - 0.5) * screenShake.intensity;
            const dy = (Math.random() - 0.5) * screenShake.intensity;
            ctx.translate(dx, dy);
            setScreenShake(screenShake.intensity * 0.9, screenShake.duration - 1);
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, window.screenWidth, window.screenHeight);

        setGameFrame(gameFrame + 1);
        if (ghostTimer > 0) setGhostTimer(ghostTimer - 1);

        nebulae.forEach(n => { n.update(); n.draw(); });
        stars.forEach(s => { s.update(); s.draw(); });
        handleObstacles();
        handleBullets(playerBullets, enemies.concat(currentBoss ? [currentBoss] : []).concat(obstacles));
        handleBullets(enemyBullets, [player].concat(turrets));
        handleEnemies();
        handlePowerups();

        if (currentBoss) handleBoss();

        particles.forEach((p, i) => {
            p.update();
            p.draw();
            if (p.lifespan <= 0 || p.size < 0.5) particles.splice(i, 1);
        });

        if (player) { player.update(); player.draw(); }

        if (!isPaused) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        WaveManager.update();
        updateUI();
    } finally {
        ctx.restore();
    }
}

export const WaveManager = {
    nextBossScore: 7500,
    update: function () {
        if (currentBoss || isPaused) return;

        if (score >= this.nextBossScore) {
            this.spawnBoss();
            this.nextBossScore += 10000 + this.nextBossScore * 0.2;
        } else {
            // Asteroid field segment (e.g., every 10,000 score after the first boss, for 2000 score duration)
            const asteroidSegmentStart = 10000;
            const segmentDuration = 2000;
            const segmentInterval = 10000; // How often the segment repeats

            const inAsteroidSegment = (score > asteroidSegmentStart) &&
                                       ((score - asteroidSegmentStart) % segmentInterval < segmentDuration);

            if (inAsteroidSegment) {
                if (gameFrame % 30 === 0 && obstacles.filter(o => o.type === 'asteroid').length < 30) {
                    obstacles.push(new Obstacle('asteroid'));
                }
            } else {
                // Normal enemy spawning
                if (gameFrame % 100 === 0 && enemies.length < 15 * spawnMultiplier) {
                    const availableTypes = enemySpawnTable.filter(e => score >= e.score).flatMap(e => e.types);
                    const waveSize = Math.min(5, 1 + Math.floor(score / 4000)) * spawnMultiplier;
                    for (let i = 0; i < waveSize; i++) {
                        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                        enemies.push(new Enemy(type));
                    }
                }
            }

            // Blackhole spawning (less frequent, higher score)
            if (score > 50000 && gameFrame % 900 === 0 && !obstacles.some(o => o.type === 'blackhole')) {
                obstacles.push(new Obstacle('blackhole'));
            }

            // Quasar spawning (e.g., every 25,000 score, not during asteroid segment)
            if (score > 25000 && gameFrame % 1500 === 0 && !obstacles.some(o => o.type === 'quasar') && !inAsteroidSegment) {
                obstacles.push(new Quasar());
            }

            // Magnetar spawning (e.g., every 40,000 score, not during asteroid segment)
            if (score > 40000 && gameFrame % 2000 === 0 && !obstacles.some(o => o.type === 'magnetar') && !inAsteroidSegment) {
                obstacles.push(new Magnetar());
            }
        }
    },
    spawnBoss: function () {
        enemies.length = 0;
        setWaveCount(waveCount + 1);
        const bossModel = (waveCount % 2 !== 0) ? BOSS_MODEL_1 : BOSS_MODEL_2;
        setCurrentBoss(new Boss(bossModel));
        window.uiElements.bossNameEl.textContent = currentBoss.name;
        window.uiElements.bossHealthBarContainer.style.display = 'block';
        startMusic(true);
    }
};

export function handleBoss() {
    currentBoss.update();
    currentBoss.draw();
}

export function handleEnemies() {
    for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = enemies[eIndex];
        enemy.update();
        enemy.draw();

        if (enemy.y > window.screenHeight + enemy.size) {
            enemies.splice(eIndex, 1);
            continue;
        }

        if (enemy.type === 'kamikaze' && isColliding(enemy, player)) {
            player.hit();
            enemy.health = 0;
        }

        if (!isColliding(enemy, player)) continue;

        let isIntangible = ghostTimer > 0 || (player.abilities.spectre && spectreTimer > 480) || (player.abilityState.name === 'ghost' && player.abilityState.active) || (player.abilityState.name === 'juggernaut' && player.abilityState.active);
        if (!isIntangible) {
            player.hit();
            createExplosion(enemy.x, enemy.y, enemy.color, 10);
            enemies.splice(eIndex, 1);
        }
    }
}

export function handleObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.update();
        o.draw();
        if (o.y > window.screenHeight + o.size || o.lifespan <= 0) obstacles.splice(i, 1);
    }
}

export function handleBullets(bullets, targets) {
    for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = bullets[bIndex];
        if (!bullet) { bullets.splice(bIndex, 1); continue; }
        bullet.update();
        bullet.draw();

        if (bullet.y < -30 || bullet.y > window.screenHeight + 10 || bullet.x < -10 || bullet.x > window.screenWidth + 10) {
            bullets.splice(bIndex, 1);
            continue;
        }

        for (let tIndex = 0; tIndex < targets.length; tIndex++) {
            const target = targets[tIndex];
            if (!target) continue;
            if (target.health <= 0 && !(target instanceof Obstacle && target.type === 'blackhole')) continue;

            if (isColliding(bullet, target)) {
                if (target.health <= 0) continue;
                bullets.splice(bIndex, 1);
                if (target instanceof Player) {
                    target.hit();
                } else if (target instanceof Sentry) {
                    // Sentry takes no damage from enemy bullets
                } else if (target instanceof Obstacle && target.type === 'asteroid') {
                    if (target.takeDamage(bullet.damage)) {
                        createExplosion(target.x, target.y, target.color, 5);
                        if (Math.random() < 0.3) powerups.push(new RawMaterialPickup(target.x, target.y));
                        const obsIdx = obstacles.indexOf(target);
                        if (obsIdx > -1) obstacles.splice(obsIdx, 1);
                    }
                } else if (target instanceof Enemy) {
                    if (bullet.canSlow) target.slowTimer = 180;
                    if (target.takeDamage(bullet.damage)) {
                        target.onDeath();
                        createExplosion(target.x, target.y, target.color, 10);
                        let creditDrop = 5;
                        if (player.abilities.alchemist && Math.random() < 0.25) creditDrop = 25;
                        addScore(100 + (Object.keys(ENEMY_MODELS).indexOf(target.type) * 10));
                        setWaveCredits(waveCredits + creditDrop);
                        if (player.abilities.reaper) player.reaperBoost = 120;
                        if (Math.random() < 0.15) powerups.push(new PowerUp(target.x, target.y));
                        const enemyIndex = enemies.indexOf(target);
                        if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
                    }
                } else if (target instanceof Boss) {
                    addScore(50);
                    if (target.takeDamage(bullet.damage)) {
                        createExplosion(target.x, target.y, target.color, 80);
                        addScore(5000);
                        setWaveCredits(waveCredits + 250);
                        setMaterialsThisRun(materialsThisRun + 10);
                        setCurrentBoss(null);
                        window.uiElements.bossHealthBarContainer.style.display = 'none';
                        startMusic(false);
                        showInGameShopUI();
                    }
                }
                break;
            }
        }
    }
}

export function handlePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.update();
        p.draw();

        if (p.y > window.screenHeight + 10) {
            powerups.splice(i, 1);
            continue;
        }

        if (isColliding(p, player)) {
            const collectedPowerup = powerups.splice(i, 1)[0];
            if (!collectedPowerup) continue;
            sfx.powerup.triggerAttackRelease('C5', '4n');
            const powerupTime = 300 + (upgrades.powerupDuration.level * 60);
            if (collectedPowerup.type === 'shield') player.shield++;
            else if (collectedPowerup.type === 'minion') player.addMinion();
            else if (collectedPowerup.type === 'ghost') setGhostTimer(powerupTime);
            else if (collectedPowerup.type === 'bomb') player.bombs++;
            else if (collectedPowerup.type === 'material') { setMaterialsThisRun(materialsThisRun + 1); }
        }
    }
}

export function addScore(amount) {
    setScore(score + amount * scoreMultiplier);
    checkUnlocks();
}

export function createExplosion(x, y, color, count) {
    sfx.explosion.triggerAttackRelease(0.15);
    triggerScreenShake(count / 4, 10);
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, color, Math.random() * 2 + 1, 25));
}

export function isColliding(a, b) {
    if (!a || !b) return false;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy) < (a.size + b.size);
}

export function triggerScreenShake(intensity, duration) {
    setScreenShake(Math.max(screenShake.intensity, intensity * 0.2), Math.max(screenShake.duration, duration));
}

export function checkUnlocks() {
    let changed = false;
    for (const key in UFO_TYPES) {
        if (key === 'interceptor') continue;
        const ufo = UFO_TYPES[key];
        if (ufo.unlockMethod === 'score' && score >= ufo.unlockScore && !unlockedUFOs.has(key)) {
            unlockedUFOs.add(key);
            sfx.unlock.triggerAttackRelease(['C5', 'E5', 'G5'], '4n');
            changed = true;
        }
    }
    if (changed) localStorage.setItem('unlockedUFOs', JSON.stringify([...unlockedUFOs]));
}

export function quitToMainMenu() {
    setIsPaused(true);
    setIsGameOver(false);
    player = null;
    enemies.length = 0;
    playerBullets.length = 0;
    enemyBullets.length = 0;
    powerups.length = 0;
    turrets.length = 0;
    obstacles.length = 0;
    setCurrentBoss(null);
    setGhostTimer(0);
    setSpectreTimer(0);
    setGameFrame(0);
    window.uiElements.bottomUiContainer.style.display = 'none';
    hideAllModals();
    showModal(window.uiElements.startScreen);
    updateStartScreenInfo();
    setScore(0);
    setWaveCredits(0);
    updateUI(true);
    stopMusic();
}

export function togglePause() {
    setIsPaused(!isPaused);
    if (isPaused) {
        updatePauseMenuUI();
        showModal(window.uiElements.pauseScreen);
        Tone.Transport.pause();
    } else {
        hideAllModals();
        Tone.Transport.start();
        gameLoop();
    }
}

export function useBombAction() {
    if (!isPaused && player) player.useBomb();
}
