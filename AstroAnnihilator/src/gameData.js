export const MOUSE_Y_OFFSET = 80; // Player ship vertical offset

export let score = 0;
export let highScore = parseInt(localStorage.getItem('highScore') || '0');
export let starCredits = parseInt(localStorage.getItem('starCredits') || '0');
export let rawMaterials = parseInt(localStorage.getItem('rawMaterials') || '0');
export let materialsThisRun = 0;
export let hasPurchasedScoreBoost = JSON.parse(localStorage.getItem('hasPurchasedScoreBoost') || 'false');
export let spawnMultiplier = parseInt(localStorage.getItem('spawnMultiplier') || '1');
export let isPaused = true;
export let isGameOver = false;
export let gameFrame = 0;
export let waveCount = 0;
export let waveCredits = 0;
export let bombPurchaseCost = 500;
export let healthPurchaseCost = 500;
export let shieldPurchaseCost = 750;
export let mouse = { x: 0, y: 0 };
export let currentBoss = null;
export let scoreMultiplier = 1;
export let ghostTimer = 0;
export let spectreTimer = 0;
export let isAbilityHeld = false;
export let screenShake = { intensity: 0, duration: 0 };
export let uiState = { score: -1, health: -1, shield: -1, credits: -1, bombs: -1, highScore: -1, ability: -1 };
export let gameMode = localStorage.getItem('gameMode') || 'classic';
export let fusionConfig = JSON.parse(localStorage.getItem('fusionConfig') || '[]');
export let isCombineAllActive = JSON.parse(localStorage.getItem('isCombineAllActive') || 'false');
export let shopCosts;
export let musicInitialized = false;
export let normalMusicLoop;
export let bossMusicLoop;
export let titleClickCount = 0;

export const defaultUpgrades = { startShield: { level: 0, maxLevel: 10, cost: 100, costIncrease: 150, matCost: 1, matIncrease: 1, name: "Start Shield" }, startMinion: { level: 0, maxLevel: 10, cost: 500, costIncrease: 500, matCost: 5, matIncrease: 2, name: "Start Minion" }, fireRate: { level: 0, maxLevel: 10, cost: 250, costIncrease: 250, matCost: 2, matIncrease: 2, name: "Fire Rate" }, startBomb: { level: 0, maxLevel: 10, cost: 750, costIncrease: 750, matCost: 3, matIncrease: 1, name: "Start Bomb" }, powerupDuration: { level: 0, maxLevel: 10, cost: 400, costIncrease: 400, matCost: 2, matIncrease: 1, name: "Powerup Duration" }, creditBonus: { level: 0, maxLevel: 10, cost: 1000, costIncrease: 1000, matCost: 10, matIncrease: 5, name: "Credit Bonus" } };
export let upgrades = JSON.parse(localStorage.getItem('upgrades')) || JSON.parse(JSON.stringify(defaultUpgrades));

export const UFO_TYPES = {
    interceptor: { name: 'Interceptor', color: '#34d399', fireRate: 10, ability: 'Hold for Rapid Fire burst.' },
    destroyer:   { name: 'Destroyer', unlockMethod: 'score', unlockScore: 5000, color: '#f59e0b', fireRate: 8, ability: 'Starts with 1 Minion. Hold for homing minion fire.' },
    sentinel:    { name: 'Sentinel', unlockMethod: 'score', unlockScore: 15000, color: '#60a5fa', fireRate: 10, ability: 'Starts with +1 Shield. Hold to consume a shield for a defensive nova.' },
    ghost:       { name: 'Ghost', unlockMethod: 'score', unlockScore: 30000, color: '#f0f9ff', fireRate: 10, ability: 'Brief invincibility after hit. Hold to manually phase out.' },
    warlock:     { name: 'Warlock', unlockMethod: 'score', unlockScore: 50000, color: '#c084fc', fireRate: 10, ability: 'Fires homing shots. Hold to charge a powerful homing missile swarm.' },
    juggernaut:  { name: 'Juggernaut', unlockMethod: 'score', unlockScore: 75000, color: '#fca5a5', fireRate: 10, ability: 'Starts with 6 HP. Hold for a brief, invincible ramming charge.' },
    vortex:      { name: 'Vortex', unlockMethod: 'score', unlockScore: 100000, color: '#2dd4bf', fireRate: 10, ability: 'Pulls in powerups. Hold to create a bullet-sucking singularity.' },
    reaper:      { name: 'Reaper', unlockMethod: 'score', unlockScore: 150000, color: '#9ca3af', fireRate: 9, ability: 'Hold to create a field that converts enemies and bullets into Raw Materials.' },
    paladin:     { name: 'Paladin', unlockMethod: 'credits', cost: 2500, color: '#fde047', fireRate: 10, ability: 'Absorbs shots to charge laser. Hold to fire continuous laser beam.' },
    spectre:     { name: 'Spectre', unlockMethod: 'credits', cost: 4000, color: '#a5f3fc', fireRate: 10, ability: 'Periodically intangible. Hold to charge a short-range teleport.' },
    alchemist:   { name: 'Alchemist', unlockMethod: 'credits', cost: 5000, color: '#d946ef', fireRate: 10, ability: 'Hold to transmute nearby bullets to credits & give kills a chance to drop powerups.' },
    engineer:    { name: 'Engineer', unlockMethod: 'credits', cost: 7500, color: '#f97316', fireRate: 10, ability: 'Hold to deploy a temporary, mobile Sentry that follows you.' },
    chronomancer:{ name: 'Chronomancer', unlockMethod: 'credits', cost: 10000, color: '#818cf8', fireRate: 10, ability: 'Shots can slow enemies. Hold to create a large time-slowing field.' },
    berserker:   { name: 'Berserker', unlockMethod: 'credits', cost: 6000, color: '#ef4444', fireRate: 10, ability: 'Fire rate increases as health drops. Hold to sacrifice health for a massive damage boost.' },
    phoenix:     { name: 'Phoenix', unlockMethod: 'credits', cost: 12000, color: '#fdba74', fireRate: 10, ability: 'Revives once. Hold to consume revive for a screen-clearing nova, full heal, & invincibility.' },
    omega:       { name: 'Omega', unlockMethod: 'credits', cost: 999999999999, color: '#ffffff', fireRate: 5, ability: 'The ultimate form. All abilities, double health & fire rate. Hold to cycle abilities.' }
};
export let selectedUFO = localStorage.getItem('selectedUFO') || 'interceptor';
export let unlockedUFOs = new Set(JSON.parse(localStorage.getItem('unlockedUFOs')) || ['interceptor']);

export const enemySpawnTable = [ { score: 0, types: ['grunt'] }, { score: 2000, types: ['dasher'] }, { score: 5000, types: ['tank'] }, { score: 8000, types: ['weaver'] }, { score: 12000, types: ['dodger'] }, { score: 18000, types: ['splitter'] }, { score: 25000, types: ['sniper'] }, { score: 35000, types: ['kamikaze'] }, { score: 50000, types: ['orbiter'] }, { score: 75000, types: ['stealth'] } ];

// Functions to update game state variables
export function setScore(value) { score = value; }
export function setHighScore(value) { highScore = value; }
export function setStarCredits(value) { starCredits = value; }
export function setRawMaterials(value) { rawMaterials = value; }
export function setMaterialsThisRun(value) { materialsThisRun = value; }
export function setHasPurchasedScoreBoost(value) { hasPurchasedScoreBoost = value; }
export function setSpawnMultiplier(value) { spawnMultiplier = value; }
export function setIsPaused(value) { isPaused = value; }
export function setIsGameOver(value) { isGameOver = value; }
export function setGameFrame(value) { gameFrame = value; }
export function setWaveCount(value) { waveCount = value; }
export function setWaveCredits(value) { waveCredits = value; }
export function setBombPurchaseCost(value) { bombPurchaseCost = value; }
export function setHealthPurchaseCost(value) { healthPurchaseCost = value; }
export function setShieldPurchaseCost(value) { shieldPurchaseCost = value; }
export function setMouse(x, y) { mouse.x = x; mouse.y = y; }
export function setCurrentBoss(value) { currentBoss = value; }
export function setScoreMultiplier(value) { scoreMultiplier = value; }
export function setGhostTimer(value) { ghostTimer = value; }
export function setSpectreTimer(value) { spectreTimer = value; }
export function setIsAbilityHeld(value) { isAbilityHeld = value; }
export function setScreenShake(intensity, duration) { screenShake.intensity = intensity; screenShake.duration = duration; }
export function setUiState(key, value) { uiState[key] = value; }
export function setGameMode(value) { gameMode = value; }
export function setFusionConfig(value) { fusionConfig = value; }
export function setIsCombineAllActive(value) { isCombineAllActive = value; }
export function setShopCosts(value) { shopCosts = value; }
export function setMusicInitialized(value) { musicInitialized = value; }
export function setNormalMusicLoop(value) { normalMusicLoop = value; }
export function setBossMusicLoop(value) { bossMusicLoop = value; }
export function setTitleClickCount(value) { titleClickCount = value; }
export function setSelectedUFO(value) { selectedUFO = value; }
export function setUnlockedUFOs(value) { unlockedUFOs = value; }
export function setUpgrades(value) { upgrades = value; }
