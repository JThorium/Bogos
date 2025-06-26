import { init, gameLoop, quitToMainMenu, togglePause, useBombAction, canvas, ctx, wrapper } from './game.js';
import { initializeUIElements, setupEventListeners, setGameSize, updateStartScreenInfo, updateUI } from './ui.js';
import { MOUSE_Y_OFFSET, score, highScore, starCredits, rawMaterials, materialsThisRun, hasPurchasedScoreBoost, spawnMultiplier, isPaused, isGameOver, gameFrame, waveCount, waveCredits, bombPurchaseCost, healthPurchaseCost, shieldPurchaseCost, mouse, currentBoss, scoreMultiplier, ghostTimer, spectreTimer, isAbilityHeld, screenShake, uiState, gameMode, fusionConfig, isCombineAllActive, shopCosts, musicInitialized, normalMusicLoop, bossMusicLoop, titleClickCount, defaultUpgrades, upgrades, UFO_TYPES, selectedUFO, unlockedUFOs, enemySpawnTable } from './gameData.js';

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
window.normalMusicLoop = normalMusicLoop;
window.bossMusicLoop = bossMusicLoop;
window.titleClickCount = titleClickCount;
window.defaultUpgrades = defaultUpgrades;
window.upgrades = upgrades;
window.UFO_TYPES = UFO_TYPES;
window.selectedUFO = selectedUFO;
window.unlockedUFOs = unlockedUFOs;
window.enemySpawnTable = enemySpawnTable;

// Expose UI elements globally for event listeners
import {
    scoreEl, highScoreEl, healthEl, shieldEl, creditsEl, bombsEl,
    abilityChargeUI, abilityChargeEl, modalContainer, startScreen, pauseScreen,
    gameOverScreen, hangarScreen, inGameShop, devScreen, pauseButton, startButton,
    resumeButton, restartButton, hangarButton, hangarBackButton, quitButton,
    continueButton, devButton, resetProgressButton, gameTitle, finalScoreEl,
    creditsEarnedEl, materialsFoundEl, shopCreditsEl, shopItemsEl,
    bossHealthBarContainer, bossHealthEl, bossNameEl, bottomUiContainer,
    bombButtonLeft, bombButtonRight, abilityButton, audioStatusEl, hangarView,
    hangarViewHeader, hangarCreditsEl, hangarMaterialsEl, sellMaterialButton,
    metaGrid, upgradeGrid, hangarShipSelector, toFusionLabButton, fusionLabView,
    fusionLabViewHeader, fusionCreditsEl, fusionSlotsAvailableEl, fusionSlotsContainer,
    fusionShipSource, toHangarButton, clearFusionButton, combineAllButton, gameModeInfoEl,
    pauseStarCreditsEl, pauseShipSelectorEl, pauseUpgradeGridEl, pauseBuyGridEl,
    devScoreInputEl, devSetScoreButton, devCreditsInputEl, devSetCreditsButton,
    devMaterialsInputEl, devSetMaterialsButton, devUnlockAllButton, devBackButton
} from './ui.js';

window.scoreEl = scoreEl;
window.highScoreEl = highScoreEl;
window.healthEl = healthEl;
window.shieldEl = shieldEl;
window.creditsEl = creditsEl;
window.bombsEl = bombsEl;
window.abilityChargeUI = abilityChargeUI;
window.abilityChargeEl = abilityChargeEl;
window.modalContainer = modalContainer;
window.startScreen = startScreen;
window.pauseScreen = pauseScreen;
window.gameOverScreen = gameOverScreen;
window.hangarScreen = hangarScreen;
window.inGameShop = inGameShop;
window.devScreen = devScreen;
window.pauseButton = pauseButton;
window.startButton = startButton;
window.resumeButton = resumeButton;
window.restartButton = restartButton;
window.hangarButton = hangarButton;
window.hangarBackButton = hangarBackButton;
window.quitButton = quitButton;
window.continueButton = continueButton;
window.devButton = devButton;
window.resetProgressButton = resetProgressButton;
window.gameTitle = gameTitle;
window.finalScoreEl = finalScoreEl;
window.creditsEarnedEl = creditsEarnedEl;
window.materialsFoundEl = materialsFoundEl;
window.shopCreditsEl = shopCreditsEl;
window.shopItemsEl = shopItemsEl;
window.bossHealthBarContainer = bossHealthBarContainer;
window.bossHealthEl = bossHealthEl;
window.bossNameEl = bossNameEl;
window.bottomUiContainer = bottomUiContainer;
window.bombButtonLeft = bombButtonLeft;
window.bombButtonRight = bombButtonRight;
window.abilityButton = abilityButton;
window.audioStatusEl = audioStatusEl;
window.hangarView = hangarView;
window.hangarViewHeader = hangarViewHeader;
window.hangarCreditsEl = hangarCreditsEl;
window.hangarMaterialsEl = hangarMaterialsEl;
window.sellMaterialButton = sellMaterialButton;
window.metaGrid = metaGrid;
window.upgradeGrid = upgradeGrid;
window.hangarShipSelector = hangarShipSelector;
window.toFusionLabButton = toFusionLabButton;
window.fusionLabView = fusionLabView;
window.fusionLabViewHeader = fusionLabViewHeader;
window.fusionCreditsEl = fusionCreditsEl;
window.fusionSlotsAvailableEl = fusionSlotsAvailableEl;
window.fusionSlotsContainer = fusionSlotsContainer;
window.fusionShipSource = fusionShipSource;
window.toHangarButton = toHangarButton;
window.clearFusionButton = clearFusionButton;
window.combineAllButton = combineAllButton;
window.gameModeInfoEl = gameModeInfoEl;
window.pauseStarCreditsEl = pauseStarCreditsEl;
window.pauseShipSelectorEl = pauseShipSelectorEl;
window.pauseUpgradeGridEl = pauseUpgradeGridEl;
window.pauseBuyGridEl = pauseBuyGridEl;
window.devScoreInputEl = devScoreInputEl;
window.devSetScoreButton = devSetScoreButton;
window.devCreditsInputEl = devCreditsInputEl;
window.devSetCreditsButton = devSetCreditsButton;
window.devMaterialsInputEl = devMaterialsInputEl;
window.devSetMaterialsButton = devSetMaterialsButton;
window.devUnlockAllButton = devUnlockAllButton;
window.devBackButton = devBackButton;

document.addEventListener('DOMContentLoaded', () => {
    initializeUIElements();
    setupEventListeners(canvas, wrapper);
    setGameSize(wrapper, canvas);
    updateUI(true);
    updateStartScreenInfo();
    showModal(startScreen);
});
