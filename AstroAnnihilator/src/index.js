import { init, gameLoop } from './game.js';
import { initializeUIElements, setupEventListeners, setGameSize, updateStartScreenInfo, updateUI } from './ui.js';
import { MOUSE_Y_OFFSET, score, highScore, starCredits, rawMaterials, materialsThisRun, hasPurchasedScoreBoost, spawnMultiplier, isPaused, isGameOver, gameFrame, waveCount, waveCredits, bombPurchaseCost, healthPurchaseCost, shieldPurchaseCost, mouse, currentBoss, scoreMultiplier, ghostTimer, spectreTimer, isAbilityHeld, screenShake, uiState, gameMode, fusionConfig, isCombineAllActive, shopCosts, musicInitialized, titleClickCount, defaultUpgrades, upgrades, UFO_TYPES, selectedUFO, unlockedUFOs, enemySpawnTable } from './gameData.js';
import { normalMusicLoopInstance, bossMusicLoopInstance } from './audio.js'; // Import actual Tone.js instances

// Expose global variables for canvas context and dimensions
window.canvas = document.getElementById('gameCanvas');
window.ctx = window.canvas.getContext('2d');
window.wrapper = document.getElementById('game-wrapper');
window.screenWidth = window.wrapper.clientWidth;
window.screenHeight = window.wrapper.clientHeight;

// Expose global game state variables for UI access
window.score = score;
window.highScore = highScore;
window.starCredits = starCredits;
window.rawMaterials = rawMaterials;
window.materialsThisRun = materialsThisRun;
window.hasPurchasedScoreBoost = hasPurchasedScoreBoost;
window.spawnMultiplier = spawnMultiplier;
window.isPaused = isPaused;
window.isGameOver = isGameOver;
window.gameFrame = gameFrame;
window.waveCount = waveCount;
window.waveCredits = waveCredits;
window.bombPurchaseCost = bombPurchaseCost;
window.healthPurchaseCost = healthPurchaseCost;
window.shieldPurchaseCost = shieldPurchaseCost;
window.mouse = mouse;
window.currentBoss = currentBoss;
window.scoreMultiplier = scoreMultiplier;
window.ghostTimer = ghostTimer;
window.spectreTimer = spectreTimer;
window.isAbilityHeld = isAbilityHeld;
window.screenShake = screenShake;
window.uiState = uiState;
window.gameMode = gameMode;
window.fusionConfig = fusionConfig;
window.isCombineAllActive = isCombineAllActive;
window.shopCosts = shopCosts;
window.musicInitialized = musicInitialized;
window.normalMusicLoop = normalMusicLoopInstance; // Use the actual Tone.js instance
window.bossMusicLoop = bossMusicLoopInstance;     // Use the actual Tone.js instance
window.titleClickCount = titleClickCount;
window.defaultUpgrades = defaultUpgrades;
window.upgrades = upgrades;
window.UFO_TYPES = UFO_TYPES;
window.selectedUFO = selectedUFO;
window.unlockedUFOs = unlockedUFOs;
window.enemySpawnTable = enemySpawnTable;

// Expose UI elements globally for event listeners
window.uiElements = initializeUIElements(); // Initialize once here

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners(window.canvas, window.wrapper); // Pass uiElements implicitly via window.uiElements
    setGameSize(window.wrapper, window.canvas);
    updateUI(true);
    updateStartScreenInfo();
    window.showModal(window.uiElements.startScreen); // Use window.showModal
});
